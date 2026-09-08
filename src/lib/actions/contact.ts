"use server";

import { z } from "zod";
import { sendEmail } from "@/lib/email";

const schema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(5000),
});

export type ContactResult = { success: true } | { success: false; error: string };

export async function submitContactForm(input: z.infer<typeof schema>): Promise<ContactResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Please check your entries and try again." };
  }

  const { name, email, subject, message } = parsed.data;
  const inbox = process.env.CONTACT_INBOX ?? process.env.GMAIL_USER ?? "hello@ujuzilab.com";

  const emailResult = await sendEmail({
    to: inbox,
    subject: `[UjuziLab Contact] ${subject}`,
    html: `
      <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr/>
      <p>${message.replace(/\n/g, "<br/>")}</p>
    `,
  });
  if (!emailResult.ok) {
    return { success: false, error: "Could not send your message. Please email us directly." };
  }
  return { success: true };
}
