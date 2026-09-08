/**
 * /admin/courses — course review queue
 */

import { getPendingCourses, getAllCourses } from "@/lib/actions/admin";
import { CourseReviewPanel } from "@/components/admin/CourseReviewPanel";
import { serializeCourseReviewItem } from "@/lib/serialize";
import { getAuthSession } from "@/lib/auth-server";

export default async function AdminCoursesPage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const session = await getAuthSession();
  const tab = searchParams.tab ?? "pending";

  const [pending, all] = await Promise.all([
    getPendingCourses(),
    tab === "all" ? getAllCourses() : Promise.resolve([]),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Course Management</h1>
      <CourseReviewPanel
        pending={pending.map(serializeCourseReviewItem)}
        allCourses={all.map(serializeCourseReviewItem)}
        adminId={session!.user.id}
        tab={tab}
      />
    </div>
  );
}
