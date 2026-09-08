"use client";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { motion, useReducedMotion } from "framer-motion";

const trackVariants = cva("relative overflow-hidden rounded-full ring-1 ring-inset", {
  variants: {
    size: {
      sm: "h-1.5",
      md: "h-2.5",
      lg: "h-3.5",
    },
    variant: {
      default: "bg-gray-100 ring-gray-200/50",
      onDark: "bg-white/20 ring-white/10",
    },
  },
  defaultVariants: { size: "md", variant: "default" },
});

const MARKS = [25, 50, 75];

export function ProgressBar({
  value,
  className,
  showLabel = false,
  showMarks = false,
  size,
  variant,
  label = "Progress",
  barClassName,
}: {
  value: number;
  className?: string;
  showLabel?: boolean;
  /** Shows tick marks at 25/50/75% that light up once passed — used for longer-running progress (e.g. course completion). */
  showMarks?: boolean;
  label?: string;
  /** Overrides the fill color (e.g. "bg-red-400" for a capacity meter that's full) — otherwise derived from `variant`. */
  barClassName?: string;
} & VariantProps<typeof trackVariants>) {
  const reduceMotion = useReducedMotion();
  const pct = Math.min(100, Math.max(0, value));
  const barColor = barClassName ?? (variant === "onDark" ? "bg-brand" : "progress-shine");

  return (
    <div className={cn("space-y-1.5", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs font-medium">
          <span className="text-gray-500">{label}</span>
          <span className="tabular-nums text-brand">{Math.round(pct)}%</span>
        </div>
      )}
      <div className={cn(trackVariants({ size, variant }))}>
        <motion.div
          className={cn("absolute left-0 top-0 h-full rounded-full", barColor)}
          initial={{ width: reduceMotion ? `${pct}%` : "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
        {showMarks &&
          MARKS.map((mark) => (
            <span
              key={mark}
              className={cn(
                "absolute top-1/2 z-10 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white transition-colors duration-500",
                pct >= mark ? "bg-brand" : "bg-gray-300"
              )}
              style={{ left: `${mark}%` }}
              aria-hidden
            />
          ))}
      </div>
    </div>
  );
}
