/**
 * Course server actions
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CourseLevel, LessonType } from "@prisma/client";
import { revalidateCourseCatalog } from "@/lib/revalidate-catalog";

function revalidateCourseEdit(courseId: string) {
  revalidatePath(`/instructor/courses/${courseId}/edit`);
}

/**
 * Edits to published-facing fields (title/slug, pricing, SEO) must also bust
 * the public catalog/detail caches, not just the instructor's own edit page —
 * otherwise a course flipped to free (or repriced, or retitled) keeps
 * serving stale cached data to learners for up to 2 minutes, or indefinitely
 * if nothing else happens to revalidate that tag.
 */
async function revalidatePublicCourse(courseId: string) {
  revalidateCourseEdit(courseId);
  const course = await db.course.findUnique({ where: { id: courseId }, select: { slug: true } });
  revalidateCourseCatalog(course?.slug);
}

// ─── Shared result type ───────────────────────────────────────────────────────

export type ActionResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "course"
  );
}

async function uniqueSlug(title: string, excludeId?: string): Promise<string> {
  const base = slugify(title);
  let slug = base;
  let i = 0;
  while (true) {
    const existing = await db.course.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    i++;
    slug = `${base}-${i}`;
  }
  return slug;
}

// VIDEO is kept in the DB enum but excluded from the UI — maps to ARTICLE on creation
const ACTIVE_LESSON_TYPES = ["ARTICLE", "AUDIO", "QUIZ", "ASSIGNMENT"] as const;
type ActiveLessonType = (typeof ACTIVE_LESSON_TYPES)[number];

function resolveType(raw: string): LessonType {
  if ((ACTIVE_LESSON_TYPES as readonly string[]).includes(raw)) return raw as LessonType;
  if (raw === "VIDEO") return LessonType.VIDEO; // preserve existing VIDEO lessons
  return LessonType.ARTICLE;
}

// ─── Create draft ─────────────────────────────────────────────────────────────

export async function createDraftCourse(
  instructorId: string
): Promise<ActionResult<{ courseId: string }>> {
  try {
    const slug = `draft-${Date.now()}`;
    const course = await db.course.create({
      data: { title: "Untitled course", slug, instructorId, status: "DRAFT" },
    });
    return { success: true, data: { courseId: course.id } };
  } catch {
    return { success: false, error: "Failed to create course." };
  }
}

// ─── Load course for editor ───────────────────────────────────────────────────

export async function getCourseForEdit(courseId: string, instructorId: string) {
  return db.course.findFirst({
    where: { id: courseId, instructorId },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: { lessons: { orderBy: { orderIndex: "asc" } } },
      },
    },
  });
}

// ─── Step 1 — Basic info ──────────────────────────────────────────────────────

export async function saveBasicInfo(
  courseId: string,
  instructorId: string,
  data: {
    title: string;
    subtitle: string;
    description: string;
    category: string;
    level: string;
    language: string;
    thumbnailUrl: string;
  }
): Promise<ActionResult> {
  if (!data.title?.trim()) return { success: false, error: "Course title is required." };

  const level = (["BEGINNER", "INTERMEDIATE", "ADVANCED"] as string[]).includes(data.level)
    ? (data.level as CourseLevel)
    : CourseLevel.BEGINNER;

  const slug = await uniqueSlug(data.title, courseId);

  await db.course.updateMany({
    where: { id: courseId, instructorId },
    data: {
      title: data.title.trim(),
      slug,
      subtitle: data.subtitle?.trim() || null,
      description: data.description?.trim() || null,
      category: data.category?.trim() || null,
      level,
      language: data.language || "English",
      thumbnailUrl: data.thumbnailUrl || null,
    },
  });

  await revalidatePublicCourse(courseId);
  return { success: true, data: undefined };
}

// ─── Step 2 — Modules ─────────────────────────────────────────────────────────

type LessonAttachment = { name: string; url: string; size: number };

