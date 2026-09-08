"use client";

import { Children, isValidElement, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Seamless logo/credential strip.
 *
 * Reserved for small, low-detail, non-interactive content — partner logos and
 * the like. Do NOT use this for content cards: a slab of moving imagery under
 * the reader's gaze is what makes an autoplaying rail nauseating. Content rows
 * belong in `HomeCarousel`, which only moves when the reader asks it to.
 *
 * The track is rendered twice and translated by -50%, so the loop never jumps.
 * It runs slowly, pauses on hover and focus, and stops entirely under
 * `prefers-reduced-motion`.
 */
export function MarqueeRow({
  children,
  direction = "left",
  /** Seconds for one full loop — bigger = slower. */
  duration = 90,
  gap = 20,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  direction?: "left" | "right";
  duration?: number;
  gap?: number;
  className?: string;
  ariaLabel?: string;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  if (items.length === 0) return null;

  return (
    <div
      className={cn("marquee", className)}
      style={{ "--marquee-gap": `${gap}px` } as React.CSSProperties}
      role="region"
      aria-label={ariaLabel}
    >
      <div
        className={cn(
          "marquee__track",
          direction === "right" && "marquee__track--reverse"
        )}
        style={{ "--marquee-duration": `${duration}s` } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className="marquee__group"
            aria-hidden={copy === 1 || undefined}
          >
            {items.map((child, i) => (
              <div key={`${copy}-${child.key ?? i}`} className="marquee__item">
                {child}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
