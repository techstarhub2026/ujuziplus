"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, X, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { approveInstructor, rejectInstructor } from "@/lib/actions/admin";
import { useAppStore } from "@/store/appStore";

type Credential = {
  id: string;
  title: string;
  issuer: string | null;
  issueDate: Date | null;
  credentialUrl: string | null;
  fileUrl: string | null;
};

type Applicant = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  instructorCredentials: Credential[];
};

export function PendingInstructorsPanel({
  applicants,
  adminId,
}: {
  applicants: Applicant[];
  adminId: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const showToast = useAppStore((s) => s.showToast);

  function handleApprove(userId: string) {
    startTransition(async () => {
      const res = await approveInstructor(adminId, userId);
      if (res.success) {
        showToast("Instructor approved", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  }

  function handleReject(userId: string) {
    if (reason.trim().length < 10) {
      showToast("Please provide a rejection reason (at least 10 characters).", "error");
      return;
    }
    startTransition(async () => {
      const res = await rejectInstructor(adminId, userId, reason);
      if (res.success) {
        showToast("Application rejected", "success");
        setRejectingId(null);
        setReason("");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  }

  if (applicants.length === 0) {
    return (
      <Card className="py-14 text-center">
        <UserCheck className="mx-auto mb-2 h-8 w-8 text-gray-200" />
        <p className="text-sm text-gray-400">No pending instructor applications.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {applicants.map((a) => (
        <Card key={a.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Avatar src={a.avatarUrl ?? undefined} alt={a.fullName} size="md" />
              <div>
                <p className="font-semibold">{a.fullName}</p>
                <p className="text-xs text-gray-500">
                  {a.email} · @{a.username}
                </p>
                <p className="mt-1 text-xs text-gray-400">Applied {formatDate(a.createdAt)}</p>
                {a.bio && <p className="mt-2 max-w-lg text-sm text-gray-600">{a.bio}</p>}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                disabled={isPending}
                onClick={() => handleApprove(a.id)}
              >
                <Check className="mr-1 h-3.5 w-3.5" /> Approve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={isPending}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setRejectingId(rejectingId === a.id ? null : a.id)}
              >
                <X className="mr-1 h-3.5 w-3.5" /> Reject
              </Button>
            </div>
          </div>

          {a.instructorCredentials.length > 0 && (
            <div className="mt-3 space-y-1.5 border-t border-gray-100 pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Certifications
              </p>
              {a.instructorCredentials.map((c) => (
                <div key={c.id} className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{c.title}</span>
                  {c.issuer && <span> · {c.issuer}</span>}
                  {c.issueDate && <span> · {formatDate(c.issueDate)}</span>}
                  {c.credentialUrl && (
                    <>
                      {" · "}
                      <a
                        href={c.credentialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline"
                      >
                        View link
                      </a>
                    </>
                  )}
                  {c.fileUrl && (
                    <>
                      {" · "}
                      <a
                        href={c.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand hover:underline"
                      >
                        View certificate PDF
                      </a>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {rejectingId === a.id && (
            <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for rejection (min. 10 characters)"
                className="flex-1 rounded-md border px-3 py-1.5 text-sm"
              />
              <Button size="sm" disabled={isPending} onClick={() => handleReject(a.id)}>
                Confirm reject
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
