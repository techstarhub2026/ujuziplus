/**
 * Notification preferences — persisted per user
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, assertSelfOrAdmin } from "@/lib/auth-server";
import type { ActionResult } from "./courses";
import { NOTIFICATION_PREF_CATEGORIES } from "@/lib/notifications/categories";

export type NotificationPrefRow = {
  category: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
};

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPrefRow[]> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const rows = await db.notificationPreference.findMany({ where: { userId } });
  const byCategory = new Map(rows.map((r) => [r.category, r]));

  return NOTIFICATION_PREF_CATEGORIES.map((category) => {
    const row = byCategory.get(category);
    return {
      category,
      emailEnabled: row?.emailEnabled ?? true,
      inAppEnabled: row?.inAppEnabled ?? true,
      pushEnabled: row?.pushEnabled ?? false,
    };
  });
}

export async function saveNotificationPreferences(
  userId: string,
  prefs: NotificationPrefRow[]
): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  for (const p of prefs) {
    if (!NOTIFICATION_PREF_CATEGORIES.includes(p.category as (typeof NOTIFICATION_PREF_CATEGORIES)[number])) {
      continue;
    }
    await db.notificationPreference.upsert({
      where: { userId_category: { userId, category: p.category } },
      create: {
        userId,
        category: p.category,
        emailEnabled: p.emailEnabled,
        inAppEnabled: p.inAppEnabled,
        pushEnabled: p.pushEnabled,
      },
      update: {
        emailEnabled: p.emailEnabled,
        inAppEnabled: p.inAppEnabled,
        pushEnabled: p.pushEnabled,
      },
    });
  }

  revalidatePath("/dashboard/settings/notifications");
  return { success: true, data: undefined };
}
