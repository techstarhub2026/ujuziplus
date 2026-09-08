/**
 * Competitions & hackathons
 */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "./courses";
import { CompetitionStatus } from "@prisma/client";
import { requireUser, assertSelfOrAdmin, requireAdmin } from "@/lib/auth-server";

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "competition"
  );
}

async function uniqueCompetitionSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let slug = base;
  let i = 0;
  while (true) {
    const existing = await db.competition.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    i++;
    slug = `${base}-${i}`;
  }
  return slug;
}

function revalidateCompetitionCatalog(slug?: string) {
  revalidateTag("published-competitions");
  revalidatePath("/competitions");
  revalidatePath("/");
  if (slug) revalidatePath(`/competitions/${slug}`);
}

export async function getCompetitions() {
  return getCompetitionsCached();
}

const getCompetitionsCached = unstable_cache(
  async () =>
    db.competition.findMany({
      orderBy: { startDate: "asc" },
      select: {
        id: true,
        slug: true,
        title: true,
        thumbnailUrl: true,
        startDate: true,
        endDate: true,
        prize: true,
        status: true,
        teamsCount: true,
        description: true,
      },
    }),
  ["published-competitions"],
  { revalidate: 60, tags: ["published-competitions"] }
);

export async function getCompetitionBySlug(slug: string) {
  return db.competition.findUnique({
    where: { slug },
    include: { _count: { select: { registrations: true } } },
  });
}

export async function getUserCompetitionRegistrations(userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const regs = await db.competitionRegistration.findMany({
    where: { userId },
    select: { competition: { select: { slug: true } }, teamName: true },
  });
  return regs;
}

export async function registerForCompetition(
  userId: string,
  competitionSlug: string,
  teamName?: string
): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const competition = await db.competition.findUnique({
    where: { slug: competitionSlug },
  });
  if (!competition || competition.status !== "REGISTRATION_OPEN") {
    return { success: false, error: "Registration is not open for this competition." };
  }

  const existing = await db.competitionRegistration.findUnique({
    where: { userId_competitionId: { userId, competitionId: competition.id } },
  });
  if (existing) return { success: false, error: "You are already registered." };

  await db.$transaction([
    db.competitionRegistration.create({
      data: {
        userId,
        competitionId: competition.id,
        teamName: teamName?.trim() || null,
      },
    }),
    db.competition.update({
      where: { id: competition.id },
      data: { teamsCount: { increment: 1 } },
    }),
  ]);

  revalidatePath("/dashboard/competitions");
  revalidateCompetitionCatalog(competitionSlug);
  return { success: true, data: undefined };
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function getCompetitionById(competitionId: string) {
  await requireAdmin();
  return db.competition.findUnique({ where: { id: competitionId } });
}

export async function getAdminCompetitions() {
  await requireAdmin();
  return db.competition.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { registrations: true } } },
  });
}

export type CompetitionSaveInput = {
  title: string;
  thumbnailUrl?: string | null;
  description?: string;
  startDate?: string;
  endDate?: string;
  prize?: string;
  status: CompetitionStatus;
};

export async function createCompetition(
  input: CompetitionSaveInput
): Promise<ActionResult<{ competitionId: string }>> {
  await requireAdmin();
  if (!input.title.trim()) return { success: false, error: "Title is required." };

  const slug = await uniqueCompetitionSlug(input.title);
  const competition = await db.competition.create({
    data: {
      slug,
      title: input.title.trim(),
      thumbnailUrl: input.thumbnailUrl?.trim() || null,
      description: input.description?.trim() ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      prize: input.prize?.trim() ?? null,
      status: input.status,
    },
  });

  revalidatePath("/admin/competitions");
  revalidateCompetitionCatalog();
  return { success: true, data: { competitionId: competition.id } };
}

export async function updateCompetition(
  competitionId: string,
  input: CompetitionSaveInput
): Promise<ActionResult> {
  await requireAdmin();
  const existing = await db.competition.findUnique({ where: { id: competitionId } });
  if (!existing) return { success: false, error: "Competition not found." };

  const slug =
    slugify(input.title) === existing.slug
      ? existing.slug
      : await uniqueCompetitionSlug(input.title, competitionId);

  await db.competition.update({
    where: { id: competitionId },
    data: {
      slug,
      title: input.title.trim(),
      thumbnailUrl: input.thumbnailUrl?.trim() || null,
      description: input.description?.trim() ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      prize: input.prize?.trim() ?? null,
      status: input.status,
    },
  });

  revalidatePath("/admin/competitions");
  revalidateCompetitionCatalog(existing.slug);
  return { success: true, data: undefined };
}

export async function deleteCompetition(competitionId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.competition.delete({ where: { id: competitionId } });
  revalidatePath("/admin/competitions");
  revalidateCompetitionCatalog();
  return { success: true, data: undefined };
}
