"use client";

import { useAppStore } from "@/store/appStore";
import { CheckCircle, XCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const toastStyles = {
  success: "bg-green-600 shadow-toast",
  error: "bg-red-600 shadow-toast",
  info: "bg-gray-900 shadow-toast",
} as const;

const toastIcons = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
} as const;

/** Isolated toast UI so the rest of the app tree does not re-render on toast changes. */
export function ToastHost() {
  const toasts = useAppStore((s) => s.toasts);
  const dismissToast = useAppStore((s) => s.dismissToast);

  return (
    <div
      className="pointer-events-none fixed bottom-24 right-4 z-[100] flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((t, i) => {
        const Icon = toastIcons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              "toast-item pointer-events-auto",
              toastStyles[t.type],
              i > 0 && "opacity-95"
            )}
          >
            <Icon className="h-5 w-5 shrink-0 opacity-90" />
            <span className="flex-1 leading-snug">{t.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="ml-1 rounded-lg p-0.5 opacity-70 transition hover:bg-white/15 hover:opacity-100"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
