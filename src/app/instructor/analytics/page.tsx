/**
 * Instructor analytics — per-course stats from DB
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { getInstructorCourseStats } from "@/lib/actions/instructor";
import { getRevenueChartData, getEnrollmentChartData } from "@/lib/analytics/chart-data";
import { AnalyticsChartsRow } from "@/components/charts/AnalyticsCharts";
import { formatCurrency } from "@/lib/utils";
import { BookOpen, Users, Award, TrendingUp } from "lucide-react";
import { getAuthSession } from "@/lib/auth-server";

const STATUS_VARIANT: Record<string, "success" | "accent" | "outline" | "error"> = {
  PUBLISHED: "success", PENDING_REVIEW: "accent",
  DRAFT: "outline", REJECTED: "error", ARCHIVED: "outline",
};

export default async function InstructorAnalyticsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const [courseStats, revenueData, enrollmentData] = await Promise.all([
    getInstructorCourseStats(session.user.id),
    getRevenueChartData(session.user.id),
    getEnrollmentChartData(session.user.id),
  ]);

  const totals = courseStats.reduce(
    (acc, c) => ({
      students: acc.students + c._count.enrollments,
      completions: acc.completions + c.completions,
      revenue: acc.revenue + c.netRevenue,
    }),
    { students: 0, completions: 0, revenue: 0 }
  );

  return (
    <div>
      <PageHeader title="Analytics" description="Performance across all your courses" />

      {/* Aggregate */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Total students</p>
            <p className="text-2xl font-bold">{totals.students}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <Award className="h-8 w-8 text-yellow-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Total completions</p>
            <p className="text-2xl font-bold">{totals.completions}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-green-500 shrink-0" />
          <div>
            <p className="text-xs text-gray-500">Net revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(totals.revenue)}</p>
          </div>
        </Card>
      </div>

      <div className="mb-8">
        <AnalyticsChartsRow
          revenueData={revenueData}
          enrollmentData={enrollmentData}
          revenueTitle="Net revenue (last 6 months)"
        />
      </div>

      {/* Per-course breakdown */}
      {courseStats.length === 0 ? (
        <Card className="py-14 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm mb-3">No courses yet.</p>
          <Link href="/instructor/courses/new" className="text-sm text-brand underline">
            Create your first course
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {courseStats.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <Link href={`/instructor/courses/${c.id}/edit`} className="font-semibold hover:text-brand">
                    {c.title}
                  </Link>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <Badge variant={STATUS_VARIANT[c.status] ?? "outline"} className="text-xs">
                      {c.status.replace("_", " ").toLowerCase()}
                    </Badge>
                    <span className="text-xs text-gray-400">{c.totalLessons} lessons</span>
                  </div>
                </div>
                <span className="font-bold text-green-600">{formatCurrency(c.netRevenue)}</span>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Students enrolled</p>
                  <p className="font-semibold">{c._count.enrollments}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Completed</p>
                  <p className="font-semibold">{c.completions}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Completion rate</p>
                  <ProgressBar value={c.completionRate} showLabel />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
