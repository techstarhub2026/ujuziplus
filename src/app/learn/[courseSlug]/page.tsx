/**
 * /learn/[courseSlug] — redirects to the first lesson (DB courses only)
 */
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth-server";

export default async function LearnCoursePage({
  params,
}: {
  params: { courseSlug: string };
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/learn/${params.courseSlug}`);
  }

  const dbCourse = await db.course.findFirst({
    where: { slug: params.courseSlug, status: "PUBLISHED" },
    include: {
      modules: {
        orderBy: { orderIndex: "asc" },
        include: {
          lessons: { orderBy: { orderIndex: "asc" }, select: { id: true, slug: true }, take: 1 },
        },
        take: 1,
      },
    },
  });

  if (!dbCourse) notFound();

  const firstLesson = dbCourse.modules[0]?.lessons[0];
  if (firstLesson) {
    redirect(`/learn/${params.courseSlug}/${firstLesson.slug || firstLesson.id}`);
  }
  redirect(`/courses/${params.courseSlug}`);
}
