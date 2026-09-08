"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { broadcastToProgramRegistrants } from "@/lib/actions/programs";
import { useAppStore } from "@/store/appStore";

type Registrant = {
  id: string;
  registeredAt: Date;
  user: { fullName: string | null; email: string | null };
};

export function AdminProgramRegistrantsSection({
  programId,
  registrants,
}: {
  programId: string;
  registrants: Registrant[];
}) {
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const send = () => {
    if (!subject.trim() || !message.trim()) {
      showToast("Subject and message are required", "error");
      return;
    }
    startTransition(async () => {
      const res = await broadcastToProgramRegistrants(programId, subject, message);
      if (res.success) {
        showToast(`Sent to ${res.data.sent} registrant${res.data.sent !== 1 ? "s" : ""}`, "success");
        setSubject("");
        setMessage("");
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  return (
    <Card className="max-w-2xl space-y-4 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
        Registrants ({registrants.length})
      </h2>

      {registrants.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">No registrations yet.</p>
      ) : (
        <div className="max-h-64 space-y-1.5 overflow-y-auto">
          {registrants.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
              <span className="truncate">{r.user.fullName ?? r.user.email ?? "Unknown"}</span>
              <span className="shrink-0 text-xs text-gray-400">
                {new Date(r.registeredAt).toLocaleDateString("en-TZ")}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3 rounded-lg border border-dashed border-gray-200 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Broadcast message
        </p>
        <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
        <Textarea label="Message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button
          size="sm"
          disabled={isPending || registrants.length === 0}
          onClick={send}
        >
          {isPending ? "Sending…" : "Send to all registrants"}
        </Button>
      </div>
    </Card>
  );
}
