/**
 * IoT Solutions catalog, community contributions & workspace joins
 */
"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { ContentDifficulty, SolutionStatus } from "@prisma/client";
import type { ActionResult } from "./courses";
import { requireUser, requireAdmin, requireUserFromDb, assertSelfOrAdmin } from "@/lib/auth-server";

// ─── Public reads ─────────────────────────────────────────────────────────────

const getPublishedSolutionsCached = unstable_cache(
  async () =>
    db.solution.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { joins: true } },
        author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
    }),
  ["published-solutions"],
  { revalidate: 60, tags: ["published-solutions"] }
);

export async function getPublishedSolutions() {
  return getPublishedSolutionsCached();
}

export async function getSolutionBySlug(slug: string) {
  const solution = await db.solution.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      _count: { select: { joins: true } },
      author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
      organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
    },
  });
  if (solution) {
    // increment view count non-blocking
    db.solution.update({ where: { id: solution.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  }
  return solution;
}

// ─── User joins & progress ───────────────────────────────────────────────────

export async function getUserJoinedSolutionSlugs(userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);
  const joins = await db.solutionJoin.findMany({
    where: { userId },
    select: { solution: { select: { slug: true } } },
  });
  return joins.map((j) => j.solution.slug);
}

export async function getUserSolutionJoin(userId: string, solutionSlug: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);
  const solution = await db.solution.findFirst({ where: { slug: solutionSlug } });
  if (!solution) return null;
  return db.solutionJoin.findUnique({
    where: { userId_solutionId: { userId, solutionId: solution.id } },
  });
}

export async function getUserSolutionJoins(userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);
  return db.solutionJoin.findMany({
    where: { userId },
    include: { solution: { include: { author: { select: { id: true, fullName: true, username: true, avatarUrl: true } } } } },
    orderBy: { joinedAt: "desc" },
  });
}

export async function joinSolution(userId: string, solutionSlug: string): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);
  const solution = await db.solution.findFirst({ where: { slug: solutionSlug, status: "PUBLISHED" } });
  if (!solution) return { success: false, error: "Solution not found." };
  await db.solutionJoin.upsert({
    where: { userId_solutionId: { userId, solutionId: solution.id } },
    create: { userId, solutionId: solution.id, labProgress: [] },
    update: {},
  });
  revalidatePath("/solutions");
  revalidateTag("published-solutions");
  revalidatePath("/dashboard/solutions");
  return { success: true, data: undefined };
}

export async function updateSolutionLabProgress(
  userId: string,
  solutionSlug: string,
  completedSteps: number[]
): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);
  const solution = await db.solution.findFirst({ where: { slug: solutionSlug } });
  if (!solution) return { success: false, error: "Solution not found." };
  await db.solutionJoin.updateMany({
    where: { userId, solutionId: solution.id },
    data: { labProgress: completedSteps },
  });
  return { success: true, data: undefined };
}

// ─── Community contributions ─────────────────────────────────────────────────

export type LabStepData = {
  id: string;
  title: string;
  content: string;
  imageUrls?: string[];
  pdfUrls?: string[];
};

export type SolutionDraftInput = {
  title: string;
  subtitle?: string;
  description: string;
  level: ContentDifficulty;
  hours: number;
  thumbnailUrl?: string | null;
  tags?: string[];
  components?: string[];
  relatedKitSlugs?: string[];
  labSteps?: LabStepData[];
  codeTemplate?: string;
  orgId?: string | null;
};

function toSlug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

async function uniqueSolutionSlug(title: string) {
  const base = toSlug(title) || "solution";
  let slug = base;
  let n = 0;
  while (await db.solution.findUnique({ where: { slug } })) {
    n++;
    slug = `${base}-${n}`;
  }
  return slug;
}

/** Any verified user can create a draft solution */
export async function createSolutionDraft(
  input: SolutionDraftInput
): Promise<ActionResult<{ slug: string }>> {
  const { user } = await requireUserFromDb();
  if (!user.isActive) return { success: false, error: "Your account is not active." };
  if (!input.title.trim()) return { success: false, error: "Title is required." };

  // If orgId given, verify user is org admin
  if (input.orgId) {
    const isMember = await db.organizationMember.findFirst({
      where: { orgId: input.orgId, userId: user.id, role: { in: ["ADMIN", "INSTRUCTOR"] } },
    });
    if (!isMember && user.role !== "ADMIN") {
      return { success: false, error: "Not authorised to post on behalf of this organisation." };
    }
  }

  const slug = await uniqueSolutionSlug(input.title);
  const solution = await db.solution.create({
    data: {
      slug,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() ?? null,
      description: input.description.trim(),
      level: input.level,
      hours: input.hours,
      thumbnailUrl: input.thumbnailUrl ?? null,
      tags: input.tags ?? [],
      components: input.components ?? [],
      relatedKitSlugs: input.relatedKitSlugs ?? [],
      labSteps: input.labSteps ?? [],
      codeTemplate: input.codeTemplate ?? null,
      status: "DRAFT",
      authorId: user.id,
      orgId: input.orgId ?? null,
    },
  });

  revalidatePath("/solutions");
  revalidateTag("published-solutions");
  revalidatePath("/dashboard/solutions");
  return { success: true, data: { slug: solution.slug } };
}

