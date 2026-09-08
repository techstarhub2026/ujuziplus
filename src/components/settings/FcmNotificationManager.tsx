"use client";

import { useState, useEffect, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Smartphone, SmartphoneNfc } from "lucide-react";
import {
  registerFcmToken,
  removeAllFcmTokens,
} from "@/lib/actions/fcm";
import { useAppStore } from "@/store/appStore";

type WebConfig = {
  configured: true;
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string | null;
};

export function FcmNotificationManager({
  userId,
  serverConfigured,
  webConfig,
  initialRegistered,
}: {
  userId: string;
  serverConfigured: boolean;
  webConfig: WebConfig | { configured: false };
  initialRegistered: boolean;
}) {
  const showToast = useAppStore((s) => s.showToast);
  const [registered, setRegistered] = useState(initialRegistered);
  const [manualToken, setManualToken] = useState("");
  const [supported, setSupported] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "Notification" in window);
  }, []);

  const saveToken = (token: string, platform = "web") => {
    startTransition(async () => {
      const res = await registerFcmToken(userId, { token, platform });
      if (res.success) {
        setRegistered(true);
        showToast("Mobile push registered", "success");
      } else showToast(res.error ?? "Failed to register token", "error");
    });
  };

  const enableWithFirebase = () => {
    if (!webConfig.configured) {
      showToast("Firebase web config is missing.", "error");
      return;
    }
    if (!webConfig.vapidKey) {
      showToast("Set NEXT_PUBLIC_FIREBASE_VAPID_KEY for web FCM.", "error");
      return;
    }

    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          showToast("Notification permission denied", "error");
          return;
        }

        const { initializeApp, getApps } = await import("firebase/app");
        const { getMessaging, getToken, isSupported } = await import("firebase/messaging");

        if (!(await isSupported())) {
          showToast("FCM is not supported in this browser.", "error");
          return;
        }

        const cfg = webConfig as WebConfig;
        const app =
          getApps().length > 0
            ? getApps()[0]
            : initializeApp({
                apiKey: cfg.apiKey,
                authDomain: cfg.authDomain,
                projectId: cfg.projectId,
                messagingSenderId: cfg.messagingSenderId,
                appId: cfg.appId,
              });

        const reg = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        const messaging = getMessaging(app);
        const token = await getToken(messaging, {
          vapidKey: cfg.vapidKey!,
          serviceWorkerRegistration: reg,
        });

        if (!token) {
          showToast("Could not obtain FCM token", "error");
          return;
        }

        saveToken(token, "web");
      } catch (e) {
        console.error(e);
        showToast("Could not enable Firebase push", "error");
      }
    });
  };

  const disable = () => {
    startTransition(async () => {
      const res = await removeAllFcmTokens(userId);
      if (res.success) {
        setRegistered(false);
        showToast("Mobile push disabled", "success");
      }
    });
  };

  if (!serverConfigured) {
    return (
      <Card className="p-4 text-sm text-gray-500">
        Firebase push is not configured. Add FIREBASE_PROJECT_ID and FIREBASE_SERVICE_ACCOUNT_JSON
        on the server.
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-medium text-sm flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            Firebase mobile push (FCM)
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Delivers to registered device tokens — web browsers and native apps using the same FCM
            project.
          </p>
        </div>
        {registered ? (
          <Button variant="outline" size="sm" disabled={isPending} onClick={disable}>
            <SmartphoneNfc className="h-4 w-4 mr-2" />
            Remove all tokens
          </Button>
        ) : webConfig.configured && supported ? (
          <Button size="sm" disabled={isPending} onClick={enableWithFirebase}>
            Enable on this device
          </Button>
        ) : null}
      </div>

      {!registered && (
        <div className="border-t pt-4 space-y-2">
          <p className="text-xs text-gray-500">
            Or paste a device token manually (useful for native app testing):
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Input
              label="FCM device token"
              placeholder="e.g. from Firebase console or mobile SDK"
              value={manualToken}
              onChange={(e) => setManualToken(e.target.value)}
              className="flex-1 font-mono text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              disabled={isPending || manualToken.trim().length < 20}
              onClick={() => saveToken(manualToken.trim(), "manual")}
            >
              Register token
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
