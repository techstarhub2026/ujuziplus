/**
 * Enrollment server actions — Phase 1B
 */
"use server";

import { cache } from "react";
import { revalidatePath, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { assertActor } from "@/lib/auth-server";
import { serializeCourseForClient } from "@/lib/serialize";
import type { ActionResult } from "./courses";

// ─── Enroll in a course ───────────────────────────────────────────────────────

export async function enrollInCourse(
  userId: string,
  courseId: string
): Promise<ActionResult<{ enrollmentId: string }>> {
  await assertActor(userId);

  // Verify course exists and is published
  const course = await db.course.findFirst({
    where: { id: courseId, status: "PUBLISHED" },
  });
  if (!course) return { success: false, error: "Course not found or not available." };

  // Upsert — safe if already enrolled
  const enrollment = await db.enrollment.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });

  revalidatePath("/dashboard/my-courses");
  revalidatePath(`/courses/${course.slug}`);
  return { success: true, data: { enrollmentId: enrollment.id } };
}

// ─── Check enrollment ─────────────────────────────────────────────────────────

export async function getEnrollment(userId: string, courseId: string) {
  await assertActor(userId);

  return db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
    include: {
      progress: { select: { lessonId: true } },
    },
  });
}

// ─── Mark lesson complete ─────────────────────────────────────────────────────

export async function markLessonComplete(
  userId: string,
  courseId: string,
  lessonId: string
): Promise<ActionResult<{ courseComplete: boolean; certVerifyCode?: string }>> {
  await assertActor(userId);

  const enrollment = await db.enrollment.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  if (!enrollment) return { success: false, error: "Not enrolled." };

  // Upsert progress — idempotent
  await db.lessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    create: { enrollmentId: enrollment.id, lessonId },
    update: {},
  });

  // Check if all lessons are complete
  const totalLessons = await db.lesson.count({ where: { module: { courseId } } });
  const completedCount = await db.lessonProgress.count({ where: { enrollmentId: enrollment.id } });
  const courseComplete = completedCount >= totalLessons && totalLessons > 0;

  let certVerifyCode: string | undefined;

  if (courseComplete && !enrollment.completedAt) {
    await db.enrollment.update({
      where: { id: enrollment.id },
      data: { completedAt: new Date() },
    });

    // Auto-issue certificate if course has it enabled
    const course = await db.course.findUnique({
      where: { id: courseId },
      select: { enableCert: true },
    });
    if (course?.enableCert) {
      const cert = await db.certificate.upsert({
        where: { userId_courseId: { userId, courseId } },
        create: { userId, courseId },
        update: {},
      });
      certVerifyCode = cert.verifyCode;
    }
  }

  revalidatePath(`/dashboard/my-courses`);
  revalidatePath(`/dashboard/certificates`);
  return { success: true, data: { courseComplete, certVerifyCode } };
}

// ─── My learning (enrolled courses with progress) ─────────────────────────────

export async function getMyEnrollments(userId: string) {
  return getMyEnrollmentsCached(userId);
}

const getMyEnrollmentsCached = cache(async (userId: string) => {
  await assertActor(userId);

  return db.enrollment.findMany({
    where: { userId },
    orderBy: { enrolledAt: "desc" },
    include: {
      course: {
        include: {
          instructor: { select: { fullName: true, avatarUrl: true, username: true } },
          modules: {
            include: {
              _count: { select: { lessons: true } },
            },
          },
          _count: { select: { enrollments: true } },
        },
      },
      progress: { select: { lessonId: true } },
    },
  });
});

// ─── Course with curriculum (for detail page & learn player) ─────────────────

const courseDetailInclude = {
  instructor: {
    select: { id: true, fullName: true, avatarUrl: true, username: true, bio: true },
  },
  modules: {
    orderBy: { orderIndex: "asc" as const },
    include: {
      lessons: {
        orderBy: { orderIndex: "asc" as const },
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          isFreePreview: true,
          durationSeconds: true,
          orderIndex: true,
          moduleId: true,
        },
      },
    },
  },
  _count: { select: { enrollments: true } },
};

/** Published course, or draft/pending for instructor owner / admin preview */
export async function getCourseForDetail(
  slug: string,
  viewer?: { id: string; role: string } | null
) {
  const published = await getPublishedCourseDetailCached(slug);
  if (published) return published;

  if (!viewer?.id) return null;

  const isStaff =
    viewer.role === "ADMIN" || viewer.role === "MODERATOR";
  const owned = await db.course.findFirst({
    where: {
      slug,
      ...(isStaff ? {} : { instructorId: viewer.id }),
    },
    include: courseDetailInclude,
  });
  return owned ? serializeCourseForClient(owned) : null;
}

const getPublishedCourseDetailCached = unstable_cache(
  async (slug: string) => {
    const course = await db.course.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: courseDetailInclude,
    });
    return course ? serializeCourseForClient(course) : null;
  },
  ["published-course-detail"],
  { revalidate: 120, tags: ["published-course-detail"] }
);

export async function getPublishedCourse(slug: string) {
  return getPublishedCourseDetailCached(slug);
}

// ─── Published courses list (for catalog) ─────────────────────────────────────

export async function getPublishedCourses() {
  return getPublishedCoursesCached();
}

const getPublishedCoursesCached = unstable_cache(
  async () => {
    const courses = await db.course.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { updatedAt: "desc" },
      include: {
        instructor: { select: { fullName: true, avatarUrl: true, username: true } },
        _count: { select: { enrollments: true, modules: true } },
      },
    });
    return courses.map(serializeCourseForClient);
  },
  ["published-courses"],
  { revalidate: 60, tags: ["published-courses"] }
);

/** Fetch a single lesson's media/content for the learn player (on-demand). */
export async function getLessonPlayerContent(
  userId: string,
  courseId: string,
  lessonKey: string
) {
  await assertActor(userId);

  return db.lesson.findFirst({
    where: {
      OR: [{ id: lessonKey }, { slug: lessonKey }],
      module: { courseId },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      videoUrl: true,
      articleBody: true,
      isFreePreview: true,
      orderIndex: true,
    },
  });
}
