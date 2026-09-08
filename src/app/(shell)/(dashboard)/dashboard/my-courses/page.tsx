/**
 * /dashboard/my-courses — My Learning
 */
import Image from "next/image";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getMyEnrollments } from "@/lib/actions/enrollments";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { BookOpen, CheckCircle } from "lucide-react";

export default async function MyCoursesPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/dashboard/my-courses");

  const enrollments = await getMyEnrollments(session.user.id);

  return (
    <div className="space-y-8">
      <LearnerPageHero
        banner="my-courses"
        title="My Learning"
        subtitle={`${enrollments.length} enrolled course${enrollments.length !== 1 ? "s" : ""} — pick up where you left off.`}
      />

      <div className="flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href="/courses">Browse courses</Link>
        </Button>
      </div>

      {enrollments.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light">
            <BookOpen className="h-8 w-8 text-brand" />
          </div>
          <h2 className="mb-1 font-semibold">No courses yet</h2>
          <p className="mx-auto mb-5 max-w-sm text-sm text-gray-500">
            Start learning today — browse our catalog and enroll in your first course.
          </p>
          <Button asChild>
            <Link href="/courses">Browse catalog</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {enrollments.map((enrollment) => {
            const course = enrollment.course;
            const totalLessons = course.modules.reduce((s, m) => s + m._count.lessons, 0);
            const completedCount = enrollment.progress.length;
            const progressPct =
              totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
            const isCompleted = !!enrollment.completedAt;
            const learnHref = `/learn/${course.slug}`;

            return (
              <Card key={enrollment.id} hover className="group flex gap-4 p-4">
                <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-100">
                  {course.thumbnailUrl ? (
                    <Image
                      src={course.thumbnailUrl}
                      alt={course.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="160px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-8 w-8 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-[10px]">
                      {course.category ?? "General"}
                    </Badge>
                    {isCompleted && (
                      <Badge variant="success" className="flex items-center gap-1 text-[10px]">
                        <CheckCircle className="h-3 w-3" />
                        Completed
                      </Badge>
                    )}
                  </div>

                  <h3 className="mt-1 line-clamp-2 font-semibold">{course.title}</h3>
                  <p className="mt-0.5 text-xs text-gray-500">by {course.instructor.fullName}</p>

                  <ProgressBar value={progressPct} showLabel className="mt-2" />
                  <p className="mt-1 text-xs text-gray-400">
                    {completedCount} of {totalLessons} lessons done
                  </p>

                  <div className="mt-3 flex gap-2">
                    <Button asChild size="sm">
                      <Link href={learnHref}>
                        {isCompleted ? "Review" : progressPct > 0 ? "Continue" : "Start"}
                      </Link>
                    </Button>
                    {isCompleted && (
                      <Button asChild variant="outline" size="sm">
                        <Link href="/dashboard/certificates">Certificate</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
