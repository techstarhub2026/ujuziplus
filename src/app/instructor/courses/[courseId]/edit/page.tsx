/**
 * /instructor/courses/[courseId]/edit
 * Server component: loads course from DB and passes to CourseBuilder.
 */
import { redirect, notFound } from "next/navigation";
import { getCourseForEdit } from "@/lib/actions/courses";
import { getPublishedKitsForRequest } from "@/lib/actions/org-kits";
import { CourseBuilder } from "@/components/instructor/CourseBuilder";
import { getAuthSession } from "@/lib/auth-server";

export default async function EditCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/instructor/courses/${params.courseId}/edit`);
  }

  const [course, publishedKits] = await Promise.all([
    getCourseForEdit(params.courseId, session.user.id),
    getPublishedKitsForRequest(),
  ]);
  if (!course) notFound();

  // Prisma stores JSON fields as JsonValue — normalise for the builder
  const whatYouLearn = Array.isArray(course.whatYouLearn)
    ? (course.whatYouLearn as string[])
    : null;
  const linkedKitSlugs = Array.isArray(course.linkedKitSlugs)
    ? (course.linkedKitSlugs as string[])
    : null;

  const modules = course.modules.map((mod) => ({
    ...mod,
    lessons: mod.lessons.map((lesson) => ({
      ...lesson,
      attachments: Array.isArray(lesson.attachments)
        ? (lesson.attachments as { name: string; url: string; size: number }[])
        : null,
    })),
  }));

  return (
    <CourseBuilder
      courseId={course.id}
      instructorId={session.user.id}
      mode="edit"
      publishedKits={publishedKits}
      initialData={{
        ...course,
        price: course.price?.toString() ?? null,
        discountPrice: course.discountPrice?.toString() ?? null,
        whatYouLearn,
        linkedKitSlugs,
        modules,
      }}
    />
  );
}
