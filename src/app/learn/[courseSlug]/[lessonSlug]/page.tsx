/**
 * /learn/[courseSlug]/[lessonSlug] — DB course player only
 */
import { getAuthSession } from "@/lib/auth-server";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { DbLearnPlayer } from "@/components/learn/DbLearnPlayer";
import { getAssignmentForStudent } from "@/lib/actions/assignments";
import type { RubricItem } from "@/lib/actions/assignments";

const lessonMetaSelect = {
  id: true,
  slug: true,
  title: true,
  type: true,
  isFreePreview: true,
  orderIndex: true,
} as const;

const lessonFullSelect = {
  ...lessonMetaSelect,
  videoUrl: true,
  articleBody: true,
} as const;

export default async function LearnPage({
  params,
}: {
  params: { courseSlug: string; lessonSlug: string };
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/learn/${params.courseSlug}/${params.lessonSlug}`);
  }

  const dbCourse = await db.course.findFirst({
    where: { slug: params.courseSlug, status: "PUBLISHED" },
    select: { id: true, slug: true, title: true },
  });

  if (!dbCourse) notFound();

  const [modules, enrollment, initialLesson] = await Promise.all([
    db.courseModule.findMany({
      where: { courseId: dbCourse.id },
      orderBy: { orderIndex: "asc" },
      include: {
        lessons: {
          orderBy: { orderIndex: "asc" },
          select: lessonMetaSelect,
        },
      },
    }),
    db.enrollment.findUnique({
      where: {
        userId_courseId: { userId: session.user.id, courseId: dbCourse.id },
      },
      include: { progress: { select: { lessonId: true } } },
    }),
    db.lesson.findFirst({
      where: {
        OR: [{ id: params.lessonSlug }, { slug: params.lessonSlug }],
        module: { courseId: dbCourse.id },
      },
      select: lessonFullSelect,
    }),
  ]);

  const allLessons = modules.flatMap((m) => m.lessons);
  const currentLesson = initialLesson ?? allLessons[0];
  const isFreePreview = currentLesson?.isFreePreview ?? false;

  if (!enrollment && !isFreePreview) {
    redirect(`/courses/${params.courseSlug}`);
  }

  const enrollmentInfo = enrollment
    ? {
        id: enrollment.id,
        completedLessonIds: enrollment.progress.map((p) => p.lessonId),
      }
    : null;

  let initialAssignmentBundle = null;
  if (currentLesson?.type === "ASSIGNMENT" && enrollment && currentLesson) {
    const data = await getAssignmentForStudent(
      currentLesson.id,
      enrollment.id,
      session.user.id
    );
    if (data) {
      const sub = data.submission;
      initialAssignmentBundle = {
        instructions: data.assignment.instructions ?? "",
        rubric: data.assignment.rubric as RubricItem[] | null,
        maxScore: data.assignment.maxScore,
        dueAt: data.assignment.dueAt,
        status: sub?.status ?? "DRAFT",
        text: sub?.textResponse ?? "",
        github: sub?.githubUrl ?? "",
        files: (sub?.files ?? []).map((f) => ({
          id: f.id,
          fileName: f.fileName,
          filePath: f.filePath,
        })),
        score: sub?.score,
        feedback: sub?.feedback,
      };
    }
  }

  if (!currentLesson) notFound();

  return (
    <DbLearnPlayer
      course={dbCourse}
      modules={modules}
      lessonId={params.lessonSlug}
      initialLesson={currentLesson}
      enrollment={enrollmentInfo}
      userId={session.user.id}
      initialAssignmentBundle={initialAssignmentBundle}
    />
  );
}
