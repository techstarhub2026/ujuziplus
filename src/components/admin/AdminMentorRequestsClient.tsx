"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { updateMentorRequestStatus } from "@/lib/actions/mentors";
import { useAppStore } from "@/store/appStore";
import type { MentorRequestStatus } from "@prisma/client";

type RequestRow = {
  id: string;
  goal: string;
  message: string;
  status: MentorRequestStatus;
  mentorReply: string | null;
  createdAt: Date;
  learner: { id: string; fullName: string; email: string; username: string };
  mentor: { id: string; slug: string; displayName: string };
};

export function AdminMentorRequestsClient({ requests }: { requests: RequestRow[] }) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();

  const setStatus = (id: string, status: MentorRequestStatus) => {
    const reply =
      status === "ACCEPTED"
        ? prompt("Optional reply to learner:")
        : status === "DECLINED"
          ? prompt("Reason (optional):")
          : null;

    startTransition(async () => {
      const res = await updateMentorRequestStatus(id, status, reply ?? undefined);
      if (res.success) {
        showToast(`Request ${status.toLowerCase()}`, "success");
        router.refresh();
      } else showToast(!res.success ? res.error : "Failed", "error");
    });
  };

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/mentors">← Mentors</Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">Mentorship requests</h1>
      <div className="space-y-4">
        {requests.map((r) => (
          <Card key={r.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="outline">{r.status}</Badge>
                  <span className="text-sm text-gray-500">
                    {new Date(r.createdAt).toLocaleString("en-TZ")}
                  </span>
                </div>
                <p className="mt-2 font-semibold">
                  {r.learner.fullName} →{" "}
                  <Link href={`/mentors/${r.mentor.slug}`} className="text-brand hover:underline">
                    {r.mentor.displayName}
                  </Link>
                </p>
                <p className="mt-1 text-sm"><strong>Goal:</strong> {r.goal}</p>
                <p className="mt-1 text-sm text-gray-600">{r.message}</p>
                {r.mentorReply && (
                  <p className="mt-2 text-sm bg-gray-50 rounded-lg p-2"><strong>Reply:</strong> {r.mentorReply}</p>
                )}
              </div>
              {r.status === "PENDING" && (
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={isPending} onClick={() => setStatus(r.id, "ACCEPTED")}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" disabled={isPending} onClick={() => setStatus(r.id, "DECLINED")}>
                    Decline
                  </Button>
                  <Button size="sm" variant="ghost" disabled={isPending} onClick={() => setStatus(r.id, "CLOSED")}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}
        {requests.length === 0 && (
          <Card className="py-12 text-center text-sm text-gray-400">No requests yet.</Card>
        )}
      </div>
    </div>
  );
}
