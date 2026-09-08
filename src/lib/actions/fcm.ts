/**
 * Firebase Cloud Messaging device token management
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, assertSelfOrAdmin } from "@/lib/auth-server";
import { getFirebaseWebConfig, isFcmConfigured } from "@/lib/fcm";
import type { ActionResult } from "./courses";

export async function getFcmConfig() {
  return {
    serverConfigured: isFcmConfigured(),
    web: getFirebaseWebConfig(),
  };
}

export async function registerFcmToken(
  userId: string,
  input: { token: string; platform?: string; label?: string }
): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const token = input.token.trim();
  if (token.length < 20) return { success: false, error: "Invalid device token." };

  await db.fcmDeviceToken.upsert({
    where: { token },
    create: {
      userId,
      token,
      platform: input.platform ?? "web",
      label: input.label ?? null,
    },
    update: {
      userId,
      platform: input.platform ?? "web",
      label: input.label ?? null,
    },
  });

  revalidatePath("/dashboard/settings/notifications");
  return { success: true, data: undefined };
}

export async function removeFcmToken(userId: string, token: string): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  await db.fcmDeviceToken.deleteMany({ where: { userId, token } });
  revalidatePath("/dashboard/settings/notifications");
  return { success: true, data: undefined };
}

export async function removeAllFcmTokens(userId: string): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  await db.fcmDeviceToken.deleteMany({ where: { userId } });
  revalidatePath("/dashboard/settings/notifications");
  return { success: true, data: undefined };
}

export async function getUserFcmTokenCount(userId: string): Promise<number> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);
  return db.fcmDeviceToken.count({ where: { userId } });
}
