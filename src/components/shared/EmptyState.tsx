import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  icon,
  className,
  variant = "default",
}: {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  className?: string;
  variant?: "default" | "compact";
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden rounded-3xl border border-dashed border-brand/25 text-center",
        "bg-gradient-to-br from-white via-brand-light/20 to-orange-50/30 shadow-soft backdrop-blur-sm",
        variant === "compact" ? "py-10 px-5" : "py-16 px-6",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand/10 blur-2xl" aria-hidden />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-amber-300/20 blur-2xl" aria-hidden />

      {icon && (
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-brand shadow-md ring-4 ring-white/80">
          <div className="text-white">{icon}</div>
        </div>
      )}
      <h3 className="relative font-display text-xl font-bold text-gray-900">{title}</h3>
      <p className="relative mt-2 max-w-sm text-sm leading-relaxed text-gray-500">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild className="relative mt-6" size="lg">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && (
        <Button className="relative mt-6" size="lg" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
