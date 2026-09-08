"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/motion";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article";
  /** How much of the element must enter the viewport (0–1). */
  amount?: number;
};

export function Reveal({
  children,
  className,
  delay = 0,
  as = "div",
  amount = 0.15,
}: RevealProps) {
  // useReducedMotion() returns null on the server and the real OS
  // preference on the client's first render, so branching JSX structure on
  // it directly causes a hydration mismatch. Instead always render the
  // same motion element, and only start suppressing animation once mounted.
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const animationsDisabled = mounted && reduceMotion;
  const Component = motion[as];

  return (
    <Component
      className={cn(className)}
      initial={animationsDisabled ? false : "hidden"}
      whileInView={animationsDisabled ? undefined : "visible"}
      animate={animationsDisabled ? "visible" : undefined}
      viewport={{ once: true, amount, margin: "0px 0px -40px 0px" }}
      variants={{
        hidden: fadeUp.hidden,
        visible: {
          ...fadeUp.visible,
          transition: { ...fadeUp.visible.transition, delay },
        },
      }}
    >
      {children}
    </Component>
  );
}
