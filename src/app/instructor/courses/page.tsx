/**
 * /instructor/courses
 *
 * Server component: shows the logged-in instructor's real courses from MySQL.
 */
import Link from "next/link";
import Image from "next/image";
import { Plus, Clock } from "lucide-react";
import { redirect } from "next/navigation";
import { getInstructorCourses } from "@/lib/actions/courses";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CourseCardActions } from "@/components/instructor/CourseCardActions";
import { getAuthSession } from "@/lib/auth-server";

const STATUS_VARIANT: Record<string, "warning" | "accent" | "success" | "error" | "default"> = {
  DRAFT: "warning",
  PENDING_REVIEW: "accent",
  PUBLISHED: "success",
  REJECTED: "error",
  ARCHIVED: "default",
};

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Under Review",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

export default async function InstructorCoursesPage({
  searchParams,
}: {
  searchParams: { submitted?: string };
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/instructor/courses");

  const courses = await getInstructorCourses(session.user.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold">My Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">{courses.length} course{courses.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="h-4 w-4 mr-1" />Create course
          </Link>
        </Button>
      </div>

      {searchParams.submitted === "1" && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
          ✓ Your course has been submitted for review. You&apos;ll be notified once it&apos;s approved.
        </div>
      )}

      {courses.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-brand/10 flex items-center justify-center">
            <Plus className="h-8 w-8 text-brand" />
          </div>
          <h2 className="font-semibold text-lg mb-1">Create your first course</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
            Share your knowledge with students. Build a course step-by-step — it only takes a few minutes to get started.
          </p>
          <Button asChild>
            <Link href="/instructor/courses/new">Get started</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {courses.map((c) => (
            <Card key={c.id} className="flex gap-4 p-4">
              <div className="relative h-20 w-32 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {c.thumbnailUrl ? (
                  <Image src={c.thumbnailUrl} alt="" fill className="object-cover" sizes="128px" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">No image</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold truncate">{c.title}</h3>
                  <Badge variant={STATUS_VARIANT[c.status] ?? "default"}>
                    {STATUS_LABEL[c.status] ?? c.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {c._count.modules} module{c._count.modules !== 1 ? "s" : ""}
                  {c.category ? ` · ${c.category}` : ""}
                  {" · "}
                  {c.level.charAt(0) + c.level.slice(1).toLowerCase()}
                </p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Clock className="h-3 w-3" />
                  Updated {new Date(c.updatedAt).toLocaleDateString()}
                </div>
              </div>

              <CourseCardActions
                courseId={c.id}
                instructorId={session.user.id}
                status={c.status}
                hasStudentHistory={c._count.enrollments > 0 || c._count.certificates > 0}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
