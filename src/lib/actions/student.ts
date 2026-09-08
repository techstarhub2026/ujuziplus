/**
 * Student dashboard actions — Phase 6
 */
"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import { requireUser, assertSelfOrAdmin } from "@/lib/auth-server";

// ─── Dashboard overview ───────────────────────────────────────────────────────

export async function getStudentDashboard(userId: string) {
  return getStudentDashboardCached(userId);
}

const getStudentDashboardCached = cache(async (userId: string) => {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const [enrollments, certificates, discussions] = await Promise.all([
    db.enrollment.findMany({
      where: { userId },
      orderBy: { enrolledAt: "desc" },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnailUrl: true,
            instructor: { select: { fullName: true } },
          },
        },
        progress: { select: { lessonId: true, completedAt: true } },
      },
    }),
    db.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      include: { course: { select: { title: true, slug: true } } },
    }),
    db.discussion.count({ where: { authorId: userId } }),
  ]);

  const courseIds = enrollments.map((e) => e.courseId);

  const modulesWithCounts =
    courseIds.length > 0
      ? await db.courseModule.findMany({
          where: { courseId: { in: courseIds } },
          select: { courseId: true, _count: { select: { lessons: true } } },
        })
      : [];

  const lessonCountMap: Record<string, number> = {};
  for (const mod of modulesWithCounts) {
    lessonCountMap[mod.courseId] = (lessonCountMap[mod.courseId] ?? 0) + mod._count.lessons;
  }

  const enriched = enrollments.map((e) => {
    const total = lessonCountMap[e.courseId] ?? 0;
    const done = e.progress.length;
    return {
      ...e,
      totalLessons: total,
      completedLessons: done,
      progressPct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });

  const inProgress = enriched.filter((e) => !e.completedAt);
  const completed = enriched.filter((e) => !!e.completedAt);

  const completionDates = enrollments.flatMap((e) => e.progress.map((p) => p.completedAt));
  const streak = computeStreak(completionDates);

  return {
    enrollments: enriched,
    inProgress,
    completed,
    certificates,
    discussions,
    streak,
    stats: {
      activeCourses: inProgress.length,
      completedCourses: completed.length,
      certificates: certificates.length,
    },
  };
});

/** Consecutive-day learning streak computed from lesson-completion timestamps (UTC calendar days). */
function computeStreak(completionDates: Date[]): { streakDays: number; activeLast7: boolean[] } {
  const DAY_MS = 24 * 60 * 60 * 1000;
  const toDayKey = (d: Date) => Math.floor(d.getTime() / DAY_MS);
  const activeDays = new Set(completionDates.map(toDayKey));
  const todayKey = Math.floor(Date.now() / DAY_MS);

  // Today doesn't have to be active yet for the streak to still be "alive" —
  // it only breaks once a full day passes with no activity.
  let streakDays = 0;
  let cursor = activeDays.has(todayKey) ? todayKey : todayKey - 1;
  while (activeDays.has(cursor)) {
    streakDays++;
    cursor--;
  }

  const activeLast7 = Array.from({ length: 7 }, (_, i) => activeDays.has(todayKey - (6 - i)));

  return { streakDays, activeLast7 };
}

export async function getMyCourses(userId: string) {
  const data = await getStudentDashboard(userId);
  return data.enrollments;
}

/** Lightweight home-page continue card — avoids full dashboard aggregation. */
export async function getHomeContinueCourse(userId: string) {
  const enrollment = await db.enrollment.findFirst({
    where: { userId, completedAt: null },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        select: {
          title: true,
          slug: true,
          thumbnailUrl: true,
          durationHours: true,
          instructor: { select: { fullName: true } },
        },
      },
      progress: { select: { lessonId: true } },
    },
  });
  if (!enrollment) return null;

  const totalLessons = await db.lesson.count({
    where: { module: { courseId: enrollment.courseId } },
  });
  const progressPct =
    totalLessons > 0
      ? Math.round((enrollment.progress.length / totalLessons) * 100)
      : 0;
  if (progressPct >= 100) return null;

  const firstLesson = await db.lesson.findFirst({
    where: { module: { courseId: enrollment.courseId } },
    orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    select: { slug: true },
  });

  return {
    title: enrollment.course.title,
    slug: enrollment.course.slug,
    thumbnailUrl: enrollment.course.thumbnailUrl,
    instructorName: enrollment.course.instructor.fullName,
    durationHours: enrollment.course.durationHours,
    firstLessonSlug: firstLesson?.slug ?? "introduction",
    progressPct,
  };
}

export async function getHomePendingProgram(userId: string) {
  const reg = await db.programRegistration.findFirst({
    where: { userId },
    orderBy: { registeredAt: "desc" },
    include: { program: true },
  });
  if (!reg?.program) return null;

  return {
    title: reg.program.title,
    slug: reg.program.slug,
    startDate: reg.program.startDate?.toLocaleDateString("en-TZ") ?? "TBD",
    endDate: reg.program.endDate?.toLocaleDateString("en-TZ") ?? "TBD",
    format: reg.program.format,
  };
}
