/**
 * Notification server actions
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { NotificationType } from "@prisma/client";
import { assertActor } from "@/lib/auth-server";
import type { ActionResult } from "./courses";
import { notificationCategory } from "@/lib/notifications/categories";
import { deliverNotificationEmail } from "@/lib/notifications/deliver";
import { deliverNotificationPush } from "@/lib/notifications/deliver-push";
import { deliverNotificationFcm } from "@/lib/notifications/deliver-fcm";

export async function createNotification(
  userId: string,
  input: {
    type: NotificationType;
    title: string;
    message: string;
    href?: string;
    prefCategory?: string;
  }
) {
  const category = input.prefCategory ?? notificationCategory(input.type);
  const pref = await db.notificationPreference.findUnique({
    where: { userId_category: { userId, category } },
  });
  const inAppEnabled = pref?.inAppEnabled ?? true;

  let notification = null;
  if (inAppEnabled) {
    notification = await db.notification.create({
      data: {
        userId,
        type: input.type,
        title: input.title,
        message: input.message,
        href: input.href ?? null,
      },
    });
  }

  await Promise.all([
    deliverNotificationEmail(userId, { ...input, prefCategory: category }),
    deliverNotificationPush(userId, { ...input, prefCategory: category }),
    deliverNotificationFcm(userId, { ...input, prefCategory: category }),
  ]);

  if (notification) {
    revalidatePath("/dashboard/notifications");
  }

  return notification;
}

export async function getNotifications(userId: string, limit = 30) {
  await assertActor(userId);

  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string): Promise<number> {
  await assertActor(userId);

  return db.notification.count({ where: { userId, isRead: false } });
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
): Promise<ActionResult> {
  await assertActor(userId);

  await db.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  });
  revalidatePath("/dashboard/notifications");
  return { success: true, data: undefined };
}

export async function markAllRead(userId: string): Promise<ActionResult> {
  await assertActor(userId);

  await db.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/dashboard/notifications");
  return { success: true, data: undefined };
}

export async function deleteNotification(
  userId: string,
  notificationId: string
): Promise<ActionResult> {
  await assertActor(userId);

  await db.notification.deleteMany({ where: { id: notificationId, userId } });
  revalidatePath("/dashboard/notifications");
  return { success: true, data: undefined };
}
