"use client";

import { cn } from "@/lib/utils";
import { UjuziLoader } from "@/components/ui/UjuziLoader";

/** Full-bleed overlay for client-side async work (forms, mutations, modals). */
export function LoadingOverlay({
  show,
  message = "Loading…",
  dark = false,
  className,
}: {
  show: boolean;
  message?: string;
  dark?: boolean;
  className?: string;
}) {
  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "ujuzi-loading-overlay",
        dark && "ujuzi-loading-overlay--dark",
        className
      )}
    >
      <div className="ujuzi-loading-overlay__panel">
        <UjuziLoader size="lg" />
        {message ? <p className="ujuzi-page-loading__message">{message}</p> : null}
      </div>
    </div>
  );
}
