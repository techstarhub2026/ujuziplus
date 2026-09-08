/**
 * Organization directory, admin CRUD, and org-scoped analytics
 */
"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { OrgType } from "@prisma/client";
import type { ActionResult } from "./courses";
import { requireUser, requireAdmin } from "@/lib/auth-server";
import { sendEmail, orgAdminCredentialsEmail } from "@/lib/email";
import { hash } from "bcryptjs";
import { randomBytes } from "crypto";

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

async function requireOrgAdmin(orgSlug: string, userId: string) {
  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return { ok: false as const, error: "Organization not found." };

  const member = await db.organizationMember.findUnique({
    where: { orgId_userId: { orgId: org.id, userId } },
  });
  if (!member || member.role !== "ADMIN") {
    return { ok: false as const, error: "Only org admins can update settings." };
  }
  return { ok: true as const, org, member };
}

export async function getAllOrganizations() {
  return getAllOrganizationsCached();
}

const getAllOrganizationsCached = unstable_cache(
  async () =>
    db.organization.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        type: true,
        isVerified: true,
        memberCount: true,
      },
    }),
  ["published-organizations"],
  { revalidate: 120, tags: ["published-organizations"] }
);

export async function getOrganizationPublic(slug: string) {
  const org = await db.organization.findUnique({
    where: { slug },
    include: {
      _count: { select: { members: true } },
      courses: {
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
        select: {
          slug: true,
          title: true,
          subtitle: true,
          thumbnailUrl: true,
          level: true,
          isFree: true,
        },
      },
      programs: {
        where: { status: { in: ["OPEN", "FULL"] } },
        orderBy: { startDate: "asc" },
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          thumbnailUrl: true,
          startDate: true,
          format: true,
          enrolledCount: true,
          seats: true,
        },
      },
    },
  });
  if (!org) return null;

  const events = await db.programEvent.findMany({
    where: { program: { organizationId: org.id }, startAt: { gte: new Date() } },
    orderBy: { startAt: "asc" },
    take: 6,
    select: {
      id: true,
      title: true,
      type: true,
      startAt: true,
      endAt: true,
      location: true,
      program: { select: { slug: true, title: true } },
    },
  });

  return { ...org, events };
}

export async function getOrgDashboardStats(orgSlug: string) {
  const org = await db.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      kitInventory: { include: { kit: { select: { title: true } } } },
      kitRequests: {
        where: { status: "PENDING" },
        select: { id: true },
      },
      invites: {
        where: { status: "PENDING", expiresAt: { gt: new Date() } },
        select: { id: true },
      },
      _count: { select: { courses: { where: { status: "PUBLISHED" } } } },
    },
  });
  if (!org) return null;

  const kitUnits = org.kitInventory.reduce((sum, row) => sum + row.quantityOnHand, 0);

  return {
    org,
    stats: {
      memberCount: org.memberCount,
      coursesOffered: org._count.courses,
      kitUnitsOnHand: kitUnits,
      pendingKitRequests: org.kitRequests.length,
      pendingInvites: org.invites.length,
    },
  };
}

export async function getOrgAnalytics(orgSlug: string) {
  const org = await db.organization.findUnique({
    where: { slug: orgSlug },
    include: {
      members: { select: { userId: true, role: true } },
      kitInventory: { include: { kit: { select: { title: true, slug: true } } } },
      kitRequests: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          kit: { select: { title: true } },
          requester: { select: { fullName: true } },
        },
      },
    },
  });
  if (!org) return null;

  const memberIds = org.members.map((m) => m.userId);

  const enrollmentsByMonth =
    memberIds.length > 0
      ? await db.enrollment.findMany({
          where: { userId: { in: memberIds } },
          select: { enrolledAt: true, completedAt: true },
        })
      : [];

  const roleBreakdown = {
    admin: org.members.filter((m) => m.role === "ADMIN").length,
    instructor: org.members.filter((m) => m.role === "INSTRUCTOR").length,
    member: org.members.filter((m) => m.role === "MEMBER").length,
  };

  return { org, enrollmentsByMonth, roleBreakdown };
}

