/**
 * Web Push subscription management
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, assertSelfOrAdmin } from "@/lib/auth-server";
import { getVapidPublicKey, isPushConfigured } from "@/lib/push";
import type { ActionResult } from "./courses";

export async function getPushConfig() {
  return {
    configured: isPushConfigured(),
    publicKey: getVapidPublicKey(),
  };
}

export async function savePushSubscription(
  userId: string,
  input: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    userAgent?: string;
  }
): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  if (!input.endpoint || !input.keys.p256dh || !input.keys.auth) {
    return { success: false, error: "Invalid subscription." };
  }

  await db.pushSubscription.upsert({
    where: {
      userId_endpoint: { userId, endpoint: input.endpoint },
    },
    create: {
      userId,
      endpoint: input.endpoint,
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: input.userAgent ?? null,
    },
    update: {
      p256dh: input.keys.p256dh,
      auth: input.keys.auth,
      userAgent: input.userAgent ?? null,
    },
  });

  revalidatePath("/dashboard/settings/notifications");
  return { success: true, data: undefined };
}

export async function removePushSubscription(
  userId: string,
  endpoint: string
): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  await db.pushSubscription.deleteMany({
    where: { userId, endpoint },
  });

  revalidatePath("/dashboard/settings/notifications");
  return { success: true, data: undefined };
}

export async function removeAllPushSubscriptions(userId: string): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  await db.pushSubscription.deleteMany({ where: { userId } });
  revalidatePath("/dashboard/settings/notifications");
  return { success: true, data: undefined };
}

export async function getUserPushSubscriptionCount(userId: string): Promise<number> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);
  return db.pushSubscription.count({ where: { userId } });
}
