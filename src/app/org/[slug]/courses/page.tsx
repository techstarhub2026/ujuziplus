import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPublishedCourses } from "@/lib/actions/enrollments";
import { requireOrgStaff } from "@/lib/org-access";
import { OrgCoursesPanel } from "@/components/org/OrgCoursesPanel";

export default async function OrgCoursesPage({ params }: { params: { slug: string } }) {
  const { session, isOrgAdmin, isPlatformStaff } = await requireOrgStaff(params.slug);
  const canManage = isOrgAdmin || isPlatformStaff;

  const allPublished = await getPublishedCourses();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Organization Courses</h1>
          <p className="text-sm text-gray-500">
            Courses your organization offers, plus the full platform catalog
          </p>
        </div>
        {canManage && (
          <Button asChild variant="outline">
            <Link href="/instructor/courses/new">Create course</Link>
          </Button>
        )}
      </div>

      <OrgCoursesPanel
        orgSlug={params.slug}
        userId={session.user.id}
        canManage={canManage}
        courses={allPublished.map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          instructorName: c.instructor.fullName,
          totalEnrollments: c._count.enrollments,
          organizationId: c.organizationId,
        }))}
      />
    </div>
  );
}
