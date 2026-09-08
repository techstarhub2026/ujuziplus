"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PenLine, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { RichPostComposer } from "@/components/community/RichPostComposer";

export function NewDiscussionForm({
  channel,
  userId,
  courseId,
  compact = false,
}: {
  channel: string;
  userId: string;
  courseId?: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-400 hover:border-brand hover:text-brand transition"
        >
          <PenLine className="h-4 w-4" />
          {compact ? "Ask a question…" : "Start a quick thread…"}
        </button>
        {!compact && (
          <Link
            href={`/dashboard/community/write?channel=${channel}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand/10 px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/15"
          >
            <Sparkles className="h-4 w-4" />
            Write a rich story
          </Link>
        )}
      </div>
    );
  }

  return (
    <Card className="border-0 p-0 shadow-none">
      <h3 className="font-semibold mb-3 text-sm">
        {compact ? "Ask a question" : "Quick thread"}
      </h3>
      <RichPostComposer
        userId={userId}
        defaultChannel={channel}
        courseId={courseId}
        variant="compact"
        onSuccess={(id) => {
          setOpen(false);
          router.refresh();
          router.push(`/dashboard/community/${channel}/${id}`);
        }}
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="mt-3 text-xs text-gray-400 hover:text-gray-600"
      >
        Cancel
      </button>
    </Card>
  );
}
