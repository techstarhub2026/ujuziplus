/**
 * Instructor view of a single student's progress
 */
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { getInstructorStudentDetail } from "@/lib/actions/instructor";
import { getAuthSession } from "@/lib/auth-server";

export default async function StudentProgressPage({
  params,
  searchParams,
}: {
  params: { studentId: string };
  searchParams: { course?: string };
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login");

  const detail = await getInstructorStudentDetail(
    session.user.id,
    params.studentId,
    searchParams.course
  );
  if (!detail) notFound();

  const { enrollment, lessons, quizAttempts } = detail;
  const completedCount = lessons.filter((l) => l.completed).length;
  const progressPct =
    lessons.length > 0
      ? Math.round((completedCount / lessons.length) * 100)
      : 0;

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/instructor/students">← Students</Link>
      </Button>

      <div className="flex items-center gap-4 mb-6">
        <Avatar
          src={enrollment.user.avatarUrl ?? undefined}
          alt={enrollment.user.fullName}
          size="lg"
        />
        <div>
          <h1 className="text-2xl font-bold">{enrollment.user.fullName}</h1>
          <p className="text-gray-500">@{enrollment.user.username}</p>
          <p className="text-sm text-brand mt-1">{enrollment.course.title}</p>
        </div>
      </div>

      <Card className="mb-4 p-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-sm text-gray-500">Overall progress</span>
          {enrollment.completedAt ? (
            <Badge variant="success">Course completed</Badge>
          ) : (
            <Badge variant="outline">In progress</Badge>
          )}
        </div>
        <ProgressBar value={progressPct} showLabel className="mt-2" />
        <p className="text-xs text-gray-400 mt-1">
          {completedCount} of {lessons.length} lessons
        </p>
      </Card>

      <Card>
        <h3 className="font-semibold mb-4">Lesson progress</h3>
        {lessons.length === 0 ? (
          <p className="text-sm text-gray-400">This course has no lessons yet.</p>
        ) : (
          lessons.map((l) => (
            <div key={l.id} className="mb-3 last:mb-0">
              <div className="flex justify-between text-sm mb-1">
                <span>{l.title}</span>
                <span>{l.completed ? "100%" : "0%"}</span>
              </div>
              <ProgressBar value={l.completed ? 100 : 0} />
            </div>
          ))
        )}
      </Card>

      <Card className="mt-4">
        <h3 className="font-semibold mb-3">Quiz attempts</h3>
        {quizAttempts.length === 0 ? (
          <p className="text-sm text-gray-400">No quiz attempts yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {quizAttempts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
              >
                <span>{a.quiz.lesson.title}</span>
                <span className={a.passed ? "text-green-600 font-medium" : "text-red-600"}>
                  {a.score}% {a.passed ? "· Passed" : "· Failed"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Button asChild className="mt-4" variant="secondary">
        <Link href={`/learn/${enrollment.course.slug}`} target="_blank">
          Open course player
        </Link>
      </Button>
    </div>
  );
}
