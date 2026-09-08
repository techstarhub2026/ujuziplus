"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { MentorCard } from "@/components/mentors/MentorCard";
import { MentorFeature } from "@/components/mentors/MentorFeature";
import type { SerializedMentor } from "@/lib/actions/mentors";

/**
 * The homepage mentor block: one featured mentor, then the rest as a
 * reader-driven rail.
 *
 * Previously these were two separate sections — a dark navy spotlight panel
 * and, below it, an auto-scrolling marquee of mentor cards. Two mentor blocks
 * in different visual languages, stacked, read as two unrelated features; and
 * the marquee meant faces slid out of view mid-read. One section, one
 * surface, no autoplay.
 */
export function HomeMentorRail({
  mentors,
  featured,
}: {
  mentors: SerializedMentor[];
  featured?: SerializedMentor | null;
}) {
  if (mentors.length === 0) return null;

  const lead = featured ?? mentors[0];
  const rest = mentors.filter((m) => m.id !== lead.id).slice(0, 12);

  return (
    <section className="mentor-section" aria-labelledby="mentors-heading">
      <div className="home-rail__header">
        <div className="home-rail__copy">
          <h2 id="mentors-heading" className="home-rail__title">
            Learn from industry builders
          </h2>
          <p className="home-rail__desc">
            Practitioners who guide what to learn next — robotics, IoT, coding
            and more.
          </p>
        </div>
        <Link href="/mentors" className="home-rail__link">
          All mentors
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <MentorFeature mentor={lead} />

      {rest.length > 0 && (
        <div className="mentor-section__rail">
          <HomeCarousel itemWidth={272} gap={20} ariaLabel="More mentors">
            {rest.map((m) => (
              <MentorCard key={m.id} mentor={m} variant="compact" />
            ))}
          </HomeCarousel>
        </div>
      )}
    </section>
  );
}
