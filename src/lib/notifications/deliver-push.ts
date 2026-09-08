import { db } from "@/lib/db";
import { sendWebPush, isPushConfigured } from "@/lib/push";
import { notificationCategory } from "@/lib/notifications/categories";
import type { NotificationType } from "@prisma/client";

export async function deliverNotificationPush(
  userId: string,
  input: {
    type: NotificationType;
    title: string;
    message: string;
    href?: string;
    prefCategory?: string;
  }
): Promise<void> {
  if (!isPushConfigured()) return;

  const category = input.prefCategory ?? notificationCategory(input.type);
  const pref = await db.notificationPreference.findUnique({
    where: { userId_category: { userId, category } },
  });
  if (pref && !pref.pushEnabled) return;

  const subs = await db.pushSubscription.findMany({ where: { userId } });
  if (subs.length === 0) return;

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const url = input.href ? `${base}${input.href}` : `${base}/dashboard/notifications`;

  const stale: string[] = [];

  for (const sub of subs) {
    const ok = await sendWebPush(
      { endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth },
      { title: input.title, body: input.message, url }
    );
    if (!ok) stale.push(sub.endpoint);
  }

  if (stale.length > 0) {
    await db.pushSubscription.deleteMany({
      where: { userId, endpoint: { in: stale } },
    });
  }
}
