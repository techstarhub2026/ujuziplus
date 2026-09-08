"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  saveNotificationPreferences,
  type NotificationPrefRow,
} from "@/lib/actions/notification-prefs";
import { useAppStore } from "@/store/appStore";

export function NotificationPrefsForm({
  userId,
  initialPrefs,
  pushConfigured = false,
}: {
  userId: string;
  initialPrefs: NotificationPrefRow[];
  pushConfigured?: boolean;
}) {
  const [prefs, setPrefs] = useState(initialPrefs);
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  const update = (category: string, field: keyof NotificationPrefRow, value: boolean) => {
    setPrefs((rows) =>
      rows.map((r) => (r.category === category ? { ...r, [field]: value } : r))
    );
  };

  const save = () => {
    startTransition(async () => {
      const res = await saveNotificationPreferences(userId, prefs);
      if (res.success) showToast("Notification preferences saved", "success");
      else showToast(res.error ?? "Save failed", "error");
    });
  };

  return (
    <div>
      <PageHeader
        title="Notification preferences"
        description="Choose how UjuziLab reaches you. Email uses Gmail when configured in server env."
      />
      <Card className="space-y-4 p-4">
        {prefs.map((p) => (
          <label
            key={p.category}
            className="flex flex-col gap-2 py-2 border-b last:border-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm font-medium">{p.category}</span>
            <div className="flex gap-4">
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={p.emailEnabled}
                  onChange={(e) => update(p.category, "emailEnabled", e.target.checked)}
                />
                Email
              </label>
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={p.inAppEnabled}
                  onChange={(e) => update(p.category, "inAppEnabled", e.target.checked)}
                />
                In-app
              </label>
              <label
                className={`flex items-center gap-1 text-xs ${!pushConfigured ? "text-gray-400" : ""}`}
                title={!pushConfigured ? "Server VAPID keys required" : undefined}
              >
                <input
                  type="checkbox"
                  checked={p.pushEnabled}
                  disabled={!pushConfigured}
                  onChange={(e) => update(p.category, "pushEnabled", e.target.checked)}
                />
                Push
              </label>
            </div>
          </label>
        ))}
        <Button className="mt-2" disabled={isPending} onClick={save}>
          Save preferences
        </Button>
      </Card>
    </div>
  );
}
