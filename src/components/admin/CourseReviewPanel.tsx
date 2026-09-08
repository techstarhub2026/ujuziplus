"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, X, BookOpen, Eye, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils";
import { approveCourse, rejectCourse, deleteCourseAsAdmin } from "@/lib/actions/admin";
import { useAppStore } from "@/store/appStore";

type Instructor = { id: string; fullName: string; email: string; avatarUrl: string | null };

type CourseItem = {
  id: string;
  title: string;
  slug: string;
  status: string;
  updatedAt: Date;
  instructor: Instructor;
  _count: { modules: number; enrollments?: number; certificates?: number };
};

type Props = {
  pending: CourseItem[];
  allCourses: CourseItem[];
  adminId: string;
  tab: string;
};

const STATUS_VARIANT: Record<string, "success" | "accent" | "outline" | "error"> = {
  PUBLISHED: "success", PENDING_REVIEW: "accent",
  DRAFT: "outline", REJECTED: "error", ARCHIVED: "outline",
};

export function CourseReviewPanel({ pending, allCourses, adminId, tab: initialTab }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState(initialTab);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  function handleApprove(courseId: string) {
    startTransition(async () => {
      const res = await approveCourse(adminId, courseId);
      if (res.success) {
        showToast("Course approved and published!", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed to approve", "error");
      }
    });
  }

  function handleReject(courseId: string) {
    if (!reason.trim()) { showToast("Please provide a rejection reason.", "error"); return; }
    startTransition(async () => {
      const res = await rejectCourse(adminId, courseId, reason);
      if (res.success) {
        showToast("Course rejected. The instructor has been notified.", "success");
        setRejectId(null);
        setReason("");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed to reject course", "error");
      }
    });
  }

  function handleDelete(course: CourseItem) {
    const hasStudentHistory = (course._count.enrollments ?? 0) > 0 || (course._count.certificates ?? 0) > 0;
    const willArchive = hasStudentHistory || course.status === "PUBLISHED";
    const message = willArchive
      ? "This course has enrolled students, issued certificates, or is published, so it will be archived instead of deleted, to preserve their records. Continue?"
      : "Delete this course permanently? This cannot be undone.";
    if (!confirm(message)) return;

    startTransition(async () => {
      const res = await deleteCourseAsAdmin(adminId, course.id);
      if (res.success) {
        showToast(res.data?.archived ? "Course archived" : "Course deleted", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Delete failed", "error");
      }
    });
  }

  const displayList = tab === "pending" ? pending : allCourses;

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b">
        {[
          { key: "pending", label: `Pending review (${pending.length})` },
          { key: "all", label: "All courses" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); router.push(`/admin/courses?tab=${t.key}`); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t.key ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {displayList.length === 0 ? (
        <Card className="py-14 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm">
            {tab === "pending" ? "No pending reviews — great job!" : "No courses found."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {displayList.map((course) => (
            <Card key={course.id}>
              {/* Reject modal */}
              {rejectId === course.id && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <Textarea
                    label="Rejection reason (sent to instructor)"
                    className="h-20"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Missing curriculum, low-quality content…"
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(course.id)}
                      disabled={isPending}
                    >
                      Confirm rejection
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setRejectId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold">{course.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant={STATUS_VARIANT[course.status] ?? "outline"} className="text-xs">
                      {course.status.replace("_", " ").toLowerCase()}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {course._count.modules} modules · by {course.instructor.fullName}
                    </span>
                    <span className="text-xs text-gray-400">
                      Updated {formatDate(course.updatedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/courses/${course.slug}?preview=admin`} target="_blank">
                      <Eye className="h-3.5 w-3.5 mr-1" />Preview
                    </Link>
                  </Button>

                  {course.status === "PENDING_REVIEW" && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => { setRejectId(course.id); setReason(""); }}
                        disabled={isPending}
                      >
                        <X className="h-3.5 w-3.5 mr-1 text-red-500" />Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(course.id)}
                        disabled={isPending}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />Approve
                      </Button>
                    </>
                  )}

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(course)}
                    disabled={isPending}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
