/**
 * Shared org portal access checks for server pages.
 */
import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import type { OrgMemberRole } from "@prisma/client";

export async function requireOrgPageAccess(orgSlug: string, callbackPath?: string) {
  const session = await getAuthSession();
  const path = callbackPath ?? `/org/${orgSlug}/dashboard`;

  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(path)}`);
  }

  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) redirect("/dashboard/organizations");

  const membership = await db.organizationMember.findUnique({
    where: { orgId_userId: { orgId: org.id, userId: session.user.id } },
  });

  const isPlatformStaff =
    session.user.role === "ADMIN" || session.user.role === "MODERATOR";

  const isStaffMember =
    membership?.role === "ADMIN" || membership?.role === "INSTRUCTOR";

  // The portal only has content for org admins/instructors — regular
  // members have nothing to do here, so send them to the public org page.
  if (!isStaffMember && !isPlatformStaff) {
    redirect(`/organizations/${org.slug}`);
  }

  return {
    session,
    org,
    membership,
    isOrgAdmin: membership?.role === "ADMIN",
    isOrgInstructor: membership?.role === "INSTRUCTOR",
    isOrgStaff:
      membership?.role === "ADMIN" ||
      membership?.role === "INSTRUCTOR" ||
      isPlatformStaff,
    isPlatformStaff,
  };
}

/** Settings, analytics, member invites, kit procurement — org admins only. */
export async function requireOrgAdmin(orgSlug: string) {
  const ctx = await requireOrgPageAccess(orgSlug);
  if (!ctx.isOrgAdmin && !ctx.isPlatformStaff) {
    redirect(`/org/${orgSlug}/dashboard?error=admin_required`);
  }
  return ctx;
}

/** Course/program management — org admins and instructors. */
export async function requireOrgStaff(orgSlug: string) {
  const ctx = await requireOrgPageAccess(orgSlug);
  if (!ctx.isOrgStaff) {
    redirect(`/org/${orgSlug}/dashboard?error=staff_required`);
  }
  return ctx;
}

export function getOrgNavItems(orgSlug: string, access: { isOrgAdmin: boolean }) {
  const items = [
    { href: `/org/${orgSlug}/dashboard`, label: "Overview" },
    { href: `/org/${orgSlug}/courses`, label: "Courses" },
    { href: `/org/${orgSlug}/kits`, label: "Learning Kits" },
    { href: `/org/${orgSlug}/programs`, label: "Programs" },
    { href: `/org/${orgSlug}/competitions`, label: "Competitions" },
  ];
  if (access.isOrgAdmin) {
    items.push(
      { href: `/org/${orgSlug}/members`, label: "Members" },
      { href: `/org/${orgSlug}/analytics`, label: "Analytics" },
      { href: `/org/${orgSlug}/settings`, label: "Settings" }
    );
  }
  return items;
}

export function orgRoleLabel(role: OrgMemberRole) {
  switch (role) {
    case "ADMIN":
      return "Organization admin";
    case "INSTRUCTOR":
      return "Instructor";
    default:
      return "Member";
  }
}
