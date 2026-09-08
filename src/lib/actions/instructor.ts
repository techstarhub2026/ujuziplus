/**
 * Instructor analytics & management actions — Phase 4
 * Platform split: 70% instructor / 30% platform.
 */
"use server";

import { db } from "@/lib/db";
import { requireInstructor, assertSelfOrAdmin } from "@/lib/auth-server";

const INSTRUCTOR_SHARE = 0.7;

async function guardInstructor(instructorId: string) {
  const { user } = await requireInstructor();
  assertSelfOrAdmin(user.id, instructorId, user.role);
  return user;
}

async function getInstructorCourseIds(instructorId: string) {
  const courses = await db.course.findMany({
    where: { instructorId },
    select: { id: true },
  });
  return courses.map((c) => c.id);
}

// ─── Overview stats ───────────────────────────────────────────────────────────

export async function getInstructorStats(instructorId: string) {
  await guardInstructor(instructorId);

  const courses = await db.course.findMany({
    where: { instructorId },
    select: { id: true, title: true, slug: true, status: true },
  });
  const courseIds = courses.map((c) => c.id);
  if (courseIds.length === 0) {
    return {
      totalCourses: 0,
      publishedCourses: 0,
      totalStudents: 0,
      grossRevenue: 0,
      netRevenue: 0,
      completions: 0,
      courses: [],
    };
  }

  const [totalStudents, orderItems, completions] = await Promise.all([
    db.enrollment.groupBy({
      by: ["userId"],
      where: { courseId: { in: courseIds } },
      _count: { userId: true },
    }),
    db.orderItem.findMany({
      where: { courseId: { in: courseIds }, order: { status: "COMPLETED" } },
      select: { price: true },
    }),
    db.enrollment.count({
      where: { courseId: { in: courseIds }, completedAt: { not: null } },
    }),
  ]);

  const grossRevenue = orderItems.reduce((sum, i) => sum + Number(i.price), 0);

  return {
    totalCourses: courses.length,
    publishedCourses: courses.filter((c) => c.status === "PUBLISHED").length,
    totalStudents: totalStudents.length,
    grossRevenue,
    netRevenue: grossRevenue * INSTRUCTOR_SHARE,
    completions,
    courses,
  };
}

// ─── Per-course stats ─────────────────────────────────────────────────────────

export async function getInstructorCourseStats(instructorId: string) {
  await guardInstructor(instructorId);

  const courses = await db.course.findMany({
    where: { instructorId },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { enrollments: true } },
      modules: { select: { _count: { select: { lessons: true } } } },
    },
  });

  return Promise.all(
    courses.map(async (course) => {
      const [completions, revenue] = await Promise.all([
        db.enrollment.count({
          where: { courseId: course.id, completedAt: { not: null } },
        }),
        db.orderItem.aggregate({
          where: { courseId: course.id, order: { status: "COMPLETED" } },
          _sum: { price: true },
        }),
      ]);

      const gross = Number(revenue._sum.price ?? 0);
      const totalLessons = course.modules.reduce((s, m) => s + m._count.lessons, 0);

      return {
        ...course,
        completions,
        grossRevenue: gross,
        netRevenue: gross * INSTRUCTOR_SHARE,
        totalLessons,
        completionRate:
          course._count.enrollments > 0
            ? Math.round((completions / course._count.enrollments) * 100)
            : 0,
      };
    })
  );
}

/** Single-course analytics with lesson funnel */
export async function getInstructorCourseAnalytics(
  instructorId: string,
  courseId: string
) {
  await guardInstructor(instructorId);

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, title: true, type: true },
          },
        },
      },
      _count: { select: { enrollments: true } },
    },
  });
  if (!course) return null;

  const [completions, revenue, enrollments] = await Promise.all([
    db.enrollment.count({ where: { courseId, completedAt: { not: null } } }),
    db.orderItem.aggregate({
      where: { courseId, order: { status: "COMPLETED" } },
      _sum: { price: true },
    }),
    db.enrollment.count({ where: { courseId } }),
  ]);

  const gross = Number(revenue._sum.price ?? 0);
  const lessons = course.modules.flatMap((m) => m.lessons);

  const lessonFunnel = await Promise.all(
    lessons.map(async (lesson) => {
      const completed = await db.lessonProgress.count({
        where: { lessonId: lesson.id, enrollment: { courseId } },
      });
      const pct =
        enrollments > 0 ? Math.round((completed / enrollments) * 100) : 0;
      return { id: lesson.id, title: lesson.title, type: lesson.type, pct, completed };
    })
  );

  return {
    course: {
      id: course.id,
      title: course.title,
      slug: course.slug,
      status: course.status,
    },
    enrollments,
    completions,
    completionRate:
      enrollments > 0 ? Math.round((completions / enrollments) * 100) : 0,
    grossRevenue: gross,
    netRevenue: gross * INSTRUCTOR_SHARE,
    lessonFunnel,
  };
}

