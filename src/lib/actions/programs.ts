"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "./courses";
import { ProgramFormat, ProgramStatus } from "@prisma/client";
import { requireUser, assertSelfOrAdmin, requireAdmin } from "@/lib/auth-server";
import { createNotification } from "@/lib/actions/notifications";
import { sendEmail, programRegistrationEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";
import { assertProgramManager } from "./program-units";

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "program"
  );
}

async function uniqueProgramSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let slug = base;
  let i = 0;
  while (true) {
    const existing = await db.program.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    i++;
    slug = `${base}-${i}`;
  }
  return slug;
}

// ─── Public queries ───────────────────────────────────────────────────────────

export async function getPrograms() {
  return getProgramsCached();
}

const getProgramsCached = unstable_cache(
  async () =>
    db.program.findMany({
      where: { status: { notIn: ["DRAFT", "ARCHIVED"] } },
      orderBy: { startDate: "asc" },
      include: { organization: { select: { id: true, name: true, slug: true, logoUrl: true } } },
    }),
  ["published-programs"],
  { revalidate: 60, tags: ["published-programs"] }
);

export async function getProgramBySlug(slug: string) {
  return db.program.findUnique({
    where: { slug },
    include: {
      _count: { select: { registrations: true, units: true } },
      organization: { select: { id: true, name: true, slug: true, logoUrl: true } },
    },
  });
}

export async function getUserProgramRegistrations(userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const regs = await db.programRegistration.findMany({
    where: { userId },
    select: { programId: true, program: { select: { slug: true } } },
  });
  return regs.map((r) => r.program.slug);
}

// ─── Registration (free programs) ────────────────────────────────────────────

export async function registerForProgram(
  userId: string,
  programSlug: string
): Promise<ActionResult<{ requiresPayment?: boolean; orderId?: string }>> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const program = await db.program.findUnique({
    where: { slug: programSlug },
    include: { organization: { select: { name: true } } },
  });

  if (!program || program.status !== "OPEN") {
    return { success: false, error: "Program is not open for registration." };
  }
  if (program.enrolledCount >= program.seats) {
    return { success: false, error: "This program is full." };
  }

  const existing = await db.programRegistration.findUnique({
    where: { userId_programId: { userId, programId: program.id } },
  });
  if (existing) return { success: false, error: "You are already registered." };

  // Paid program → create an order and return for checkout
  const price = Number(program.price);
  if (price > 0) {
    const order = await db.order.create({
      data: {
        userId,
        subtotal: price,
        discountAmount: 0,
        total: price,
        status: "PENDING",
        items: {
          create: { programId: program.id, price },
        },
      },
    });
    return { success: true, data: { requiresPayment: true, orderId: order.id } };
  }

  // Free program → register immediately
  const dbUser = await db.user.findUnique({
    where: { id: userId },
    select: { fullName: true, email: true },
  });

  await db.$transaction([
    db.programRegistration.create({ data: { userId, programId: program.id } }),
    db.program.update({
      where: { id: program.id },
      data: {
        enrolledCount: { increment: 1 },
        status: program.enrolledCount + 1 >= program.seats ? "FULL" : "OPEN",
      },
    }),
  ]);

  // In-app notification
  await createNotification(userId, {
    type: "PROGRAM_REGISTERED",
    title: "Registration confirmed",
    message: `You are registered for "${program.title}".`,
    href: `/programs/${programSlug}`,
    prefCategory: "Program updates",
  });

  // Email confirmation
  if (dbUser?.email) {
    const startDate = program.startDate
      ? new Date(program.startDate).toLocaleDateString("en-TZ", {
          day: "numeric", month: "long", year: "numeric",
        })
      : "TBD";

    await sendEmail({
      to: dbUser.email,
      subject: `[ujuziPlus] Registration confirmed — ${program.title}`,
      html: programRegistrationEmail({
        fullName: dbUser.fullName ?? "Learner",
        programTitle: program.title,
        programType: program.type,
        startDate,
        format: program.format.replace("_", " "),
        price: "Free",
        programUrl: `${APP_URL}/programs/${programSlug}`,
        dashboardUrl: `${APP_URL}/dashboard/programs`,
      }),
    });
  }

  revalidatePath("/dashboard/programs");
  revalidatePath("/programs");
  revalidatePath(`/programs/${programSlug}`);
  return { success: true, data: {} };
}

