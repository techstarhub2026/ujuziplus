"use client";

import Link from "next/link";
import { PortalNavLink } from "@/components/motion/PortalNavLink";

export function PortalSidebar({
  title,
  icon,
  iconBg,
  items,
  footerLink,
  alwaysVisible = false,
  layoutId = "portal-nav-pill",
}: {
  title: string;
  icon: string;
  iconBg: string;
  items: ReadonlyArray<{ href: string; label: string }>;
  footerLink?: { href: string; label: string };
  alwaysVisible?: boolean;
  layoutId?: string;
}) {
  return (
    <aside
      className={
        alwaysVisible
          ? "w-full shrink-0 border-r border-gray-200 bg-white"
          : "hidden w-56 shrink-0 border-r border-gray-200 bg-white lg:block"
      }
    >
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <div className={cnIcon(iconBg)}>{icon}</div>
        <span className="font-semibold">{title}</span>
      </div>
      <nav className="space-y-0.5 p-2">
        {items.map((item) => (
          <PortalNavLink
            key={item.href}
            href={item.href}
            layoutId={layoutId}
            className="text-gray-600 hover:text-navy"
            activeClassName="!text-brand font-medium"
          >
            {item.label}
          </PortalNavLink>
        ))}
      </nav>
      {footerLink && (
        <div className="border-t p-3">
          <Link href={footerLink.href} className="text-sm text-brand hover:underline">
            {footerLink.label}
          </Link>
        </div>
      )}
    </aside>
  );
}

function cnIcon(bg: string) {
  return `flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-white ${bg}`;
}
