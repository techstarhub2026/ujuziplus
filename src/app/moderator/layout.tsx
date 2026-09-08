import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { isAdminRole } from "@/lib/auth/roles";

const NAV = [
  { href: "/moderator", label: "Overview" },
  { href: "/moderator/courses", label: "Course review" },
  { href: "/moderator/reports", label: "Content reports" },
];

export default async function ModeratorLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/moderator");
  if (!isAdminRole(session.user.role)) redirect("/dashboard");

  return (
    <div className="flex min-h-screen">
      <aside className="w-52 border-r bg-amber-50">
        <div className="p-4 font-semibold text-amber-900">Moderator</div>
        <nav className="space-y-1 p-2">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-amber-100">
              {n.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-surface-muted p-6">{children}</main>
    </div>
  );
}
