"use client";

import { useState, useEffect, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import {
  savePushSubscription,
  removeAllPushSubscriptions,
} from "@/lib/actions/push";
import { useAppStore } from "@/store/appStore";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

export function PushNotificationManager({
  userId,
  vapidPublicKey,
  pushConfigured,
  initialSubscribed,
}: {
  userId: string;
  vapidPublicKey: string | null;
  pushConfigured: boolean;
  initialSubscribed: boolean;
}) {
  const showToast = useAppStore((s) => s.showToast);
  const [subscribed, setSubscribed] = useState(initialSubscribed);
  const [supported, setSupported] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window
    );
  }, []);

  const enable = () => {
    if (!vapidPublicKey || !pushConfigured) {
      showToast("Push is not configured on the server.", "error");
      return;
    }

    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          showToast("Notification permission denied", "error");
          return;
        }

        const reg = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;

        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        const json = sub.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
          showToast("Could not read subscription keys", "error");
          return;
        }

        const res = await savePushSubscription(userId, {
          endpoint: json.endpoint,
          keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          userAgent: navigator.userAgent,
        });

        if (res.success) {
          setSubscribed(true);
          showToast("Browser push enabled", "success");
        } else showToast(res.error ?? "Failed to save subscription", "error");
      } catch (e) {
        console.error(e);
        showToast("Could not enable push notifications", "error");
      }
    });
  };

  const disable = () => {
    startTransition(async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          const sub = await reg.pushManager.getSubscription();
          if (sub) await sub.unsubscribe();
        }
      } catch {
        /* ignore */
      }
      const res = await removeAllPushSubscriptions(userId);
      if (res.success) {
        setSubscribed(false);
        showToast("Push notifications disabled", "success");
      }
    });
  };

  if (!supported) {
    return (
      <Card className="p-4 text-sm text-gray-500">
        Browser push is not supported in this environment.
      </Card>
    );
  }

  if (!pushConfigured) {
    return (
      <Card className="p-4 text-sm text-gray-500">
        Push notifications are not configured. Add VAPID keys to the server environment.
      </Card>
    );
  }

  return (
    <Card className="p-4 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p className="font-medium text-sm">Browser push</p>
        <p className="text-xs text-gray-500 mt-1">
          Get alerts on this device when you enable push in preferences below.
        </p>
      </div>
      {subscribed ? (
        <Button variant="outline" size="sm" disabled={isPending} onClick={disable}>
          <BellOff className="h-4 w-4 mr-2" />
          Disable on this device
        </Button>
      ) : (
        <Button size="sm" disabled={isPending} onClick={enable}>
          <Bell className="h-4 w-4 mr-2" />
          Enable on this device
        </Button>
      )}
    </Card>
  );
}
