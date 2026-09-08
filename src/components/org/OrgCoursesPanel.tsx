"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { setCourseOrganization } from "@/lib/actions/organizations";
import { useAppStore } from "@/store/appStore";

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  instructorName: string;
  totalEnrollments: number;
  organizationId: string | null;
};

export function OrgCoursesPanel({
  orgSlug,
  userId,
  canManage,
  courses,
}: {
  orgSlug: string;
  userId: string;
  canManage: boolean;
  courses: CourseRow[];
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();

  const offered = courses.filter((c) => c.organizationId !== null);
  const catalog = courses.filter((c) => c.organizationId === null);

  const toggle = (courseId: string, nextOffered: boolean) => {
    startTransition(async () => {
      const res = await setCourseOrganization(userId, orgSlug, courseId, nextOffered);
      if (res.success) {
        showToast(nextOffered ? "Added to your organization's courses" : "Removed from your organization's courses", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  return (
    <div>
      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">
          Courses this organization offers
        </h2>
        {offered.length > 0 ? (
          <div className="space-y-3">
            {offered.map((c) => (
              <Card key={c.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-gray-500">
                    by {c.instructorName} · {c.totalEnrollments.toLocaleString()} total enrollments
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/courses/${c.slug}`}>View</Link>
                  </Button>
                  {canManage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={isPending}
                      onClick={() => toggle(c.id, false)}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center text-sm text-gray-400">
            {canManage
              ? "No courses offered yet. Add one from the platform catalog below."
              : "No courses offered by this organization yet."}
          </Card>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-gray-500">Platform catalog</h2>
        <div className="space-y-3">
          {catalog.slice(0, 20).map((c) => (
            <Card key={c.id} className="flex items-center justify-between gap-4 p-4">
              <div>
                <h3 className="font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-500">
                  by {c.instructorName} · {c.totalEnrollments.toLocaleString()} total enrollments
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/courses/${c.slug}`}>View</Link>
                </Button>
                {canManage && (
                  <Button size="sm" disabled={isPending} onClick={() => toggle(c.id, true)}>
                    Offer this course
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
        {catalog.length === 0 && (
          <Card className="p-8 text-center text-sm text-gray-400">
            No other published courses on the platform yet.
          </Card>
        )}
      </section>
    </div>
  );
}
