import * as admin from "firebase-admin";

let initialized = false;

export function isFcmConfigured(): boolean {
  return !!(
    process.env.FIREBASE_PROJECT_ID &&
    (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.GOOGLE_APPLICATION_CREDENTIALS)
  );
}

function ensureFirebase(): admin.app.App | null {
  if (!isFcmConfigured()) return null;
  if (initialized && admin.apps.length > 0) return admin.app();

  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    const serviceAccount = JSON.parse(json) as admin.ServiceAccount;
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.FIREBASE_PROJECT_ID,
    });
  }

  initialized = true;
  return admin.app();
}

export async function sendFcmMessage(
  token: string,
  payload: { title: string; body: string; url?: string }
): Promise<boolean> {
  const app = ensureFirebase();
  if (!app) return false;

  try {
    await admin.messaging(app).send({
      token,
      notification: { title: payload.title, body: payload.body },
      webpush: payload.url
        ? { fcmOptions: { link: payload.url } }
        : undefined,
      data: payload.url ? { url: payload.url } : undefined,
    });
    return true;
  } catch (err: unknown) {
    const code =
      err && typeof err === "object" && "code" in err
        ? String((err as { code: string }).code)
        : "";
    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      return false;
    }
    console.error("FCM send failed:", err);
    return false;
  }
}

export function getFirebaseWebConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const messagingSenderId = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !projectId || !messagingSenderId || !appId) {
    return { configured: false as const };
  }

  return {
    configured: true as const,
    apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? `${projectId}.firebaseapp.com`,
    projectId,
    messagingSenderId,
    appId,
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? null,
  };
}
