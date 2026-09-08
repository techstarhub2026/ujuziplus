"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCourse } from "@/lib/actions/courses";
import { useAppStore } from "@/store/appStore";

type CourseCardActionsProps = {
  courseId: string;
  instructorId: string;
  status: string;
  hasStudentHistory: boolean;
};

export function CourseCardActions({
  courseId,
  instructorId,
  status,
  hasStudentHistory,
}: CourseCardActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  const handleDelete = () => {
    const willArchive = hasStudentHistory || status === "PUBLISHED";
    const message = willArchive
      ? "This course has enrolled students, issued certificates, or is published, so it will be archived (hidden from the catalog) instead of deleted, to preserve their records. Continue?"
      : "Delete this course permanently? This cannot be undone.";

    if (!confirm(message)) return;

    startTransition(async () => {
      const res = await deleteCourse(courseId, instructorId);
      if (res.success) {
        showToast(res.data?.archived ? "Course archived" : "Course deleted", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Delete failed", "error");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2 shrink-0">
      <Button asChild variant="outline" size="sm">
        <Link href={`/instructor/courses/${courseId}/edit`}>Edit</Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/instructor/courses/${courseId}/analytics`}>Analytics</Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/instructor/courses/${courseId}/preview`}>
          <Eye className="h-3 w-3 mr-1" />Preview
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:text-red-700 hover:bg-red-50"
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="h-3 w-3 mr-1" />Delete
      </Button>
    </div>
  );
}
