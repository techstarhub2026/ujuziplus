"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const PORTALS = [
  { href: "/", label: "Public", color: "bg-gray-700" },
  { href: "/dashboard", label: "Student", color: "bg-brand" },
  { href: "/instructor/dashboard", label: "Instructor", color: "bg-violet-600" },
  { href: "/org/dit-tanzania/dashboard", label: "Org", color: "bg-emerald-600" },
  { href: "/moderator", label: "Mod", color: "bg-amber-600" },
  { href: "/admin", label: "Admin", color: "bg-red-600" },
];

export function RoleSwitcher() {
  const pathname = usePathname();
  if (pathname.startsWith("/learn/")) return null;

  return (
    <div className="fixed bottom-20 left-1/2 z-[90] -translate-x-1/2 lg:bottom-4">
      <div className="flex items-center gap-1 rounded-full border border-gray-200 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur">
        <span className="hidden px-2 text-[10px] font-semibold uppercase text-gray-400 sm:inline">
          Demo portals
        </span>
        {PORTALS.map((p) => {
          const active =
            p.href === "/"
              ? pathname === "/"
              : pathname === p.href || pathname.startsWith(p.href + "/");
          return (
            <Link
              key={p.href}
              href={p.href}
              className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold text-white transition-opacity",
                p.color,
                active ? "ring-2 ring-offset-1 ring-gray-900" : "opacity-70 hover:opacity-100"
              )}
            >
              {p.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
