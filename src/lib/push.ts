/**
 * Web Push — VAPID + delivery (requires env keys)
 */
import webpush from "web-push";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@ujuzilab.com";

export function isPushConfigured(): boolean {
  return !!(publicKey && privateKey && publicKey.length > 20);
}

export function getVapidPublicKey(): string | null {
  return publicKey ?? null;
}

function configureVapid() {
  if (!isPushConfigured()) return false;
  webpush.setVapidDetails(subject, publicKey!, privateKey!);
  return true;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

export async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload
): Promise<boolean> {
  if (!configureVapid()) return false;

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return true;
  } catch (err: unknown) {
    const status = (err as { statusCode?: number })?.statusCode;
    if (status === 404 || status === 410) return false;
    console.error("Web push failed:", err);
    return false;
  }
}
