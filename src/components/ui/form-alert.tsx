import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const styles = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
} as const;

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: Info,
} as const;

export function FormAlert({
  variant = "info",
  children,
  className,
}: {
  variant?: keyof typeof styles;
  children: React.ReactNode;
  className?: string;
}) {
  const Icon = icons[variant];
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm leading-relaxed",
        styles[variant],
        className
      )}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
}