export async function updateOrganizationSettings(
  actorUserId: string,
  orgSlug: string,
  input: { name?: string; logoUrl?: string | null; type?: OrgType }
): Promise<ActionResult> {
  const { user } = await requireUser();
  if (user.id !== actorUserId) return { success: false, error: "Unauthorized." };

  const access = await requireOrgAdmin(orgSlug, actorUserId);
  if (!access.ok) return { success: false, error: access.error };

  await db.organization.update({
    where: { id: access.org.id },
    data: {
      name: input.name?.trim() || access.org.name,
      logoUrl: input.logoUrl !== undefined ? input.logoUrl : access.org.logoUrl,
      type: input.type ?? access.org.type,
    },
  });

  revalidatePath(`/org/${orgSlug}/settings`);
  revalidatePath(`/org/${orgSlug}/dashboard`);
  revalidatePath("/organizations");
  revalidatePath("/admin/organizations");
  revalidateTag("published-organizations");
  return { success: true, data: undefined };
}

/**
 * Mark (or unmark) a published course as offered by this organization.
 * Org admins can only manage their own org's courses; platform staff can
 * manage any org. No approval step — org admins are trusted to curate
 * their own org's course listing directly.
 */
export async function setCourseOrganization(
  actorUserId: string,
  orgSlug: string,
  courseId: string,
  offered: boolean
): Promise<ActionResult> {
  const { user } = await requireUser();
  if (user.id !== actorUserId) return { success: false, error: "Unauthorized." };

  const isPlatformStaff = user.role === "ADMIN" || user.role === "MODERATOR";
  let orgId: string;

  if (isPlatformStaff) {
    const org = await db.organization.findUnique({ where: { slug: orgSlug } });
    if (!org) return { success: false, error: "Organization not found." };
    orgId = org.id;
  } else {
    const access = await requireOrgAdmin(orgSlug, actorUserId);
    if (!access.ok) return { success: false, error: access.error };
    orgId = access.org.id;
  }

  const course = await db.course.findUnique({ where: { id: courseId } });
  if (!course || course.status !== "PUBLISHED") {
    return { success: false, error: "Course not found." };
  }
  if (offered && course.organizationId && course.organizationId !== orgId) {
    return { success: false, error: "This course is already offered by another organization." };
  }

  await db.course.update({
    where: { id: courseId },
    data: { organizationId: offered ? orgId : null },
  });

  revalidatePath(`/org/${orgSlug}/courses`);
  revalidatePath(`/organizations/${orgSlug}`);
  revalidatePath(`/courses/${course.slug}`);
  revalidateTag("published-organizations");
  return { success: true, data: undefined };
}

// ─── Platform admin ─────────────────────────────────────────────────────────

export async function getAdminOrganizations() {
  await requireAdmin();
  return db.organization.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { members: true, kitRequests: true, courses: true } },
    },
  });
}

export async function adminCreateOrganization(input: {
  name: string;
  slug: string;
  type: OrgType;
  logoUrl?: string;
  isVerified?: boolean;
}): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();

  const slug = input.slug.trim().toLowerCase().replace(/\s+/g, "-");
  if (!slug || !input.name.trim()) {
    return { success: false, error: "Name and slug are required." };
  }

  const existing = await db.organization.findUnique({ where: { slug } });
  if (existing) return { success: false, error: "Slug already in use." };

  const org = await db.organization.create({
    data: {
      name: input.name.trim(),
      slug,
      type: input.type,
      logoUrl: input.logoUrl ?? null,
      isVerified: input.isVerified ?? false,
    },
  });

  revalidatePath("/admin/organizations");
  revalidatePath("/organizations");
  revalidateTag("published-organizations");
  return { success: true, data: { id: org.id } };
}

export async function adminUpdateOrganization(
  orgId: string,
  input: {
    name?: string;
    slug?: string;
    type?: OrgType;
    logoUrl?: string | null;
    isVerified?: boolean;
  }
): Promise<ActionResult> {
  await requireAdmin();

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) return { success: false, error: "Organization not found." };

  if (input.slug && input.slug !== org.slug) {
    const taken = await db.organization.findUnique({ where: { slug: input.slug } });
    if (taken) return { success: false, error: "Slug already in use." };
  }

  await db.organization.update({
    where: { id: orgId },
    data: {
      name: input.name?.trim() ?? org.name,
      slug: input.slug?.trim() ?? org.slug,
      type: input.type ?? org.type,
      logoUrl: input.logoUrl !== undefined ? input.logoUrl : org.logoUrl,
      isVerified: input.isVerified ?? org.isVerified,
    },
  });

  revalidatePath("/admin/organizations");
  revalidatePath("/organizations");
  revalidateTag("published-organizations");
  return { success: true, data: undefined };
}

// ─── Org admin credential creation ───────────────────────────────────────────