// ─── Admin CRUD ───────────────────────────────────────────────────────────────

export async function getProgramById(programId: string) {
  await requireAdmin();
  return db.program.findUnique({
    where: { id: programId },
    include: { organization: { select: { id: true, name: true } } },
  });
}

export async function getAdminPrograms() {
  await requireAdmin();
  return db.program.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { registrations: true } },
      organization: { select: { id: true, name: true } },
    },
  });
}

export async function getAdminProgramRegistrations(programId: string) {
  await assertProgramManager(programId);
  return db.programRegistration.findMany({
    where: { programId },
    include: {
      user: { select: { id: true, fullName: true, email: true, createdAt: true } },
    },
    orderBy: { registeredAt: "desc" },
  });
}

/** For admin program form dropdowns */
export async function getOrgsForSelect() {
  await requireAdmin();
  return db.organization.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export type ProgramSaveInput = {
  title: string;
  type: string;
  thumbnailUrl?: string | null;
  posterUrl?: string | null;
  description?: string;
  startDate?: string;
  endDate?: string;
  format: ProgramFormat;
  seats: number;
  price: number;
  status: ProgramStatus;
  organizationId?: string | null;
};

export async function createProgram(
  input: ProgramSaveInput
): Promise<ActionResult<{ programId: string }>> {
  await requireAdmin();
  if (!input.title.trim()) return { success: false, error: "Title is required." };

  const slug = await uniqueProgramSlug(input.title);
  const program = await db.program.create({
    data: {
      slug,
      title: input.title.trim(),
      type: input.type.trim() || "Program",
      thumbnailUrl: input.thumbnailUrl?.trim() || null,
      posterUrl: input.posterUrl?.trim() || null,
      description: input.description?.trim() ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      format: input.format,
      seats: input.seats,
      price: input.price,
      status: input.status,
      organizationId: input.organizationId || null,
    },
  });

  revalidatePath("/admin/programs");
  revalidatePath("/programs");
  revalidatePath("/");
  return { success: true, data: { programId: program.id } };
}

export async function updateProgram(
  programId: string,
  input: ProgramSaveInput
): Promise<ActionResult> {
  await requireAdmin();
  const existing = await db.program.findUnique({ where: { id: programId } });
  if (!existing) return { success: false, error: "Program not found." };

  const slug =
    slugify(input.title) === existing.slug
      ? existing.slug
      : await uniqueProgramSlug(input.title, programId);

  await db.program.update({
    where: { id: programId },
    data: {
      slug,
      title: input.title.trim(),
      type: input.type.trim() || "Program",
      thumbnailUrl: input.thumbnailUrl?.trim() || null,
      posterUrl: input.posterUrl?.trim() || null,
      description: input.description?.trim() ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      format: input.format,
      seats: input.seats,
      price: input.price,
      status: input.status,
      organizationId: input.organizationId || null,
    },
  });

  revalidatePath("/admin/programs");
  revalidatePath(`/programs/${slug}`);
  revalidatePath("/programs");
  revalidatePath("/");
  return { success: true, data: undefined };
}

export async function deleteProgram(programId: string): Promise<ActionResult> {
  await requireAdmin();
  await db.program.delete({ where: { id: programId } });
  revalidatePath("/admin/programs");
  revalidatePath("/programs");
  return { success: true, data: undefined };
}

// ─── Org admin program management ────────────────────────────────────────────

/** Org admin: get programs belonging to their org */
export async function getOrgPrograms(orgId: string) {
  const { user } = await requireUser();
  const membership = await db.organizationMember.findFirst({
    where: { orgId, userId: user.id, role: { in: ["ADMIN", "INSTRUCTOR"] } },
  });
  if (!membership && user.role !== "ADMIN") {
    throw new Error("Not authorised to view these programs.");
  }
  return db.program.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { registrations: true } } },
  });
}

