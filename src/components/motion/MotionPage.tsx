"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Subtle page enter — use on portal main content areas. */
export function MotionPage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <div key={pathname} className={cn("page-transition", className)}>
      {children}
    </div>
  );
}
