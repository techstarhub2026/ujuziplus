"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { joinGroupSession } from "@/lib/actions/mentors";
import { useAppStore } from "@/store/appStore";
import { Calendar, Users } from "lucide-react";

type GroupSession = {
  id: string;
  title: string;
  description: string | null;
  scheduledAt: string;
  durationMins: number;
  maxAttendees: number;
  meetingUrl: string | null;
  attendeeCount: number;
};

export function MentorGroupSessions({
  sessions,
  isAuthenticated,
  mentorSlug,
}: {
  sessions: GroupSession[];
  isAuthenticated: boolean;
  mentorSlug: string;
}) {
  if (sessions.length === 0) return null;

  return (
    <Card className="p-6">
      <h3 className="font-display text-lg font-semibold">Group office hours</h3>
      <p className="mt-1 text-sm text-gray-500">
        Join live group sessions — ask questions and learn alongside peers.
      </p>
      <ul className="mt-4 space-y-3">
        {sessions.map((s) => (
          <GroupSessionRow
            key={s.id}
            session={s}
            isAuthenticated={isAuthenticated}
            mentorSlug={mentorSlug}
          />
        ))}
      </ul>
    </Card>
  );
}

function GroupSessionRow({
  session,
  isAuthenticated,
  mentorSlug,
}: {
  session: GroupSession;
  isAuthenticated: boolean;
  mentorSlug: string;
}) {
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const when = new Date(session.scheduledAt).toLocaleString("en-TZ", {
    timeZone: "Africa/Dar_es_Salaam",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const full = session.attendeeCount >= session.maxAttendees;

  const join = () => {
    startTransition(async () => {
      const res = await joinGroupSession(session.id);
      if (res.success) {
        showToast("You're registered for this group session!", "success");
        router.refresh();
      } else {
        showToast(!res.success ? res.error : "Failed", "error");
      }
    });
  };

  return (
    <li className="rounded-xl border border-gray-100 bg-gray-50/80 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold text-gray-900">{session.title}</h4>
          {session.description && (
            <p className="mt-1 text-sm text-gray-500">{session.description}</p>
          )}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {when} EAT
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {session.attendeeCount}/{session.maxAttendees} joined
            </span>
          </div>
        </div>
        {!isAuthenticated ? (
          <Button asChild size="sm" variant="outline">
            <Link href={`/auth/login?callbackUrl=/mentors/${mentorSlug}`}>Sign in</Link>
          </Button>
        ) : full ? (
          <span className="text-xs font-medium text-gray-400">Full</span>
        ) : (
          <Button size="sm" disabled={isPending} onClick={join}>
            {isPending ? "Joining…" : "Join session"}
          </Button>
        )}
      </div>
    </li>
  );
}
