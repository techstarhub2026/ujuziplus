import { redirect } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { getAuthSession } from "@/lib/auth-server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "ADMIN" && role !== "MODERATOR") redirect("/dashboard");

  return <AdminShell>{children}</AdminShell>;
}