/**
 * Super-admin creates an ORG_ADMIN account for an organisation.
 * Generates a temporary password, creates the user, adds them as org ADMIN,
 * and emails them their login credentials.
 */
export async function createOrgAdminCredentials(
  orgId: string,
  input: { fullName: string; email: string }
): Promise<ActionResult<{ userId: string }>> {
  await requireAdmin();

  const org = await db.organization.findUnique({ where: { id: orgId } });
  if (!org) return { success: false, error: "Organisation not found." };

  // Check email not already in use
  const existing = await db.user.findUnique({ where: { email: input.email.toLowerCase().trim() } });
  if (existing) {
    // If user exists, just add them to the org as ADMIN if not already
    const alreadyMember = await db.organizationMember.findUnique({
      where: { orgId_userId: { orgId, userId: existing.id } },
    });
    if (!alreadyMember) {
      await db.organizationMember.create({
        data: { orgId, userId: existing.id, role: "ADMIN" },
      });
      await db.user.update({
        where: { id: existing.id },
        data: { role: "ORG_ADMIN" },
      });
    }
    revalidatePath("/admin/organizations");
    return { success: true, data: { userId: existing.id } };
  }

  // Generate a secure temporary password
  const tempPassword = randomBytes(5).toString("hex").toUpperCase() + "!1";
  const passwordHash = await hash(tempPassword, 12);

  // Generate username from email
  const baseUsername = input.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
  let username = baseUsername;
  let suffix = 0;
  while (await db.user.findUnique({ where: { username } })) {
    suffix++;
    username = `${baseUsername}${suffix}`;
  }

  const user = await db.user.create({
    data: {
      email: input.email.toLowerCase().trim(),
      fullName: input.fullName.trim(),
      username,
      passwordHash,
      role: "ORG_ADMIN",
      emailVerified: true,
    },
  });

  await db.organizationMember.create({
    data: { orgId, userId: user.id, role: "ADMIN" },
  });

  // Send credentials email
  await sendEmail({
    to: user.email,
    subject: `[ujuziPlus] Your Organisation Admin Account — ${org.name}`,
    html: orgAdminCredentialsEmail({
      fullName: user.fullName ?? input.fullName,
      orgName: org.name,
      email: user.email,
      password: tempPassword,
      loginUrl: `${APP_URL}/auth/login`,
    }),
  });

  revalidatePath("/admin/organizations");
  return { success: true, data: { userId: user.id } };
}

export async function adminDeleteOrganization(orgId: string): Promise<ActionResult> {
  await requireAdmin();

  try {
    await db.organization.delete({ where: { id: orgId } });
  } catch {
    return { success: false, error: "Could not delete this organization. Try again or contact support." };
  }

  revalidatePath("/admin/organizations");
  revalidatePath("/organizations");
  revalidateTag("published-organizations");
  return { success: true, data: undefined };
}

export async function getOrgAdminUsers(orgId: string) {
  await requireAdmin();
  return db.organizationMember.findMany({
    where: { orgId, role: "ADMIN" },
    include: { user: { select: { id: true, fullName: true, email: true, createdAt: true } } },
  });
}

export async function getPublicUserProfile(username: string, viewerId?: string | null) {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      fullName: true,
      username: true,
      avatarUrl: true,
      bio: true,
      location: true,
      website: true,
      linkedin: true,
      github: true,
      role: true,
      createdAt: true,
      publicProfile: true,
      showCoursesOnProfile: true,
      showCertificatesOnProfile: true,
    },
  });
  if (!user) return null;
  if (!user.publicProfile && user.id !== viewerId) return null;

  const [courses, certCount, discussionCount, instructorCredentials] = await Promise.all([
    user.showCoursesOnProfile && user.role === "INSTRUCTOR"
      ? db.course.findMany({
          where: { instructorId: user.id, status: "PUBLISHED" },
          select: { id: true, title: true, slug: true, thumbnailUrl: true },
          orderBy: { title: "asc" },
          take: 12,
        })
      : [],
    user.showCertificatesOnProfile
      ? db.certificate.count({ where: { userId: user.id } })
      : 0,
    db.discussion.count({ where: { authorId: user.id } }),
    user.role === "INSTRUCTOR"
      ? db.instructorCredential.findMany({
          where: { userId: user.id },
          orderBy: { orderIndex: "asc" },
        })
      : [],
  ]);

  return { user, courses, certCount, discussionCount, instructorCredentials };
}
