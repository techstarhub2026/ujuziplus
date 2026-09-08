"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { easeOut } from "@/lib/motion";

type DossierSectionProps = {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
  delay?: number;
  /** How much of the element must enter the viewport (0–1). */
  amount?: number;
  /** Skip the narrow 640px dossier-card width cap — for full-width content like catalog rails. */
  fullWidth?: boolean;
};

/**
 * Every section used to slide in horizontally from alternating sides. Lateral
 * motion driven by vertical scrolling puts the two axes in conflict — the page
 * appears to swing as you read down it, which is a textbook vestibular
 * trigger and compounded everything else moving on the page.
 *
 * What remains is a short vertical rise that travels with the scroll rather
 * than across it, small enough to register as settling rather than movement.
 */
const revealVariant = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
} as const;

/**
 * Section wrapper that fades content in as it enters the viewport.
 *
 * `align` is still accepted so existing call sites keep working, but it now
 * only affects layout width, never the direction of the animation — see
 * `revealVariant`.
 */
export function DossierSection({
  children,
  className,
  align = "left",
  delay = 0,
  amount = 0.15,
  fullWidth = false,
}: DossierSectionProps) {
  // useReducedMotion() returns null on the server and the real OS
  // preference on the client's first render, so branching JSX structure on
  // it directly causes a hydration mismatch. Instead always render the
  // same motion.div, and only start suppressing animation once mounted.
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const animationsDisabled = mounted && reduceMotion;

  const alignClass =
    align === "left" ? "dossier-section--left" : align === "right" ? "dossier-section--right" : "dossier-section--center";

  const variants = revealVariant;

  return (
    <div className={cn("dossier-section", alignClass, className)}>
      <motion.div
        className={cn("dossier-section__inner", fullWidth && "dossier-section__inner--full")}
        initial={animationsDisabled ? false : "hidden"}
        whileInView={animationsDisabled ? undefined : "visible"}
        animate={animationsDisabled ? "visible" : undefined}
        viewport={{ once: true, amount, margin: "0px 0px -60px 0px" }}
        variants={{
          hidden: variants.hidden,
          visible: { ...variants.visible, transition: { ...variants.visible.transition, delay } },
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
