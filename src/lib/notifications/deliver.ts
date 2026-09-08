/**
 * Deliver notifications — in-app record + optional email
 */
import { db } from "@/lib/db";
import type { NotificationType } from "@prisma/client";
import { sendEmail, notificationEmail } from "@/lib/email";
import { notificationCategory } from "@/lib/notifications/categories";

export async function deliverNotificationEmail(
  userId: string,
  input: {
    type: NotificationType;
    title: string;
    message: string;
    href?: string;
    prefCategory?: string;
  }
): Promise<void> {
  const category = input.prefCategory ?? notificationCategory(input.type);

  const [user, pref] = await Promise.all([
    db.user.findUnique({
      where: { id: userId },
      select: { email: true, fullName: true },
    }),
    db.notificationPreference.findUnique({
      where: { userId_category: { userId, category } },
    }),
  ]);

  if (!user?.email) return;

  const emailEnabled = pref?.emailEnabled ?? true;
  if (!emailEnabled) return;

  try {
    const result = await sendEmail({
      to: user.email,
      subject: `[UjuziLab] ${input.title}`,
      html: notificationEmail({
        fullName: user.fullName,
        title: input.title,
        message: input.message,
        href: input.href,
      }),
    });
    if (!result.ok) {
      console.error("Notification email failed:", result.error);
    }
  } catch (err) {
    console.error("Notification email failed:", err);
  }
}