type LessonRow = {
  id: string;
  title: string;
  type: LessonType;
  videoUrl: string | null;
  audioUrl: string | null;
  articleBody: string | null;
  attachments: LessonAttachment[] | null;
  isFreePreview: boolean;
  orderIndex: number;
  moduleId: string;
  durationSeconds: number | null;
  createdAt: Date;
  updatedAt: Date;
};

type ModuleWithLessons = {
  id: string;
  title: string;
  orderIndex: number;
  courseId: string;
  createdAt: Date;
  lessons: LessonRow[];
};

export async function addModule(
  courseId: string,
  instructorId: string,
  title: string
): Promise<ActionResult<ModuleWithLessons>> {
  if (!title?.trim()) return { success: false, error: "Module title is required." };

  const course = await db.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return { success: false, error: "Course not found." };

  const count = await db.courseModule.count({ where: { courseId } });
  const mod = await db.courseModule.create({
    data: { courseId, title: title.trim(), orderIndex: count },
    include: { lessons: true },
  });

  revalidateCourseEdit(courseId);
  return { success: true, data: mod as unknown as ModuleWithLessons };
}

export async function updateModuleTitle(
  moduleId: string,
  courseId: string,
  instructorId: string,
  title: string
): Promise<ActionResult> {
  if (!title?.trim()) return { success: false, error: "Title is required." };

  const course = await db.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return { success: false, error: "Not found." };

  await db.courseModule.updateMany({ where: { id: moduleId, courseId }, data: { title: title.trim() } });
  revalidateCourseEdit(courseId);
  return { success: true, data: undefined };
}

export async function deleteModule(
  moduleId: string,
  courseId: string,
  instructorId: string
): Promise<ActionResult> {
  const course = await db.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return { success: false, error: "Not found." };

  await db.courseModule.deleteMany({ where: { id: moduleId, courseId } });
  revalidateCourseEdit(courseId);
  return { success: true, data: undefined };
}

export async function reorderModule(
  moduleId: string,
  courseId: string,
  instructorId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const course = await db.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return { success: false, error: "Not found." };

  const modules = await db.courseModule.findMany({
    where: { courseId },
    orderBy: { orderIndex: "asc" },
    select: { id: true, orderIndex: true },
  });

  const idx = modules.findIndex((m) => m.id === moduleId);
  if (idx === -1) return { success: false, error: "Module not found." };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= modules.length) return { success: true, data: undefined };

  const a = modules[idx];
  const b = modules[swapIdx];

  await db.$transaction([
    db.courseModule.update({ where: { id: a.id }, data: { orderIndex: b.orderIndex } }),
    db.courseModule.update({ where: { id: b.id }, data: { orderIndex: a.orderIndex } }),
  ]);

  revalidateCourseEdit(courseId);
  return { success: true, data: undefined };
}

// ─── Step 2 — Lessons ─────────────────────────────────────────────────────────

export async function addLesson(
  moduleId: string,
  courseId: string,
  instructorId: string,
  data: {
    title: string;
    type: string;
    videoUrl?: string;
    audioUrl?: string;
    articleBody?: string;
    attachments?: LessonAttachment[];
    isFreePreview?: boolean;
  }
): Promise<ActionResult<LessonRow>> {
  if (!data.title?.trim()) return { success: false, error: "Lesson title is required." };

  const course = await db.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return { success: false, error: "Not found." };

  const type = resolveType(data.type);
  const count = await db.lesson.count({ where: { moduleId } });
  const slug = slugify(data.title.trim()) + "-" + Date.now().toString(36);

  const lesson = await db.lesson.create({
    data: {
      moduleId,
      title: data.title.trim(),
      slug,
      type,
      videoUrl: data.videoUrl?.trim() || null,
      audioUrl: data.audioUrl?.trim() || null,
      articleBody: data.articleBody?.trim() || null,
      attachments: data.attachments ?? [],
      isFreePreview: data.isFreePreview ?? false,
      orderIndex: count,
    },
  });

  if (type === "ASSIGNMENT") {
    await db.assignment.upsert({
      where: { lessonId: lesson.id },
      create: {
        lessonId: lesson.id,
        instructions: data.articleBody?.trim() || "Complete the assignment and submit your work.",
      },
      update: { instructions: data.articleBody?.trim() || undefined },
    });
  }

  revalidateCourseEdit(courseId);
  return { success: true, data: lesson as unknown as LessonRow };
}

