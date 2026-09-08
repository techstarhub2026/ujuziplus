"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  GraduationCap,
  Lightbulb,
  BookOpen,
  Package,
  FlaskConical,
  Building2,
  FolderKanban,
  Users,
  Trophy,
  Library,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UjuziLogo } from "@/components/brand/UjuziLogo";
import { NAV_WAZILAB, PLATFORM } from "@/lib/constants";
import { UJUZI } from "@/lib/ujuzi-brand";

const iconMap = {
  Home,
  GraduationCap,
  Lightbulb,
  BookOpen,
  Package,
  FlaskConical,
  Building2,
  FolderKanban,
  Users,
  Trophy,
  Library,
} as const;

export function LabSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const width = collapsed ? UJUZI.sidebarCollapsed : UJUZI.sidebarWidth;

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col text-white transition-[width] duration-300"
      style={{
        width,
        backgroundColor: UJUZI.sidebar,
        borderRight: `1px solid ${UJUZI.sidebarBorder}`,
      }}
    >
      <div
        className={cn(
          "relative flex shrink-0 items-center border-b border-white/20",
          collapsed ? "h-[96px] justify-center px-2 py-2" : "h-[72px] justify-between px-3"
        )}
      >
        {collapsed ? (
          <div
            className="animate-pulse flex items-center justify-center rounded-full"
            style={{
              width: 68,
              height: 68,
              backgroundColor: "#FFD700",
              boxShadow: "0 0 18px 8px rgba(255,215,0,0.7), 0 0 36px 16px rgba(255,215,0,0.35)",
            }}
          >
            <UjuziLogo variant="icon" theme="on-dark" logoHeight={52} href="/" />
          </div>
        ) : (
          <UjuziLogo variant="full" theme="on-dark" logoHeight={52} href="/" className="min-w-0 flex-1" />
        )}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "hidden rounded p-1 hover:bg-white/10 lg:flex",
            collapsed && "absolute bottom-1 right-1"
          )}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 ujuzi-scroll-dark">
        {NAV_WAZILAB.map((item) => {
          const Icon = iconMap[item.icon];
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "mx-2 mb-0.5 flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-white/15 text-white" : "text-white/85 hover:bg-white/10"
              )}
              style={active ? { backgroundColor: "rgba(255,255,255,0.18)" } : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t border-white/20 p-3">
          <Link
            href="/dashboard/resources"
            className="flex items-center gap-2 text-xs text-white/85 hover:text-white"
          >
            {PLATFORM.name} Resources
          </Link>
        </div>
      )}
    </aside>
  );
}
