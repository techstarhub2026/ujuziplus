import { redirect, notFound } from "next/navigation";
import { getSubmissionForGrading } from "@/lib/actions/assignments";
import { AssignmentGradeForm } from "@/components/instructor/AssignmentGradeForm";
import { getAuthSession } from "@/lib/auth-server";

export default async function GradeSubmissionPage({
  params,
}: {
  params: { submissionId: string };
}) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const submission = await getSubmissionForGrading(
    params.submissionId,
    session.user.id
  );
  if (!submission) notFound();

  return (
    <AssignmentGradeForm
      submissionId={submission.id}
      instructorId={session.user.id}
      studentName={submission.user.fullName}
      courseTitle={submission.assignment.lesson.module.course.title}
      lessonTitle={submission.assignment.lesson.title}
      maxScore={submission.assignment.maxScore}
      files={submission.files}
      textResponse={submission.textResponse}
      githubUrl={submission.githubUrl}
    />
  );
}
