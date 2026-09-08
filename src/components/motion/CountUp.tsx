"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

export function CountUp({
  value,
  duration = 900,
  className,
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const from = 0;
    const to = value;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduceMotion]);

  return (
    <span className={className} aria-label={String(value)}>
      {display}
    </span>
  );
}
