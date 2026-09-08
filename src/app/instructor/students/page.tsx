/**
 * Instructor students list — real enrollments from DB
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { Avatar } from "@/components/ui/avatar";
import { ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getInstructorStudents } from "@/lib/actions/instructor";
import { formatDate } from "@/lib/utils";
import { Users } from "lucide-react";
import { getAuthSession } from "@/lib/auth-server";

export default async function InstructorStudentsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const students = await getInstructorStudents(session.user.id);

  return (
    <div>
      <PageHeader
        title="Students"
        description={`${students.length} enrollment${students.length !== 1 ? "s" : ""} across all your courses`}
      />

      <Card>
        {students.length === 0 ? (
          <div className="py-14 text-center">
            <Users className="mx-auto h-8 w-8 text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">No students yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4 font-medium">Student</th>
                  <th className="pb-3 pr-4 font-medium">Course</th>
                  <th className="pb-3 pr-4 font-medium">Progress</th>
                  <th className="pb-3 pr-4 font-medium">Enrolled</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4">
                      <Link
                        href={`/instructor/students/${s.user.id}?course=${s.courseId}`}
                        className="flex items-center gap-2 hover:text-brand"
                      >
                        <Avatar
                          src={s.user.avatarUrl ?? undefined}
                          alt={s.user.fullName}
                          size="sm"
                        />
                        <div>
                          <p className="font-medium">{s.user.fullName}</p>
                          <p className="text-xs text-gray-400">@{s.user.username}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <Link href={`/courses/${s.course.slug}`} className="hover:text-brand line-clamp-1">
                        {s.course.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 w-36">
                      <ProgressBar value={s.progressPct} showLabel />
                    </td>
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                      {formatDate(s.enrolledAt)}
                    </td>
                    <td className="py-3">
                      {s.completedAt ? (
                        <Badge variant="success" className="text-xs">Completed</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">In progress</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
