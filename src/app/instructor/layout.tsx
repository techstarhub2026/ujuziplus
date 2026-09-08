import { InstructorShell } from "@/components/layout/InstructorShell";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/db";

export default async function InstructorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");
  const role = session.user.role;
  if (role !== "INSTRUCTOR" && role !== "ADMIN") redirect("/dashboard");

  if (role === "INSTRUCTOR") {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { instructorStatus: true },
    });
    if (user?.instructorStatus !== "APPROVED") redirect("/instructor-pending");
  }

  return <InstructorShell>{children}</InstructorShell>;
}
