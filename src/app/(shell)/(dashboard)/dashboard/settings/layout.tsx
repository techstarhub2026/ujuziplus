"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard/settings/profile", label: "Profile" },
  { href: "/dashboard/settings/account", label: "Account" },
  { href: "/dashboard/settings/notifications", label: "Notifications" },
  { href: "/dashboard/settings/billing", label: "Billing" },
  { href: "/dashboard/settings/privacy", label: "Privacy" },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:w-48 shrink-0">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap",
              pathname === l.href ? "bg-brand-light text-brand" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="flex-1">{children}</div>
    </div>
  );
}
