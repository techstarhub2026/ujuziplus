/**
 * /admin — Platform overview for admins
 */

import { getPlatformStats, getPendingCourses } from "@/lib/actions/admin";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth-server";
import {
  Users, BookOpen, GraduationCap, DollarSign,
  MessageSquare, Award, AlertCircle,
} from "lucide-react";

export default async function AdminOverviewPage() {
  const session = await getAuthSession();
  const [stats, pending] = await Promise.all([
    getPlatformStats(),
    getPendingCourses(),
  ]);

  const summaryCards = [
    { label: "Total Users",      value: stats.users,                  icon: Users,         color: "bg-blue-50 text-blue-600" },
    { label: "Total Courses",    value: stats.courses,                icon: BookOpen,      color: "bg-orange-50 text-brand" },
    { label: "Enrollments",      value: stats.enrollments,            icon: GraduationCap, color: "bg-green-50 text-green-600" },
    { label: "Gross Revenue",    value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: "bg-emerald-50 text-emerald-600" },
    { label: "Discussions",      value: stats.discussions,            icon: MessageSquare, color: "bg-purple-50 text-purple-600" },
    { label: "Certificates",     value: stats.certificates,           icon: Award,         color: "bg-yellow-50 text-yellow-600" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Signed in as <strong>{session?.user.fullName}</strong> ({session?.user.role?.toLowerCase()})
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((s) => (
          <Card key={s.label} className="flex items-center gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
              <s.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-bold">{typeof s.value === "number" ? s.value.toLocaleString() : s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Pending review */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            Pending course reviews
            {pending.length > 0 && (
              <Badge variant="accent">{pending.length}</Badge>
            )}
          </h2>
          <Link href="/admin/courses" className="text-sm text-brand hover:underline">
            View all →
          </Link>
        </div>

        {pending.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">All caught up — no pending reviews.</p>
        ) : (
          <div className="space-y-3">
            {pending.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center justify-between gap-4 rounded-lg border border-orange-100 bg-orange-50 px-4 py-3">
                <div>
                  <p className="font-medium text-sm">{course.title}</p>
                  <p className="text-xs text-gray-500">
                    by {course.instructor.fullName} · {course._count.modules} modules
                  </p>
                </div>
                <Link
                  href={`/admin/courses?id=${course.id}`}
                  className="shrink-0 rounded-lg bg-brand px-3 py-1.5 text-xs font-medium text-white hover:bg-brand/90"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
