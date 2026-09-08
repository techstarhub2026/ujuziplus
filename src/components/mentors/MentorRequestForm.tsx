"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { submitMentorRequest } from "@/lib/actions/mentors";
import { useAppStore } from "@/store/appStore";
import Link from "next/link";

export function MentorRequestForm({
  mentorSlug,
  mentorName,
  isAuthenticated,
}: {
  mentorSlug: string;
  mentorName: string;
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [goal, setGoal] = useState("");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated) {
    return (
      <Card className="mentor-request-card p-6 text-center">
        <h3 className="font-display text-lg font-semibold">Request guidance</h3>
        <p className="mt-2 text-sm text-gray-500">
          Sign in to ask {mentorName} what to learn and how to get there.
        </p>
        <Button asChild className="mt-4">
          <Link href={`/auth/login?callbackUrl=/mentors/${mentorSlug}`}>Sign in to request</Link>
        </Button>
      </Card>
    );
  }

  const submit = () => {
    startTransition(async () => {
      const res = await submitMentorRequest({ mentorSlug, goal, message });
      if (res.success) {
        showToast("Request sent! We'll notify you when there's a response.", "success");
        router.push("/dashboard/mentors");
      } else {
        showToast(!res.success ? res.error : "Failed", "error");
      }
    });
  };

  return (
    <Card className="mentor-request-card p-6" id="request">
      <h3 className="font-display text-lg font-semibold">Request guidance</h3>
      <p className="mt-1 text-sm text-gray-500">
        Tell {mentorName} what you&apos;re trying to learn. Be specific — it helps mentors point you to the right courses and kits.
      </p>
      <div className="mt-4 space-y-3">
        <Input
          label="What are you trying to learn?"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Build a line-following robot for my school fair"
        />
        <Textarea
          label="Your message"
          className="min-h-[100px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Share your current level, timeline, and what you've tried so far…"
        />
        <Button disabled={isPending} onClick={submit} className="w-full sm:w-auto">
          {isPending ? "Sending…" : "Send request"}
        </Button>
      </div>
    </Card>
  );
}
