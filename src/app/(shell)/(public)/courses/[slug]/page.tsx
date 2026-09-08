/**
 * /courses/[slug] — Course detail (DB only)
 */
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { getCourseForDetail, getEnrollment } from "@/lib/actions/enrollments";
import { getCourseDiscussions } from "@/lib/actions/discussions";
import { isCourseWishlisted } from "@/lib/actions/wishlist";
import { DbCourseDetail } from "@/components/courses/DbCourseDetail";

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
  searchParams: { preview?: string };
}) {
  const session = await getAuthSession();
  const viewer = session?.user?.id
    ? { id: session.user.id, role: session.user.role ?? "STUDENT" }
    : null;

  const dbCourse = await getCourseForDetail(params.slug, viewer);
  if (!dbCourse) notFound();

  const userId = session?.user?.id;
  const [enrollment, courseDiscussions, wishlisted] = await Promise.all([
    userId ? getEnrollment(userId, dbCourse.id) : Promise.resolve(null),
    getCourseDiscussions(dbCourse.id),
    userId ? isCourseWishlisted(userId, dbCourse.id) : Promise.resolve(false),
  ]);

  return (
    <DbCourseDetail
      course={dbCourse}
      userId={userId ?? null}
      enrollment={enrollment}
      courseDiscussions={courseDiscussions}
      wishlisted={wishlisted}
    />
  );
}
