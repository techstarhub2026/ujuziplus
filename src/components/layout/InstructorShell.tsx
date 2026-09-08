"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { PortalSidebar } from "@/components/layout/PortalSidebar";
import { MotionPage } from "@/components/motion/MotionPage";
import { NAV_INSTRUCTOR } from "@/lib/constants";

const NAV_ITEMS = [...NAV_INSTRUCTOR];

export function InstructorShell({ children }: { children: React.ReactNode }) {
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

      <div
        className={`fixed inset-y-0 left-0 z-50 w-56 transform transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between border-b bg-white px-4 py-3 lg:hidden">
          <span className="font-semibold text-sm">Instructor</span>
          <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <PortalSidebar
          title="Instructor"
          icon="I"
          iconBg="bg-violet-600"
          items={NAV_ITEMS}
          footerLink={{ href: "/dashboard", label: "← Student portal" }}
          layoutId="instructor-nav-pill"
          alwaysVisible
        />
      </div>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center gap-3 border-b bg-white px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-sm">Instructor Portal</span>
        </header>
        <MotionPage className="flex-1 p-4 sm:p-6">{children}</MotionPage>
      </div>
    </div>
  );
}