export async function updateLesson(
  lessonId: string,
  moduleId: string,
  courseId: string,
  instructorId: string,
  data: {
    title: string;
    type: string;
    videoUrl?: string;
    audioUrl?: string;
    articleBody?: string;
    attachments?: LessonAttachment[];
    isFreePreview?: boolean;
  }
): Promise<ActionResult> {
  if (!data.title?.trim()) return { success: false, error: "Lesson title is required." };

  const course = await db.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return { success: false, error: "Not found." };

  const type = resolveType(data.type);

  await db.lesson.updateMany({
    where: { id: lessonId, moduleId },
    data: {
      title: data.title.trim(),
      type,
      videoUrl: data.videoUrl?.trim() || null,
      audioUrl: data.audioUrl?.trim() || null,
      articleBody: data.articleBody?.trim() || null,
      attachments: data.attachments ?? [],
      isFreePreview: data.isFreePreview ?? false,
    },
  });

  if (type === "ASSIGNMENT") {
    await db.assignment.upsert({
      where: { lessonId },
      create: {
        lessonId,
        instructions: data.articleBody?.trim() || "Complete the assignment and submit your work.",
      },
      update: { instructions: data.articleBody?.trim() || undefined },
    });
  }

  revalidateCourseEdit(courseId);
  return { success: true, data: undefined };
}

export async function deleteLesson(
  lessonId: string,
  moduleId: string,
  courseId: string,
  instructorId: string
): Promise<ActionResult> {
  const course = await db.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return { success: false, error: "Not found." };

  await db.lesson.deleteMany({ where: { id: lessonId, moduleId } });
  revalidateCourseEdit(courseId);
  return { success: true, data: undefined };
}

export async function reorderLesson(
  lessonId: string,
  moduleId: string,
  courseId: string,
  instructorId: string,
  direction: "up" | "down"
): Promise<ActionResult> {
  const course = await db.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return { success: false, error: "Not found." };

  const lessons = await db.lesson.findMany({
    where: { moduleId },
    orderBy: { orderIndex: "asc" },
    select: { id: true, orderIndex: true },
  });

  const idx = lessons.findIndex((l) => l.id === lessonId);
  if (idx === -1) return { success: false, error: "Lesson not found." };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= lessons.length) return { success: true, data: undefined };

  const a = lessons[idx];
  const b = lessons[swapIdx];

  await db.$transaction([
    db.lesson.update({ where: { id: a.id }, data: { orderIndex: b.orderIndex } }),
    db.lesson.update({ where: { id: b.id }, data: { orderIndex: a.orderIndex } }),
  ]);

  revalidateCourseEdit(courseId);
  return { success: true, data: undefined };
}

// ─── Step 3 — Requirements ────────────────────────────────────────────────────

export async function saveRequirements(
  courseId: string,
  instructorId: string,
  data: {
    whatYouLearn: string[];
    prerequisites: string;
    targetAudience: string;
    linkedKitSlugs: string[];
  }
): Promise<ActionResult> {
  await db.course.updateMany({
    where: { id: courseId, instructorId },
    data: {
      whatYouLearn: data.whatYouLearn.filter(Boolean),
      prerequisites: data.prerequisites?.trim() || null,
      targetAudience: data.targetAudience?.trim() || null,
      linkedKitSlugs: data.linkedKitSlugs,
    },
  });
  await revalidatePublicCourse(courseId);
  return { success: true, data: undefined };
}

// ─── Step 4 — Pricing ─────────────────────────────────────────────────────────

export async function savePricing(
  courseId: string,
  instructorId: string,
  data: { isFree: boolean; price: string; discountPrice: string }
): Promise<ActionResult> {
  const price = data.isFree ? null : parseFloat(data.price) || null;
  const discountPrice = data.isFree ? null : parseFloat(data.discountPrice) || null;

  await db.course.updateMany({
    where: { id: courseId, instructorId },
    data: { isFree: data.isFree, price, discountPrice },
  });
  await revalidatePublicCourse(courseId);
  return { success: true, data: undefined };
}