/** Author updates their own DRAFT or REJECTED solution */
export async function updateSolutionDraft(
  solutionId: string,
  input: SolutionDraftInput
): Promise<ActionResult> {
  const { user } = await requireUser();
  const solution = await db.solution.findUnique({ where: { id: solutionId } });
  if (!solution) return { success: false, error: "Not found." };
  if (solution.authorId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Not authorised." };
  }
  if (!["DRAFT", "REJECTED"].includes(solution.status)) {
    return { success: false, error: "Only drafts and rejected submissions can be edited." };
  }

  await db.solution.update({
    where: { id: solutionId },
    data: {
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() ?? null,
      description: input.description.trim(),
      level: input.level,
      hours: input.hours,
      thumbnailUrl: input.thumbnailUrl ?? null,
      tags: input.tags ?? [],
      components: input.components ?? [],
      relatedKitSlugs: input.relatedKitSlugs ?? [],
      labSteps: input.labSteps ?? [],
      codeTemplate: input.codeTemplate ?? null,
      orgId: input.orgId ?? null,
      rejectionReason: null,
    },
  });

  revalidatePath(`/solutions/${solution.slug}`);
  return { success: true, data: undefined };
}

/** Author submits their draft for admin review */
export async function submitSolutionForReview(solutionId: string): Promise<ActionResult> {
  const { user } = await requireUser();
  const solution = await db.solution.findUnique({ where: { id: solutionId } });
  if (!solution) return { success: false, error: "Not found." };
  if (solution.authorId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Not authorised." };
  }
  if (!["DRAFT", "REJECTED"].includes(solution.status)) {
    return { success: false, error: "Only drafts and rejected submissions can be submitted for review." };
  }
  const steps = solution.labSteps as unknown[];
  if (!solution.title || !solution.description || !steps?.length) {
    return { success: false, error: "Please add a title, description, and at least one lab step before submitting." };
  }

  await db.solution.update({
    where: { id: solutionId },
    data: { status: "PENDING_REVIEW", rejectionReason: null },
  });

  revalidatePath("/solutions");
  revalidateTag("published-solutions");
  revalidatePath("/admin/content");
  return { success: true, data: undefined };
}

/** Get current user's own submissions */
export async function getMySubmissions() {
  const { user } = await requireUser();
  return db.solution.findMany({
    where: { authorId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { joins: true } } },
  });
}

// ─── Admin / Org admin ───────────────────────────────────────────────────────

export async function getAdminSolutions() {
  await requireAdmin();
  return db.solution.findMany({
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
    include: {
      author: { select: { id: true, fullName: true, username: true } },
      organization: { select: { id: true, name: true } },
      _count: { select: { joins: true } },
    },
  });
}

export async function getPendingReviewSolutions() {
  await requireAdmin();
  return db.solution.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { updatedAt: "asc" },
    include: {
      author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
      organization: { select: { id: true, name: true } },
    },
  });
}

export async function adminApproveSolution(solutionId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.solution.update({
    where: { id: solutionId },
    data: { status: "PUBLISHED", rejectionReason: null },
  });
  revalidatePath("/solutions");
  revalidateTag("published-solutions");
  revalidatePath("/admin/content");
  return { success: true, data: undefined };
}

export async function adminRejectSolution(
  solutionId: string,
  reason: string
): Promise<ActionResult> {
  await requireAdmin();
  await db.solution.update({
    where: { id: solutionId },
    data: { status: "REJECTED", rejectionReason: reason.trim() || "Does not meet submission guidelines." },
  });
  revalidatePath("/solutions");
  revalidateTag("published-solutions");
  revalidatePath("/admin/content");
  return { success: true, data: undefined };
}

