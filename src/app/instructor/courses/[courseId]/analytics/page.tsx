/**
 * Per-course analytics — real DB data
 */
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { getInstructorCourseAnalytics } from "@/lib/actions/instructor";
import {
  getCourseRevenueChartData,
  getCourseEnrollmentChartData,
} from "@/lib/analytics/chart-data";
import { AnalyticsChartsRow } from "@/components/charts/AnalyticsCharts";
import { formatCurrency } from "@/lib/utils";
import { getAuthSession } from "@/lib/auth-server";

export default async function CourseAnalyticsPage({
  params,
}: {
  params: { courseId: string };
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login");

  const [data, revenueData, enrollmentData] = await Promise.all([
    getInstructorCourseAnalytics(session.user.id, params.courseId),
    getCourseRevenueChartData(session.user.id, params.courseId),
    getCourseEnrollmentChartData(params.courseId, session.user.id),
  ]);
  if (!data) notFound();

  const { course, enrollments, completions, completionRate, netRevenue, lessonFunnel } =
    data;

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/instructor/courses">← Back to courses</Link>
      </Button>
      <h1 className="text-2xl font-bold">{course.title} — Analytics</h1>
      <p className="text-sm text-gray-500 mt-1 capitalize">
        {course.status.replace("_", " ").toLowerCase()}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-gray-500">Enrollments</p>
          <p className="text-2xl font-bold">{enrollments}</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Completion rate</p>
          <p className="text-2xl font-bold">{completionRate}%</p>
          <p className="text-xs text-gray-400 mt-1">{completions} completed</p>
        </Card>
        <Card>
          <p className="text-sm text-gray-500">Your revenue (70%)</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(netRevenue)}</p>
        </Card>
      </div>

      <div className="mt-6">
        <AnalyticsChartsRow
          revenueData={revenueData}
          enrollmentData={enrollmentData}
          revenueTitle="Course revenue (last 6 months, net 70%)"
        />
      </div>

      <Card className="mt-6">
        <CardTitle>Lesson completion funnel</CardTitle>
        {lessonFunnel.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No lessons in this course yet.</p>
        ) : (
          lessonFunnel.map((l) => (
            <div key={l.id} className="mt-3">
              <div className="flex justify-between text-sm">
                <span>
                  {l.title}
                  {l.type === "QUIZ" && (
                    <span className="ml-2 text-xs text-gray-400">(Quiz)</span>
                  )}
                </span>
                <span className="text-gray-500">
                  {l.completed}/{enrollments} · {l.pct}%
                </span>
              </div>
              <ProgressBar value={l.pct} className="mt-1" />
            </div>
          ))
        )}
      </Card>

      <div className="mt-4 flex gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href={`/instructor/courses/${course.id}/edit`}>Edit course</Link>
        </Button>
        {course.status === "PUBLISHED" && (
          <Button asChild variant="ghost" size="sm">
            <Link href={`/courses/${course.slug}`} target="_blank">
              View live page
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
