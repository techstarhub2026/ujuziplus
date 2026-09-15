/**
 * Platform-wide settings (singleton row) — admin-managed site config.
 */
"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "./courses";
import { requireAdmin } from "@/lib/auth-server";

const SETTINGS_ID = "singleton";

export type HomeBackgroundMode = "tile" | "cover";
export type ParticlesInteraction = "repel" | "attract";
export type ParticlesScope = "full" | "belowFeatured";

export interface ParticlesSettingsInput {
  particlesEnabled: boolean;
  particlesColors: string;
  particlesRainbowMode: boolean;
  particlesSpeed: number;
  particlesConnectDistance: number;
  particlesLineThickness: number;
  particlesInteraction: ParticlesInteraction;
  particlesScope: ParticlesScope;
  particlesIntensity: number;
}

const getPlatformSettingsCached = unstable_cache(
  async () =>
    db.platformSettings.upsert({
      where: { id: SETTINGS_ID },
      update: {},
      create: { id: SETTINGS_ID },
    }),
  ["platform-settings"],
  { revalidate: 300, tags: ["platform-settings"] }
);

export async function getPlatformSettings() {
  return getPlatformSettingsCached();
}

export async function updateHomeSectionBackground(
  homeSectionBackgroundUrl: string | null,
  homeSectionBackgroundMode: HomeBackgroundMode = "tile"
): Promise<ActionResult> {
  await requireAdmin();

  await db.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { homeSectionBackgroundUrl, homeSectionBackgroundMode },
    create: { id: SETTINGS_ID, homeSectionBackgroundUrl, homeSectionBackgroundMode },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidateTag("platform-settings");
  return { success: true, data: undefined };
}

export async function updateParticlesSettings(
  input: ParticlesSettingsInput
): Promise<ActionResult> {
  await requireAdmin();

  await db.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    update: { ...input },
    create: { id: SETTINGS_ID, ...input },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidateTag("platform-settings");
  return { success: true, data: undefined };
}

/**
 * ClickPesa API credentials.
 *
 * Kept here rather than in environment variables so an operator can rotate
 * them from the console without a redeploy — production had no CLICKPESA_*
 * variables at all, which is why checkout failed with "Invalid client
 * details" for every payment.
 *
 * A blank field clears the stored value and falls back to the environment.
 * The cached auth token is dropped so new keys apply to the next payment
 * rather than after the old token expires an hour later.
 */
export async function updateClickPesaCredentials(input: {
  clientId: string;
  apiKey: string;
  webhookSecret: string;
}): Promise<ActionResult> {
  await requireAdmin();

  const data = {
    clickpesaClientId: input.clientId.trim() || null,
    clickpesaApiKey: input.apiKey.trim() || null,
    clickpesaWebhookSecret: input.webhookSecret.trim() || null,
  };

  await db.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });

  const { resetClickPesaToken } = await import("@/lib/clickpesa");
  resetClickPesaToken();

  revalidatePath("/admin/settings");
  revalidateTag("platform-settings");
  return { success: true, data: undefined };
}
