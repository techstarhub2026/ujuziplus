"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SeatMeter({
  enrolled,
  total,
  className,
}: {
  enrolled: number;
  total: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const pct = total > 0 ? Math.min(100, Math.round((enrolled / total) * 100)) : 0;
  const remaining = Math.max(0, total - enrolled);

  const tone =
    pct >= 90 ? "critical" : pct >= 70 ? "warning" : "open";

  return (
    <div className={cn("seat-meter", className)}>
      <div className="seat-meter__labels">
        <span className="seat-meter__title">Seats</span>
        <span className={cn("seat-meter__count", `seat-meter__count--${tone}`)}>
          {remaining > 0 ? `${remaining} left` : "Full"}
        </span>
      </div>
      <div className="seat-meter__track" aria-hidden>
        <motion.div
          className={cn("seat-meter__fill", `seat-meter__fill--${tone}`)}
          initial={{ width: reduceMotion ? `${pct}%` : "0%" }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: reduceMotion ? 0 : 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}