/** Org admin: create a program under their org */
export async function createOrgProgram(
  orgId: string,
  input: Omit<ProgramSaveInput, "organizationId">
): Promise<ActionResult<{ programId: string }>> {
  const { user } = await requireUser();
  const membership = await db.organizationMember.findFirst({
    where: { orgId, userId: user.id, role: "ADMIN" },
  });
  if (!membership && user.role !== "ADMIN") {
    return { success: false, error: "Not authorised to create programs for this organisation." };
  }
  if (!input.title.trim()) return { success: false, error: "Title is required." };

  const slug = await uniqueProgramSlug(input.title);
  const program = await db.program.create({
    data: {
      slug,
      title: input.title.trim(),
      type: input.type.trim() || "Program",
      thumbnailUrl: input.thumbnailUrl?.trim() || null,
      posterUrl: input.posterUrl?.trim() || null,
      description: input.description?.trim() ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      format: input.format,
      seats: input.seats,
      price: input.price,
      status: input.status,
      organizationId: orgId,
    },
  });

  revalidatePath(`/org/${orgId}/programs`);
  revalidatePath("/programs");
  return { success: true, data: { programId: program.id } };
}

/** Org admin: update a program they own */
export async function updateOrgProgram(
  programId: string,
  orgId: string,
  input: Omit<ProgramSaveInput, "organizationId">
): Promise<ActionResult> {
  const { user } = await requireUser();
  const membership = await db.organizationMember.findFirst({
    where: { orgId, userId: user.id, role: "ADMIN" },
  });
  if (!membership && user.role !== "ADMIN") {
    return { success: false, error: "Not authorised." };
  }

  const existing = await db.program.findUnique({ where: { id: programId } });
  if (!existing || existing.organizationId !== orgId) {
    return { success: false, error: "Program not found in this organisation." };
  }

  const slug =
    slugify(input.title) === existing.slug
      ? existing.slug
      : await uniqueProgramSlug(input.title, programId);

  await db.program.update({
    where: { id: programId },
    data: {
      slug,
      title: input.title.trim(),
      type: input.type.trim() || "Program",
      thumbnailUrl: input.thumbnailUrl?.trim() || null,
      posterUrl: input.posterUrl?.trim() || null,
      description: input.description?.trim() ?? null,
      startDate: input.startDate ? new Date(input.startDate) : null,
      endDate: input.endDate ? new Date(input.endDate) : null,
      format: input.format,
      seats: input.seats,
      price: input.price,
      status: input.status,
    },
  });

  revalidatePath(`/org/${orgId}/programs`);
  revalidatePath(`/programs/${slug}`);
  revalidatePath("/programs");
  return { success: true, data: undefined };
}

// ─── Broadcast email to all registrants ──────────────────────────────────────

export async function broadcastToProgramRegistrants(
  programId: string,
  subject: string,
  message: string
): Promise<ActionResult<{ sent: number }>> {
  await assertProgramManager(programId);

  const program = await db.program.findUnique({ where: { id: programId } });
  if (!program) return { success: false, error: "Program not found." };

  const registrations = await db.programRegistration.findMany({
    where: { programId },
    include: { user: { select: { fullName: true, email: true } } },
  });

  let sent = 0;
  for (const reg of registrations) {
    if (!reg.user.email) continue;
    const result = await sendEmail({
      to: reg.user.email,
      subject: `[ujuziPlus] ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
          <div style="background:#00004D;padding:20px 32px;border-radius:8px 8px 0 0;">
            <h1 style="color:#fff;margin:0;font-size:18px;">ujuziPlus · ${program.title}</h1>
          </div>
          <div style="background:#fff;padding:28px 32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
            <p>Hi <strong>${reg.user.fullName ?? "Learner"}</strong>,</p>
            <div style="white-space:pre-wrap;line-height:1.7;color:#333;">${message}</div>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
            <p style="font-size:12px;color:#999;text-align:center;">
              ujuziPlus · You received this because you are registered for "${program.title}"
            </p>
          </div>
        </div>
      `,
    });
    if (result.ok) sent++;
  }

  return { success: true, data: { sent } };
}