// ─── Step 5 — SEO & Certificate ───────────────────────────────────────────────

export async function saveSEO(
  courseId: string,
  instructorId: string,
  data: { metaTitle: string; metaDesc: string; enableCert: boolean }
): Promise<ActionResult> {
  await db.course.updateMany({
    where: { id: courseId, instructorId },
    data: {
      metaTitle: data.metaTitle?.trim() || null,
      metaDesc: data.metaDesc?.trim() || null,
      enableCert: data.enableCert,
    },
  });
  await revalidatePublicCourse(courseId);
  return { success: true, data: undefined };
}

// ─── Step 6 — Submit for review ───────────────────────────────────────────────

export async function submitForReview(
  courseId: string,
  instructorId: string
): Promise<ActionResult> {
  const course = await db.course.findFirst({
    where: { id: courseId, instructorId },
    include: { modules: { include: { lessons: true } } },
  });

  if (!course) return { success: false, error: "Course not found." };
  if (!course.title || course.title === "Untitled course") {
    return { success: false, error: "Please add a course title before submitting." };
  }
  if (course.modules.length === 0) {
    return { success: false, error: "Please add at least one module before submitting." };
  }
  const hasLessons = course.modules.some((m) => m.lessons.length > 0);
  if (!hasLessons) {
    return { success: false, error: "Please add at least one lesson before submitting." };
  }

  await db.course.updateMany({
    where: { id: courseId, instructorId },
    data: { status: "PENDING_REVIEW" },
  });

  revalidatePath("/instructor/courses");
  revalidatePath("/admin/courses");
  return { success: true, data: undefined };
}

// ─── Instructor courses list ──────────────────────────────────────────────────

export async function getInstructorCourses(instructorId: string) {
  return db.course.findMany({
    where: { instructorId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { modules: true, enrollments: true, certificates: true } } },
  });
}

// ─── Delete draft ─────────────────────────────────────────────────────────────

/**
 * Shared by the instructor and admin delete flows: archives a course instead
 * of hard-deleting it if it has enrollment or certificate history to
 * preserve, otherwise hard-deletes it (published courses are always
 * protected from hard delete, since they're reachable from the public
 * catalog). The count-check and the resulting write run inside one
 * transaction so a concurrent enrollment can't slip in between the check and
 * the delete.
 */
export async function archiveOrDeleteCourse(courseId: string): Promise<ActionResult<{ archived: boolean }>> {
  try {
    const archived = await db.$transaction(async (tx) => {
      const course = await tx.course.findUnique({
        where: { id: courseId },
        include: { _count: { select: { enrollments: true, certificates: true } } },
      });
      if (!course) throw new Error("NOT_FOUND");

      const hasStudentHistory = course._count.enrollments > 0 || course._count.certificates > 0;

      if (hasStudentHistory || course.status === "PUBLISHED") {
        // Enrollments, progress, and issued certificates must be preserved,
        // and published courses stay reachable from the catalog, so retire
        // the course instead of hard-deleting it.
        await tx.course.update({ where: { id: courseId }, data: { status: "ARCHIVED" } });
        return true;
      }

      await tx.course.delete({ where: { id: courseId } });
      return false;
    });

    revalidatePath("/instructor/courses");
    revalidatePath("/admin/courses");
    return { success: true, data: { archived } };
  } catch (err) {
    if (err instanceof Error && err.message === "NOT_FOUND") {
      return { success: false, error: "Not found." };
    }
    return { success: false, error: "Could not delete this course. Try again or contact support." };
  }
}

export async function deleteCourse(
  courseId: string,
  instructorId: string
): Promise<ActionResult<{ archived: boolean }>> {
  const course = await db.course.findFirst({ where: { id: courseId, instructorId } });
  if (!course) return { success: false, error: "Not found." };

  return archiveOrDeleteCourse(courseId);
}
