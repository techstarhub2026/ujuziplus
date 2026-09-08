"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { PortalNavLink } from "@/components/motion/PortalNavLink";
import { MotionPage } from "@/components/motion/MotionPage";

export function OrgShell({
  orgName,
  nav,
  children,
}: {
  orgName: string;
  nav: { href: string; label: string }[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface-muted">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`org-portal-sidebar fixed inset-y-0 left-0 z-50 w-56 shrink-0 border-r bg-navy text-white transition-transform lg:static lg:translate-x-0 ujuzi-scroll-dark ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="border-b border-white/15 p-4">
          <p className="truncate text-sm font-semibold">{orgName}</p>
          <p className="text-xs text-white/60">Organization portal</p>
        </div>
        <nav className="space-y-0.5 p-2">
          {nav.map((item) => (
            <PortalNavLink
              key={item.href}
              href={item.href}
              layoutId="org-nav-pill"
              className="text-white/80 hover:text-white"
              activeClassName="!text-white"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </PortalNavLink>
          ))}
        </nav>
        <div className="border-t border-white/15 p-4">
          <Link href="/dashboard" className="text-sm text-brand-light hover:underline">
            ← Student portal
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center gap-3 border-b bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="truncate text-sm font-semibold">{orgName}</span>
          <button type="button" className="ml-auto lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </header>
        <MotionPage className="flex-1 p-4 sm:p-6">{children}</MotionPage>
      </div>
    </div>
  );
}
