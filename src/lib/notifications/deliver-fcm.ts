import { db } from "@/lib/db";
import { sendFcmMessage, isFcmConfigured } from "@/lib/fcm";
import { notificationCategory } from "@/lib/notifications/categories";
import type { NotificationType } from "@prisma/client";

export async function deliverNotificationFcm(
  userId: string,
  input: {
    type: NotificationType;
    title: string;
    message: string;
    href?: string;
    prefCategory?: string;
  }
): Promise<void> {
  if (!isFcmConfigured()) return;

  const category = input.prefCategory ?? notificationCategory(input.type);
  const pref = await db.notificationPreference.findUnique({
    where: { userId_category: { userId, category } },
  });
  if (pref && !pref.pushEnabled) return;

  const tokens = await db.fcmDeviceToken.findMany({ where: { userId } });
  if (tokens.length === 0) return;

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = input.href ? `${base}${input.href}` : `${base}/dashboard/notifications`;

  const stale: string[] = [];

  for (const row of tokens) {
    const ok = await sendFcmMessage(row.token, {
      title: input.title,
      body: input.message,
      url,
    });
    if (!ok) stale.push(row.token);
  }

  if (stale.length > 0) {
    await db.fcmDeviceToken.deleteMany({
      where: { userId, token: { in: stale } },
    });
  }
}
