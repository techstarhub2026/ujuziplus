/**
 * Organization members & email invites
 */
"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { OrgMemberRole } from "@prisma/client";
import type { ActionResult } from "./courses";
import { requireUser } from "@/lib/auth-server";
import { sendEmail, orgInviteEmail } from "@/lib/email";
import { createNotification } from "@/lib/actions/notifications";

const INVITE_DAYS = 7;

async function requireOrgAdmin(orgSlug: string, userId: string) {
  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return { ok: false as const, error: "Organization not found." };

  const member = await db.organizationMember.findUnique({
    where: { orgId_userId: { orgId: org.id, userId } },
  });
  if (!member || member.role !== "ADMIN") {
    return { ok: false as const, error: "Only org admins can manage members." };
  }
  return { ok: true as const, org, member };
}

function inviteToken() {
  return randomBytes(32).toString("hex");
}

export async function getOrgMembers(orgSlug: string) {
  const org = await db.organization.findUnique({ where: { slug: orgSlug } });
  if (!org) return { members: [], invites: [] };

  const [members, invites] = await Promise.all([
    db.organizationMember.findMany({
      where: { orgId: org.id },
      include: {
        user: {
          select: { id: true, fullName: true, email: true, username: true, avatarUrl: true },
        },
      },
      orderBy: { user: { fullName: "asc" } },
    }),
    db.orgInvite.findMany({
      where: { orgId: org.id, status: "PENDING", expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return { members, invites };
}

export async function inviteOrgMember(
  actorUserId: string,
  orgSlug: string,
  input: { email: string; role: OrgMemberRole }
): Promise<ActionResult> {
  const { user } = await requireUser();
  if (user.id !== actorUserId && user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized." };
  }

  const access = await requireOrgAdmin(orgSlug, actorUserId);
  if (!access.ok) return { success: false, error: access.error };

  const email = input.email.toLowerCase().trim();
  if (!email.includes("@")) return { success: false, error: "Enter a valid email." };

  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    const member = await db.organizationMember.findUnique({
      where: { orgId_userId: { orgId: access.org.id, userId: existingUser.id } },
    });
    if (member) return { success: false, error: "This user is already a member." };
  }

  const pending = await db.orgInvite.findFirst({
    where: { orgId: access.org.id, email, status: "PENDING", expiresAt: { gt: new Date() } },
  });
  if (pending) return { success: false, error: "An invite is already pending for this email." };

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_DAYS);

  const invite = await db.orgInvite.create({
    data: {
      orgId: access.org.id,
      email,
      role: input.role,
      token: inviteToken(),
      invitedById: actorUserId,
      expiresAt,
    },
  });

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const acceptUrl = `${base}/invite/org/${invite.token}`;

  const emailResult = await sendEmail({
    to: email,
    subject: `Invitation to join ${access.org.name} on UjuziLab`,
    html: orgInviteEmail({
      orgName: access.org.name,
      inviterName: user.fullName,
      role: input.role.toLowerCase(),
      acceptUrl,
      expiresAt: expiresAt.toLocaleDateString("en-TZ"),
    }),
  });
  if (!emailResult.ok) {
    console.error("Org invite email failed:", emailResult.error);
  }

  revalidatePath(`/org/${orgSlug}/members`);
  return { success: true, data: undefined };
}

export async function revokeOrgInvite(
  actorUserId: string,
  orgSlug: string,
  inviteId: string
): Promise<ActionResult> {
  const access = await requireOrgAdmin(orgSlug, actorUserId);
  if (!access.ok) return { success: false, error: access.error };

  await db.orgInvite.updateMany({
    where: { id: inviteId, orgId: access.org.id, status: "PENDING" },
    data: { status: "REVOKED" },
  });

  revalidatePath(`/org/${orgSlug}/members`);
  return { success: true, data: undefined };
}

export async function getOrgInviteByToken(token: string) {
  const invite = await db.orgInvite.findUnique({
    where: { token },
    include: { org: true, invitedBy: { select: { fullName: true } } },
  });
  if (!invite || invite.status !== "PENDING") return null;
  if (invite.expiresAt < new Date()) {
    await db.orgInvite.update({
      where: { id: invite.id },
      data: { status: "EXPIRED" },
    });
    return null;
  }
  return invite;
}

export async function acceptOrgInvite(
  userId: string,
  token: string
): Promise<ActionResult<{ orgSlug: string }>> {
  const { user } = await requireUser();
  if (user.id !== userId) return { success: false, error: "Unauthorized." };

  const invite = await getOrgInviteByToken(token);
  if (!invite) return { success: false, error: "Invite is invalid or expired." };

  if (user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return {
      success: false,
      error: `Sign in as ${invite.email} to accept this invitation.`,
    };
  }

  await db.$transaction([
    db.organizationMember.create({
      data: { orgId: invite.orgId, userId, role: invite.role },
    }),
    db.orgInvite.update({
      where: { id: invite.id },
      data: { status: "ACCEPTED", acceptedAt: new Date() },
    }),
    db.organization.update({
      where: { id: invite.orgId },
      data: { memberCount: { increment: 1 } },
    }),
  ]);

  await createNotification(userId, {
    type: "SYSTEM",
    title: `Welcome to ${invite.org.name}`,
    message: `You joined ${invite.org.name} as ${invite.role.toLowerCase()}.`,
    href: `/org/${invite.org.slug}/dashboard`,
    prefCategory: "Enrollment confirmations",
  });

  revalidatePath(`/org/${invite.org.slug}/members`);
  return { success: true, data: { orgSlug: invite.org.slug } };
}

export async function removeOrgMember(
  actorUserId: string,
  orgSlug: string,
  memberUserId: string
): Promise<ActionResult> {
  const access = await requireOrgAdmin(orgSlug, actorUserId);
  if (!access.ok) return { success: false, error: access.error };

  if (memberUserId === actorUserId) {
    return { success: false, error: "You cannot remove yourself." };
  }

  const deleted = await db.organizationMember.deleteMany({
    where: { orgId: access.org.id, userId: memberUserId },
  });
  if (deleted.count === 0) return { success: false, error: "Member not found." };

  await db.organization.update({
    where: { id: access.org.id },
    data: { memberCount: { decrement: 1 } },
  });

  revalidatePath(`/org/${orgSlug}/members`);
  return { success: true, data: undefined };
}

const ROLE_MAP: Record<string, OrgMemberRole> = {
  member: "MEMBER",
  instructor: "INSTRUCTOR",
  admin: "ADMIN",
};

function parseMemberRole(raw: string): OrgMemberRole | null {
  const key = raw.trim().toLowerCase();
  return ROLE_MAP[key] ?? null;
}

function parseBulkCsv(text: string): { email: string; role: OrgMemberRole }[] {
  const lines = text
    .trim()
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const first = lines[0].toLowerCase();
  const hasHeader = first.includes("email") && first.includes("role");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const rows: { email: string; role: OrgMemberRole }[] = [];
  for (const line of dataLines) {
    const parts = line.split(",").map((p) => p.trim().replace(/^"|"$/g, ""));
    if (parts.length < 2) continue;
    const email = parts[0].toLowerCase();
    const role = parseMemberRole(parts[1]);
    if (!email.includes("@") || !role) continue;
    rows.push({ email, role });
  }
  return rows;
}

async function addExistingUserToOrg(
  org: { id: string; name: string; slug: string },
  userId: string,
  role: OrgMemberRole
) {
  await db.$transaction([
    db.organizationMember.create({
      data: { orgId: org.id, userId, role },
    }),
    db.organization.update({
      where: { id: org.id },
      data: { memberCount: { increment: 1 } },
    }),
  ]);

  await createNotification(userId, {
    type: "SYSTEM",
    title: `Welcome to ${org.name}`,
    message: `You were added to ${org.name} as ${role.toLowerCase()}.`,
    href: `/org/${org.slug}/dashboard`,
    prefCategory: "Enrollment confirmations",
  });
}

async function sendOrgInviteForBulk(
  org: { id: string; name: string; slug: string },
  actorUserId: string,
  actorName: string,
  email: string,
  role: OrgMemberRole
): Promise<"invited" | "skipped"> {
  const pending = await db.orgInvite.findFirst({
    where: { orgId: org.id, email, status: "PENDING", expiresAt: { gt: new Date() } },
  });
  if (pending) return "skipped";

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + INVITE_DAYS);

  const invite = await db.orgInvite.create({
    data: {
      orgId: org.id,
      email,
      role,
      token: inviteToken(),
      invitedById: actorUserId,
      expiresAt,
    },
  });

  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const acceptUrl = `${base}/invite/org/${invite.token}`;

  const emailResult = await sendEmail({
    to: email,
    subject: `Invitation to join ${org.name} on UjuziLab`,
    html: orgInviteEmail({
      orgName: org.name,
      inviterName: actorName,
      role: role.toLowerCase(),
      acceptUrl,
      expiresAt: expiresAt.toLocaleDateString("en-TZ"),
    }),
  });
  if (!emailResult.ok) {
    console.error("Bulk org invite email failed:", emailResult.error);
  }

  return "invited";
}

export async function bulkImportOrgMembers(
  actorUserId: string,
  orgSlug: string,
  csvText: string
): Promise<
  ActionResult<{
    added: number;
    invited: number;
    skipped: number;
    errors: string[];
  }>
> {
  const { user } = await requireUser();
  if (user.id !== actorUserId && user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized." };
  }

  const access = await requireOrgAdmin(orgSlug, actorUserId);
  if (!access.ok) return { success: false, error: access.error };

  const rows = parseBulkCsv(csvText);
  if (rows.length === 0) {
    return {
      success: false,
      error: "No valid rows found. Use CSV format: email,role (member|instructor|admin).",
    };
  }
  if (rows.length > 500) {
    return { success: false, error: "Maximum 500 rows per import." };
  }

  let added = 0;
  let invited = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    try {
      const existingUser = await db.user.findUnique({ where: { email: row.email } });
      if (existingUser) {
        const member = await db.organizationMember.findUnique({
          where: { orgId_userId: { orgId: access.org.id, userId: existingUser.id } },
        });
        if (member) {
          skipped++;
          continue;
        }
        await addExistingUserToOrg(access.org, existingUser.id, row.role);
        added++;
        continue;
      }

      const result = await sendOrgInviteForBulk(
        access.org,
        actorUserId,
        user.fullName,
        row.email,
        row.role
      );
      if (result === "invited") invited++;
      else skipped++;
    } catch (err) {
      errors.push(`${row.email}: ${err instanceof Error ? err.message : "failed"}`);
    }
  }

  revalidatePath(`/org/${orgSlug}/members`);
  return { success: true, data: { added, invited, skipped, errors } };
}
