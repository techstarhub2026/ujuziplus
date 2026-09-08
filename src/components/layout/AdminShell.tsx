"use client";

import { useState } from "react";
import Link from "next/link";
import { PortalNavLink } from "@/components/motion/PortalNavLink";
import { MotionPage } from "@/components/motion/MotionPage";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageSquare,
  DollarSign,
  BarChart3,
  Package,
  ClipboardList,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Trophy,
  Building2,
  FileText,
  Flag,
  Settings,
  GraduationCap,
  FlaskConical,
  Library,
} from "lucide-react";
const ICONS: Record<string, React.ElementType> = {
  "/admin": LayoutDashboard,
  "/admin/users": Users,
  "/admin/instructors": UserCheck,
  "/admin/courses": BookOpen,
  "/admin/payments": DollarSign,
  "/admin/discussions": MessageSquare,
  "/admin/analytics": BarChart3,
  "/admin/kits": Package,
  "/admin/kit-requests": ClipboardList,
  "/admin/lab-resources": FlaskConical,
  "/admin/open-knowledge": Library,
  "/admin/mentors": Users,
  "/admin/mentors/requests": ClipboardList,
  "/admin/programs": GraduationCap,
  "/admin/competitions": Trophy,
  "/admin/organizations": Building2,
  "/admin/content": FileText,
  "/admin/moderation": Flag,
  "/admin/showcase": Trophy,
  "/admin/settings": Settings,
};

const ADMIN_NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/instructors", label: "Instructor Applications" },
  { href: "/admin/courses", label: "Course Review" },
  { href: "/admin/kits", label: "Learning Kits" },
  { href: "/admin/kit-requests", label: "Kit Requests" },
  { href: "/admin/lab-resources", label: "Lab Resources" },
  { href: "/admin/open-knowledge", label: "Open Knowledge" },
  { href: "/admin/programs", label: "Programs" },
  { href: "/admin/mentors", label: "Mentors" },
  { href: "/admin/mentors/requests", label: "Mentor Requests" },
  { href: "/admin/competitions", label: "Competitions" },
  { href: "/admin/organizations", label: "Organizations" },
  { href: "/admin/showcase", label: "Showcase Review" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/discussions", label: "Discussions" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="flex min-h-screen bg-gray-50">
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-gray-900 text-white flex flex-col transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-4 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
          <button
            type="button"
            className="lg:hidden p-1"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {ADMIN_NAV.map((item) => {
            const Icon = ICONS[item.href] ?? LayoutDashboard;
            return (
              <PortalNavLink
                key={item.href}
                href={item.href}
                layoutId="admin-nav-pill"
                icon={<Icon className="h-4 w-4 shrink-0" />}
                className="mx-2 text-gray-300 hover:text-white"
                activeClassName="!text-white"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </PortalNavLink>
            );
          })}
        </nav>
        <div className="border-t border-gray-800 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs text-gray-400 hover:text-white"
          >
            <ChevronRight className="h-3.5 w-3.5 rotate-180" />
            Back to dashboard
          </Link>
        </div>
      </aside>

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
          <span className="font-semibold text-sm">Admin</span>
        </header>
        <MotionPage className="flex-1 overflow-auto p-4 sm:p-6">{children}</MotionPage>
      </div>
    </div>
  );
}