// ─── Instructor students ──────────────────────────────────────────────────────

export async function getInstructorStudents(instructorId: string) {
  await guardInstructor(instructorId);

  const courseIds = await getInstructorCourseIds(instructorId);
  if (courseIds.length === 0) return [];

  const enrollments = await db.enrollment.findMany({
    where: { courseId: { in: courseIds } },
    orderBy: { enrolledAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          username: true,
          avatarUrl: true,
        },
      },
      course: { select: { id: true, title: true, slug: true } },
      progress: { select: { lessonId: true } },
    },
  });

  const lessonCounts = await db.lesson.groupBy({
    by: ["moduleId"],
    where: { module: { courseId: { in: courseIds } } },
    _count: { id: true },
  });

  const modules = await db.courseModule.findMany({
    where: { courseId: { in: courseIds } },
    select: { id: true, courseId: true },
  });
  const lessonCountMap: Record<string, number> = {};
  for (const mod of modules) {
    const count = lessonCounts.find((l) => l.moduleId === mod.id)?._count.id ?? 0;
    lessonCountMap[mod.courseId] = (lessonCountMap[mod.courseId] ?? 0) + count;
  }

  return enrollments.map((e) => {
    const total = lessonCountMap[e.courseId] ?? 0;
    const done = e.progress.length;
    return {
      ...e,
      progressPct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });
}

/** Student progress for one enrollment (instructor-owned course only) */
export async function getInstructorStudentDetail(
  instructorId: string,
  studentId: string,
  courseId?: string
) {
  await guardInstructor(instructorId);

  const courseIds = await getInstructorCourseIds(instructorId);
  const enrollment = await db.enrollment.findFirst({
    where: {
      userId: studentId,
      courseId: courseId
        ? { in: courseIds.filter((id) => id === courseId) }
        : { in: courseIds },
    },
    orderBy: { enrolledAt: "desc" },
    include: {
      user: {
        select: { id: true, fullName: true, username: true, avatarUrl: true, email: true },
      },
      course: { select: { id: true, title: true, slug: true } },
      progress: { select: { lessonId: true, completedAt: true } },
    },
  });
  if (!enrollment) return null;

  const lessons = await db.lesson.findMany({
    where: { module: { courseId: enrollment.courseId } },
    orderBy: [{ module: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    select: {
      id: true,
      title: true,
      type: true,
      quiz: { select: { id: true } },
    },
  });

  const completedIds = new Set(enrollment.progress.map((p) => p.lessonId));

  const quizAttempts = await db.quizAttempt.findMany({
    where: {
      userId: studentId,
      quiz: { lesson: { module: { courseId: enrollment.courseId } } },
    },
    orderBy: { completedAt: "desc" },
    include: {
      quiz: {
        select: {
          passMark: true,
          lesson: { select: { title: true } },
        },
      },
    },
  });

  return {
    enrollment,
    lessons: lessons.map((l) => ({
      ...l,
      completed: completedIds.has(l.id),
    })),
    quizAttempts,
  };
}

// ─── Instructor earnings ──────────────────────────────────────────────────────

export async function getInstructorEarnings(instructorId: string) {
  await guardInstructor(instructorId);

  const courseIds = await getInstructorCourseIds(instructorId);
  if (courseIds.length === 0) {
    return { transactions: [], totalGross: 0, totalNet: 0 };
  }

  const orderItems = await db.orderItem.findMany({
    where: { courseId: { in: courseIds }, order: { status: "COMPLETED" } },
    orderBy: { order: { createdAt: "desc" } },
    include: {
      course: { select: { title: true, slug: true } },
      order: { select: { createdAt: true, paymentMethod: true } },
    },
  });

  const transactions = orderItems
    .filter((item) => item.course)
    .map((item) => ({
    id: item.id,
    date: item.order.createdAt,
    courseTitle: item.course!.title,
    courseSlug: item.course!.slug,
    gross: Number(item.price),
    net: Number(item.price) * INSTRUCTOR_SHARE,
    method: item.order.paymentMethod,
  }));

  const totalGross = transactions.reduce((s, t) => s + t.gross, 0);
  return { transactions, totalGross, totalNet: totalGross * INSTRUCTOR_SHARE };
}
