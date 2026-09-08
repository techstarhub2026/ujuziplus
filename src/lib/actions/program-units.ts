/**
 * Program curriculum (units) — links Courses to a Program in order.
 * Progress is derived from the learner's existing Enrollment/LessonProgress —
 * no separate progress-tracking table.
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "./courses";
import { requireUser } from "@/lib/auth-server";

/** Platform admin, or an ADMIN-role member of the program's organisation. */
export async function assertProgramManager(programId: string) {
  const { user } = await requireUser();
  if (user.role === "ADMIN" || user.role === "MODERATOR") return;

  const program = await db.program.findUnique({
    where: { id: programId },
    select: { organizationId: true },
  });
  if (!program?.organizationId) throw new Error("Forbidden");

  const membership = await db.organizationMember.findFirst({
    where: { orgId: program.organizationId, userId: user.id, role: "ADMIN" },
  });
  if (!membership) throw new Error("Forbidden");
}

export async function getCoursesForSelect() {
  await requireUser();
  return db.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true },
    orderBy: { title: "asc" },
  });
}

export async function addProgramUnit(
  programId: string,
  courseId: string
): Promise<ActionResult<{ id: string }>> {
  await assertProgramManager(programId);

  const existing = await db.programUnit.findUnique({
    where: { programId_courseId: { programId, courseId } },
  });
  if (existing) return { success: false, error: "This course is already a unit in the program." };

  const last = await db.programUnit.findFirst({
    where: { programId },
    orderBy: { orderIndex: "desc" },
    select: { orderIndex: true },
  });

  const unit = await db.programUnit.create({
    data: { programId, courseId, orderIndex: (last?.orderIndex ?? -1) + 1 },
  });

  revalidatePath(`/admin/programs/${programId}/edit`);
  return { success: true, data: { id: unit.id } };
}

export async function removeProgramUnit(unitId: string): Promise<ActionResult> {
  const unit = await db.programUnit.findUnique({ where: { id: unitId } });
  if (!unit) return { success: false, error: "Unit not found." };
  await assertProgramManager(unit.programId);

  await db.programUnit.delete({ where: { id: unitId } });
  revalidatePath(`/admin/programs/${unit.programId}/edit`);
  return { success: true, data: undefined };
}

export async function reorderProgramUnit(
  unitId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const unit = await db.programUnit.findUnique({ where: { id: unitId } });
  if (!unit) return { success: false, error: "Unit not found." };
  await assertProgramManager(unit.programId);

  const siblings = await db.programUnit.findMany({
    where: { programId: unit.programId },
    orderBy: { orderIndex: "asc" },
  });
  const idx = siblings.findIndex((s) => s.id === unitId);
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= siblings.length) return { success: true, data: undefined };

  const a = siblings[idx];
  const b = siblings[swapIdx];

  await db.$transaction([
    db.programUnit.update({ where: { id: a.id }, data: { orderIndex: b.orderIndex } }),
    db.programUnit.update({ where: { id: b.id }, data: { orderIndex: a.orderIndex } }),
  ]);

  revalidatePath(`/admin/programs/${unit.programId}/edit`);
  return { success: true, data: undefined };
}

export async function getAdminProgramUnits(programId: string) {
  await assertProgramManager(programId);
  return db.programUnit.findMany({
    where: { programId },
    orderBy: { orderIndex: "asc" },
    include: { course: { select: { id: true, title: true, slug: true, thumbnailUrl: true } } },
  });
}

type UnitStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

export async function getProgramUnitsForLearner(programSlug: string, userId?: string | null) {
  const units = await db.programUnit.findMany({
    where: { program: { slug: programSlug } },
    orderBy: { orderIndex: "asc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          modules: { select: { lessons: { select: { id: true } } } },
        },
      },
    },
  });

  const courseIds = units.map((u) => u.courseId);
  const enrollmentsByCourse = new Map<string, Set<string>>();

  if (userId && courseIds.length > 0) {
    const enrollments = await db.enrollment.findMany({
      where: { userId, courseId: { in: courseIds } },
      include: { progress: { select: { lessonId: true } } },
    });
    for (const e of enrollments) {
      enrollmentsByCourse.set(e.courseId, new Set(e.progress.map((p) => p.lessonId)));
    }
  }

  return units.map((unit, i) => {
    const total = unit.course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedIds = enrollmentsByCourse.get(unit.courseId);
    const completed = completedIds?.size ?? 0;
    const status: UnitStatus =
      completed === 0 ? "NOT_STARTED" : completed >= total && total > 0 ? "COMPLETED" : "IN_PROGRESS";

    return {
      id: unit.id,
      orderIndex: i + 1,
      course: {
        id: unit.course.id,
        title: unit.course.title,
        slug: unit.course.slug,
        thumbnailUrl: unit.course.thumbnailUrl,
      },
      completed,
      total,
      status,
    };
  });
}
