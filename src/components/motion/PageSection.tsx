"use client";

import { Reveal } from "@/components/motion/Reveal";

/** Scroll-reveal wrapper for server page sections. */
export function PageSection({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Reveal className={className} delay={delay}>
      {children}
    </Reveal>
  );
}
