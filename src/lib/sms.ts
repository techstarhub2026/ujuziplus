/**
 * Beem Africa SMS — Tanzania delivery.
 * Configure: BEEM_API_KEY, BEEM_SECRET_KEY, BEEM_SENDER_ID
 * Docs: https://beem.africa/sms/send
 */

export type SmsResult = { ok: true; messageId?: string } | { ok: false; error: string };

const isConfigured =
  !!process.env.BEEM_API_KEY &&
  !!process.env.BEEM_SECRET_KEY &&
  !process.env.BEEM_API_KEY.startsWith("your-");

function normalizeTzPhone(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("255") && digits.length >= 12) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `255${digits.slice(1)}`;
  if (digits.length === 9) return `255${digits}`;
  return null;
}

export async function sendSms(to: string, message: string): Promise<SmsResult> {
  const recipient = normalizeTzPhone(to);
  if (!recipient) {
    return { ok: false, error: "Invalid Tanzania phone number." };
  }

  if (!isConfigured) {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "SMS is not configured (BEEM_API_KEY / BEEM_SECRET_KEY)." };
    }
    console.log("\n📱 ─── SMS (dev console fallback) ───────────────");
    console.log("To:", recipient);
    console.log("Message:", message);
    console.log("─────────────────────────────────────────────────\n");
    return { ok: true };
  }

  const senderId = process.env.BEEM_SENDER_ID ?? "UJUZILAB";
  const auth = Buffer.from(
    `${process.env.BEEM_API_KEY}:${process.env.BEEM_SECRET_KEY}`
  ).toString("base64");

  try {
    const res = await fetch("https://apisms.beem.africa/v1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        source_addr: senderId,
        schedule_time: "",
        encoding: 0,
        message,
        recipients: [{ recipient_id: "1", dest_addr: recipient }],
      }),
    });

    const data = (await res.json()) as { successful?: boolean; message?: string; request_id?: string };
    if (!res.ok || data.successful === false) {
      return { ok: false, error: data.message ?? `SMS API error (${res.status})` };
    }
    return { ok: true, messageId: data.request_id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to send SMS";
    console.error("SMS send failed:", err);
    return { ok: false, error: msg };
  }
}

export function mentorSessionReminderSms(opts: {
  mentorName: string;
  scheduledAt: Date;
  meetingUrl?: string | null;
}) {
  const when = opts.scheduledAt.toLocaleString("en-TZ", {
    timeZone: "Africa/Dar_es_Salaam",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const link = opts.meetingUrl ? ` Link: ${opts.meetingUrl}` : "";
  return `UjuziLab: Your mentorship session with ${opts.mentorName} is tomorrow at ${when}.${link}`;
}
