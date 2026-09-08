"use client";

import { Children, isValidElement } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function RevealStagger({
  children,
  className,
  as = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "ul";
}) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <Component
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.08, margin: "0px 0px -32px 0px" }}
      variants={staggerContainer}
    >
      {children}
    </Component>
  );
}

export function RevealItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={cn(className)} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

/** Wrap each direct child in RevealItem — handy for mapped lists. */
export function MotionGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RevealStagger className={className}>
      {Children.map(children, (child, i) =>
        isValidElement(child) ? (
          <RevealItem key={child.key ?? i}>{child}</RevealItem>
        ) : null
      )}
    </RevealStagger>
  );
}
