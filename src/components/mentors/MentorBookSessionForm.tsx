"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { bookMentorSession } from "@/lib/actions/mentors";
import { useAppStore } from "@/store/appStore";
import Link from "next/link";

export function MentorBookSessionForm({
  mentorSlug,
  mentorName,
  isAuthenticated,
  requestId,
}: {
  mentorSlug: string;
  mentorName: string;
  isAuthenticated: boolean;
  requestId?: string;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [topic, setTopic] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMins, setDurationMins] = useState("30");
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-gray-500">Sign in to book a session with {mentorName}.</p>
        <Button asChild className="mt-3">
          <Link href={`/auth/login?callbackUrl=/mentors/${mentorSlug}`}>Sign in</Link>
        </Button>
      </Card>
    );
  }

  const book = () => {
    startTransition(async () => {
      const res = await bookMentorSession({
        mentorSlug,
        topic,
        scheduledAt,
        durationMins: parseInt(durationMins, 10) || 30,
        requestId,
      });
      if (res.success) {
        showToast("Session booked! Check your dashboard for details.", "success");
        router.push("/dashboard/mentors");
      } else {
        showToast(!res.success ? res.error : "Failed", "error");
      }
    });
  };

  return (
    <Card className="p-6" id="book">
      <h3 className="font-display text-lg font-semibold">Book a session</h3>
      <p className="mt-1 text-sm text-gray-500">
        Schedule a {durationMins}-minute guidance call with {mentorName}.
      </p>
      <div className="mt-4 space-y-3">
        <Input
          label="Session topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What will you discuss?"
        />
        <Input
          label="Date & time"
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
        <label className="block text-sm">
          <span className="font-medium">Duration</span>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={durationMins}
            onChange={(e) => setDurationMins(e.target.value)}
          >
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="45">45 minutes</option>
            <option value="60">60 minutes</option>
          </select>
        </label>
        <Button disabled={isPending} onClick={book}>
          {isPending ? "Booking…" : "Confirm booking"}
        </Button>
      </div>
    </Card>
  );
}
