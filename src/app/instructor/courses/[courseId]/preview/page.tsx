/**
 * Instructor course preview — redirects to public course page with preview flag
 */
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth-server";

export default async function CoursePreviewPage({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/instructor/courses/${params.courseId}/preview`);
  }

  const course = await db.course.findFirst({
    where: {
      id: params.courseId,
      instructorId: session.user.id,
    },
    select: { slug: true },
  });

  if (!course) notFound();

  redirect(`/courses/${course.slug}?preview=instructor`);
}
