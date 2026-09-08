import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { getInstructorAssignmentQueue } from "@/lib/actions/assignments";
import { formatDate } from "@/lib/utils";
import { ClipboardList } from "lucide-react";
import { getAuthSession } from "@/lib/auth-server";

export default async function InstructorAssignmentsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const queue = await getInstructorAssignmentQueue(session.user.id);

  return (
    <div>
      <PageHeader
        title="Assignment submissions"
        description="Review and grade student work"
      />

      {queue.length === 0 ? (
        <Card className="py-14 text-center">
          <ClipboardList className="mx-auto h-8 w-8 text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm">No submissions waiting for review.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {queue.map((s) => (
            <Card key={s.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <p className="font-semibold">{s.user.fullName}</p>
                <p className="text-sm text-gray-500">
                  {s.assignment.lesson.module.course.title} · {s.assignment.lesson.title}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Submitted {s.submittedAt ? formatDate(s.submittedAt) : "—"} ·{" "}
                  {s.files.length} file{s.files.length !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={s.status === "REVISION_REQUESTED" ? "error" : "warning"}>
                  {s.status.replace("_", " ").toLowerCase()}
                </Badge>
                <Button asChild size="sm">
                  <Link href={`/instructor/assignments/grade/${s.id}`}>Grade</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
