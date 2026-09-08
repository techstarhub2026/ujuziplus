"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, ArrowRight } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop";

export function HomeContinueCompact({
  title,
  slug,
  thumbnailUrl,
  instructorName,
  durationHours,
  firstLessonSlug,
  progressPct,
  pendingProgram,
}: {
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  instructorName: string;
  durationHours: number;
  firstLessonSlug: string;
  progressPct: number;
  pendingProgram?: {
    title: string;
    slug: string;
    startDate: string;
    endDate: string;
    format: string;
  } | null;
}) {
  return (
    <div className="home-continue-compact">
      <div className="home-continue-compact__media">
        <Image
          src={thumbnailUrl || PLACEHOLDER}
          alt=""
          fill
          className="object-cover"
          sizes="340px"
          unoptimized={(thumbnailUrl || PLACEHOLDER).startsWith("/content/")}
        />
        <div className="home-continue-compact__media-shade" aria-hidden />
        <div className="home-continue-compact__head">
          <Play className="h-4 w-4" />
          <span>Continue learning</span>
        </div>
      </div>

      <div className="home-continue-compact__body">
        <p className="home-continue-compact__title">{title}</p>
        <p className="home-continue-compact__meta">
          {instructorName} · {durationHours}h
        </p>
        <div className="home-continue-compact__progress">
          <div className="home-continue-compact__progress-labels">
            <span>Progress</span>
            <span>{progressPct}%</span>
          </div>
          <ProgressBar value={progressPct} showMarks />
        </div>
        <Link
          href={`/learn/${slug}/${firstLessonSlug}`}
          className="home-continue-compact__btn"
        >
          Resume course
          <ArrowRight className="h-4 w-4" />
        </Link>
        {pendingProgram && (
          <Link href={`/programs/${pendingProgram.slug}`} className="home-continue-compact__program">
            <span className="home-continue-compact__program-label">Upcoming program</span>
            <span className="home-continue-compact__program-title">{pendingProgram.title}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
