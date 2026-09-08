/**
 * Instructor dashboard — real stats from DB
 */

import Link from "next/link";
import { redirect } from "next/navigation";
import { DollarSign, Users, BookOpen, Award, Plus, TrendingUp, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { getInstructorStats, getInstructorCourseStats } from "@/lib/actions/instructor";
import { formatCurrency } from "@/lib/utils";
import { getAuthSession } from "@/lib/auth-server";

const STATUS_VARIANT: Record<string, "success" | "accent" | "outline" | "warning" | "error"> = {
  PUBLISHED: "success",
  PENDING_REVIEW: "accent",
  DRAFT: "outline",
  REJECTED: "error",
  ARCHIVED: "outline",
};

export default async function InstructorDashboardPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const [stats, courseStats] = await Promise.all([
    getInstructorStats(session.user.id),
    getInstructorCourseStats(session.user.id),
  ]);

  const summaryCards = [
    { label: "Net Revenue (all time)", value: formatCurrency(stats.netRevenue), icon: DollarSign, color: "text-green-600 bg-green-50" },
    { label: "Total Students", value: stats.totalStudents.toLocaleString(), icon: Users, color: "text-blue-600 bg-blue-50" },
    { label: "Published Courses", value: stats.publishedCourses, icon: BookOpen, color: "text-brand bg-orange-50" },
    { label: "Completions", value: stats.completions.toLocaleString(), icon: Award, color: "text-yellow-600 bg-yellow-50" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">Instructor Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Welcome back, {session.user.fullName?.split(" ")[0]}
          </p>
        </div>
        <Button asChild>
          <Link href="/instructor/courses/new">
            <Plus className="h-4 w-4 mr-1.5" />Create Course
          </Link>
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((s) => (
          <Card key={s.label} className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Course performance table */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-lg">Your Courses</h2>
          <Link href="/instructor/courses" className="text-sm text-brand hover:underline">
            Manage all →
          </Link>
        </div>

        {courseStats.length === 0 ? (
          <div className="py-10 text-center">
            <BookOpen className="mx-auto h-8 w-8 text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm mb-4">No courses yet.</p>
            <Button asChild size="sm">
              <Link href="/instructor/courses/new">Create your first course</Link>
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4 font-medium">Course</th>
                  <th className="pb-3 pr-4 font-medium">Status</th>
                  <th className="pb-3 pr-4 font-medium">Students</th>
                  <th className="pb-3 pr-4 font-medium">Completion</th>
                  <th className="pb-3 font-medium">Net Revenue</th>
                </tr>
              </thead>
              <tbody>
                {courseStats.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/instructor/courses/${c.id}/edit`}
                        className="font-medium hover:text-brand line-clamp-1"
                      >
                        {c.title}
                      </Link>
                      <p className="text-xs text-gray-400">{c.totalLessons} lessons</p>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={STATUS_VARIANT[c.status] ?? "outline"} className="text-xs">
                        {c.status.replace("_", " ").toLowerCase()}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">{c._count.enrollments}</td>
                    <td className="py-3 pr-4 w-32">
                      <ProgressBar value={c.completionRate} showLabel />
                    </td>
                    <td className="py-3 font-medium text-green-600">
                      {formatCurrency(c.netRevenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick links */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/instructor/students">
          <Card hover className="flex items-center gap-3">
            <Users className="h-5 w-5 text-brand" />
            <span className="text-sm font-medium">View all students</span>
          </Card>
        </Link>
        <Link href="/instructor/earnings">
          <Card hover className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Earnings & payouts</span>
          </Card>
        </Link>
        <Link href="/instructor/analytics">
          <Card hover className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Course analytics</span>
          </Card>
        </Link>
      </div>
    </div>
  );
}