export async function adminPublishDirectly(
  input: SolutionDraftInput & { id?: string }
): Promise<ActionResult<{ slug: string }>> {
  const { user } = await requireAdmin();
  if (!input.title.trim()) return { success: false, error: "Title is required." };

  if (input.id) {
    const existing = await db.solution.findUnique({ where: { id: input.id } });
    if (!existing) return { success: false, error: "Not found." };
    await db.solution.update({
      where: { id: input.id },
      data: {
        title: input.title.trim(),
        subtitle: input.subtitle?.trim() ?? null,
        description: input.description.trim(),
        level: input.level,
        hours: input.hours,
        thumbnailUrl: input.thumbnailUrl ?? null,
        tags: input.tags ?? [],
        components: input.components ?? [],
        relatedKitSlugs: input.relatedKitSlugs ?? [],
        labSteps: input.labSteps ?? [],
        codeTemplate: input.codeTemplate ?? null,
        orgId: input.orgId ?? null,
        status: "PUBLISHED",
      },
    });
    revalidatePath("/solutions");
  revalidateTag("published-solutions");
    revalidatePath("/admin/content");
    return { success: true, data: { slug: existing.slug } };
  }

  const slug = await uniqueSolutionSlug(input.title);
  const solution = await db.solution.create({
    data: {
      slug,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() ?? null,
      description: input.description.trim(),
      level: input.level,
      hours: input.hours,
      thumbnailUrl: input.thumbnailUrl ?? null,
      tags: input.tags ?? [],
      components: input.components ?? [],
      relatedKitSlugs: input.relatedKitSlugs ?? [],
      labSteps: input.labSteps ?? [],
      codeTemplate: input.codeTemplate ?? null,
      status: "PUBLISHED",
      authorId: user.id,
      orgId: input.orgId ?? null,
    },
  });

  revalidatePath("/solutions");
  revalidateTag("published-solutions");
  revalidatePath("/admin/content");
  return { success: true, data: { slug: solution.slug } };
}

/** Org admin creates a solution for their org */
export async function createOrgSolution(
  orgId: string,
  input: SolutionDraftInput
): Promise<ActionResult<{ slug: string }>> {
  const { user } = await requireUser();
  const membership = await db.organizationMember.findFirst({
    where: { orgId, userId: user.id, role: { in: ["ADMIN", "INSTRUCTOR"] } },
  });
  if (!membership && user.role !== "ADMIN") {
    return { success: false, error: "Not authorised." };
  }
  if (!input.title.trim()) return { success: false, error: "Title is required." };

  const slug = await uniqueSolutionSlug(input.title);
  const isAdmin = user.role === "ADMIN";
  const solution = await db.solution.create({
    data: {
      slug,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() ?? null,
      description: input.description.trim(),
      level: input.level,
      hours: input.hours,
      thumbnailUrl: input.thumbnailUrl ?? null,
      tags: input.tags ?? [],
      components: input.components ?? [],
      relatedKitSlugs: input.relatedKitSlugs ?? [],
      labSteps: input.labSteps ?? [],
      codeTemplate: input.codeTemplate ?? null,
      status: isAdmin ? "PUBLISHED" : "PENDING_REVIEW",
      authorId: user.id,
      orgId,
    },
  });

  revalidatePath("/solutions");
  revalidateTag("published-solutions");
  revalidatePath("/admin/content");
  return { success: true, data: { slug: solution.slug } };
}

// Legacy compat — keep for admin content panel
export async function adminUpsertSolution(input: {
  id?: string;
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  level: ContentDifficulty;
  hours: number;
  thumbnailUrl?: string | null;
  tags?: string[];
  components: string[];
  relatedKitSlugs?: string[];
  labSteps?: string[];
  codeTemplate?: string;
  status: SolutionStatus;
}): Promise<ActionResult> {
  await requireAdmin();
  const data = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() ?? null,
    description: input.description.trim(),
    level: input.level,
    hours: input.hours,
    thumbnailUrl: input.thumbnailUrl ?? null,
    tags: input.tags ?? [],
    components: input.components,
    relatedKitSlugs: input.relatedKitSlugs ?? [],
    labSteps: input.labSteps ?? [],
    codeTemplate: input.codeTemplate ?? null,
    status: input.status,
  };
  if (input.id) {
    await db.solution.update({ where: { id: input.id }, data });
  } else {
    await db.solution.create({ data });
  }
  revalidatePath("/admin/content");
  revalidatePath("/solutions");
  revalidateTag("published-solutions");
  return { success: true, data: undefined };
}

export async function adminDeleteSolution(solutionId: string): Promise<ActionResult> {
  await requireAdmin();

  let solution;
  try {
    solution = await db.solution.delete({ where: { id: solutionId } });
  } catch {
    return { success: false, error: "Not found." };
  }

  revalidatePath("/admin/content");
  revalidatePath("/solutions");
  revalidateTag("published-solutions");
  revalidatePath(`/solutions/${solution.slug}`);
  return { success: true, data: undefined };
}

/** Author deletes their own DRAFT or REJECTED solution */
export async function deleteSolutionDraft(solutionId: string): Promise<ActionResult> {
  const { user } = await requireUser();
  const solution = await db.solution.findUnique({ where: { id: solutionId } });
  if (!solution) return { success: false, error: "Not found." };
  if (solution.authorId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Not authorised." };
  }
  if (!["DRAFT", "REJECTED"].includes(solution.status)) {
    return { success: false, error: "Only drafts and rejected submissions can be deleted." };
  }

  await db.solution.delete({ where: { id: solutionId } });

  revalidatePath("/solutions");
  revalidateTag("published-solutions");
  revalidatePath("/dashboard/solutions");
  return { success: true, data: undefined };
}
