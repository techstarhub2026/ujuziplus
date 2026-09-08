import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full font-bold ring-1 ring-inset transition-all",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-brand-light to-orange-100 text-brand-dark ring-brand/25 shadow-sm",
        accent: "bg-gradient-to-r from-brand/15 to-amber-100 text-brand-dark ring-brand/30",
        success: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 ring-green-200/70",
        warning: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-800 ring-amber-200/70",
        error: "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 ring-red-200/70",
        outline: "border-0 bg-white/95 text-navy ring-navy/15 shadow-sm backdrop-blur-sm",
        navy: "bg-gradient-to-r from-navy-light to-indigo-50 text-navy ring-navy/20 shadow-sm",
        muted: "bg-gray-100/90 text-navy/70 ring-gray-200/60",
      },
      size: {
        sm: "px-2 py-0.5 text-[10px] leading-4",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3.5 py-1 text-xs uppercase tracking-wide",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

export function Badge({
  className,
  variant,
  size,
  dot,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants> & {
    dot?: boolean;
  }) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 shrink-0 rounded-full animate-pulse",
            variant === "success" && "bg-green-500",
            variant === "warning" && "bg-amber-500",
            variant === "error" && "bg-red-500",
            (!variant || variant === "default" || variant === "accent") && "bg-brand",
            variant === "outline" && "bg-navy",
            variant === "navy" && "bg-navy",
            variant === "muted" && "bg-navy/40"
          )}
        />
      )}
      {children}
    </span>
  );
}
