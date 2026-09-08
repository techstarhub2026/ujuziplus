"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function PortalNavLink({
  href,
  children,
  icon,
  layoutId = "portal-nav-pill",
  className,
  activeClassName,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  layoutId?: string;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const active =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "portal-nav-link relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active ? cn("text-white font-medium", activeClassName) : "text-gray-300 hover:text-white",
        className
      )}
    >
      {active &&
        (reduceMotion ? (
          <span className="portal-nav-link__pill" aria-hidden />
        ) : (
          <motion.span
            layoutId={layoutId}
            className="portal-nav-link__pill"
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            aria-hidden
          />
        ))}
      {icon && <span className="relative z-10 shrink-0">{icon}</span>}
      <span className="relative z-10">{children}</span>
    </Link>
  );
}
