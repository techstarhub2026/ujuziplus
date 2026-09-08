"use client";

import { useState, useTransition } from "react";
import { Users, Calendar, BookOpen, Loader2, CheckCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import Link from "next/link";

export type CohortCardData = {
  id: string;
  title: string;
  description: string | null;
  track: string;
  startsAt: string;
  endsAt: string | null;
  maxMembers: number;
  memberCount: number;
  mentor: {
    slug: string;
    displayName: string;
    avatarUrl: string | null;
    mentorType?: string | null;
  };
};

const TRACK_COLORS: Record<string, string> = {
  Robotics: "bg-orange-100 text-orange-700",
  IoT: "bg-teal-100 text-teal-700",
  "AI & Machine Learning": "bg-violet-100 text-violet-700",
  "Web Development": "bg-blue-100 text-blue-700",
  "Data Science": "bg-indigo-100 text-indigo-700",
  Entrepreneurship: "bg-emerald-100 text-emerald-700",
  Cybersecurity: "bg-red-100 text-red-700",
};

function getTrackColor(track: string) {
  return TRACK_COLORS[track] ?? "bg-gray-100 text-gray-600";
}

interface Props {
  cohort: CohortCardData;
  isJoined?: boolean;
  isAuthenticated: boolean;
  onJoin?: (cohortId: string) => Promise<{ success: boolean; error?: string }>;
}

export function MentorCohortCard({ cohort, isJoined = false, isAuthenticated, onJoin }: Props) {
  const [joined, setJoined] = useState(isJoined);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const spotsLeft = cohort.maxMembers - cohort.memberCount;
  const isFull = spotsLeft <= 0;
  const startDate = new Date(cohort.startsAt);
  const hasStarted = startDate <= new Date();

  function handleJoin() {
    if (!onJoin) return;
    setError("");
    startTransition(async () => {
      const res = await onJoin(cohort.id);
      if (res.success) setJoined(true);
      else setError(res.error ?? "Failed to join cohort.");
    });
  }

  return (
    <Card className={cn(
      "group relative flex flex-col p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand/10 hover:border-brand/30",
      joined && "border-brand/30 bg-brand/5"
    )}>
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-brand/15 to-orange-200/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden />
      {/* Track badge */}
      <div className="mb-3 flex items-center justify-between">
        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", getTrackColor(cohort.track))}>
          {cohort.track}
        </span>
        {joined && (
          <span className="flex items-center gap-1 text-xs font-semibold text-brand">
            <CheckCircle className="h-3.5 w-3.5" />Enrolled
          </span>
        )}
      </div>

      <h3 className="font-display font-semibold text-gray-900 mb-1 line-clamp-2">{cohort.title}</h3>
      {cohort.description && (
        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">{cohort.description}</p>
      )}

      {/* Mentor */}
      <Link href={`/mentors/${cohort.mentor.slug}`} className="flex items-center gap-2 mb-4 group/mentor">
        <Avatar src={cohort.mentor.avatarUrl} alt={cohort.mentor.displayName} size="sm" />
        <span className="text-sm font-medium text-gray-700 group-hover/mentor:text-brand transition">
          {cohort.mentor.displayName}
        </span>
      </Link>

      {/* Meta */}
      <div className="mb-4 space-y-1.5 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>
            {hasStarted ? "Started" : "Starts"} {startDate.toLocaleDateString("en-TZ", { day: "numeric", month: "short", year: "numeric" })}
            {cohort.endsAt && ` → ${new Date(cohort.endsAt).toLocaleDateString("en-TZ", { day: "numeric", month: "short" })}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 shrink-0 text-gray-400" />
          <span>
            {cohort.memberCount} / {cohort.maxMembers} members
            {!isFull && !joined && (
              <span className="ml-1 text-green-600 font-semibold">· {spotsLeft} spot{spotsLeft !== 1 ? "s" : ""} left</span>
            )}
            {isFull && !joined && <span className="ml-1 text-red-500 font-semibold">· Full</span>}
          </span>
        </div>

        {/* Capacity bar */}
        <ProgressBar
          className="mt-2"
          size="sm"
          value={(cohort.memberCount / cohort.maxMembers) * 100}
          barClassName={isFull ? "bg-red-400" : "bg-brand"}
        />
      </div>

      {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

      {joined ? (
        <div className="flex items-center gap-2 rounded-xl bg-brand/10 px-3 py-2 text-sm font-medium text-brand">
          <BookOpen className="h-4 w-4" />
          You&apos;re in this cohort
        </div>
      ) : !isAuthenticated ? (
        <Button asChild size="sm" variant="outline" className="w-full">
          <Link href="/auth/login">Sign in to join</Link>
        </Button>
      ) : (
        <Button
          size="sm"
          className="w-full"
          disabled={isFull || isPending}
          onClick={handleJoin}
        >
          {isPending ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Joining…</> : isFull ? "Cohort full" : "Join cohort"}
        </Button>
      )}
    </Card>
  );
}
