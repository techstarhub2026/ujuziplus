"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Session } from "next-auth";
import { Bell, Search, Menu, LogOut, Shield, GraduationCap, ChevronLeft, ChevronRight } from "lucide-react";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { isAdminRole, isInstructorRole, isStudentRole } from "@/lib/auth/roles";

export function AppTopbar({
  session,
  onMenuClick,
}: {
  session: Session | null;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;

    let cancelled = false;

    const loadUnread = () => {
      fetch("/api/notifications/unread")
        .then((r) => r.json())
        .then((data: { count?: number }) => {
          if (!cancelled && typeof data.count === "number") setUnread(data.count);
        })
        .catch(() => {});
    };

    // Defer so navigation and first paint aren't blocked
    const deferId = window.setTimeout(loadUnread, 400);
    const intervalId = window.setInterval(loadUnread, 60_000);

    return () => {
      cancelled = true;
      window.clearTimeout(deferId);
      window.clearInterval(intervalId);
    };
  }, [session?.user?.id]);

  const user = session?.user;
  const role = user?.role;

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q") as string;
    if (q?.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <header className="glass-topbar sticky top-0 z-30 flex h-16 items-center justify-between gap-4 px-4 lg:px-6">
      <div className="flex flex-1 items-center gap-4">
        <button
          type="button"
          aria-label="Open navigation menu"
          aria-haspopup="true"
          className="rounded-xl p-2 transition hover:bg-gray-100 lg:hidden"
          onClick={(e) => {
            e.currentTarget.blur();
            onMenuClick?.();
          }}
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="topbar-nav-group hidden items-center sm:flex">
          <button
            type="button"
            title="Go back"
            aria-label="Go back"
            onClick={() => router.back()}
            className="topbar-nav-group__btn text-white outline-none transition focus:outline-none focus-visible:outline-none"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="topbar-nav-group__divider" aria-hidden />
          <button
            type="button"
            title="Go forward"
            aria-label="Go forward"
            onClick={() => router.forward()}
            className="topbar-nav-group__btn text-white outline-none transition focus:outline-none focus-visible:outline-none"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSearch} className="relative max-w-md flex-1">
          <label htmlFor="app-topbar-search" className="sr-only">
            Search courses, kits, people
          </label>
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="app-topbar-search"
            name="q"
            type="search"
            placeholder="Search courses, kits, people..."
            className="h-10 w-full rounded-xl border border-gray-200/80 bg-white/70 pl-10 pr-4 text-sm shadow-sm backdrop-blur-sm transition-all focus:border-brand/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:shadow-glow-sm"
          />
        </form>
      </div>

      <div className="flex items-center gap-1">
        {isAdminRole(role) && (
          <Link
            href="/admin"
            className="hidden items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 sm:flex"
          >
            <Shield className="h-4 w-4" />
            Admin
          </Link>
        )}
        {isInstructorRole(role) && (
          <Link
            href="/instructor/dashboard"
            className="hidden items-center gap-1.5 rounded-xl border border-brand/30 bg-brand-light px-3 py-2 text-sm font-medium text-brand transition hover:bg-brand/10 sm:flex"
          >
            <GraduationCap className="h-4 w-4" />
            Instructor
          </Link>
        )}
        {isStudentRole(role) && (
          <>
            <Link
              href="/dashboard/wishlist"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:block"
            >
              Wishlist
            </Link>
            <Link
              href="/cart"
              className="hidden rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 sm:block"
            >
              Cart
            </Link>
          </>
        )}

        <Link
          href="/dashboard/notifications"
          className="relative rounded-xl p-2 transition hover:bg-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white">
              {unread}
            </span>
          )}
        </Link>

        {user ? (
          <div className="flex items-center gap-1">
            <Link
              href={
                isAdminRole(role)
                  ? "/admin"
                  : isInstructorRole(role)
                    ? "/instructor/dashboard"
                    : "/dashboard/settings/profile"
              }
              className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-gray-100"
            >
              <Avatar src={user.avatarUrl} alt={user.fullName || user.name || "User"} size="sm" />
              <span className="hidden text-sm font-medium text-gray-700 md:inline">
                {user.fullName || user.name}
              </span>
            </Link>
            <button
              type="button"
              title="Sign out"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              className="rounded-xl p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark hover:shadow-md"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}
