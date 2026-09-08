"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { HomeCourseCard } from "@/components/home/HomeCourseCard";

type CourseItem = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  instructorName: string;
  durationHours: number;
  level: string;
  category: string | null;
  isFree: boolean;
};

/** Trending course rail — reader-driven, paged. */
export function HomeQuickCoursePeek({ courses }: { courses: CourseItem[] }) {
  const peek = courses.slice(0, 12);
  if (peek.length === 0) return null;

  return (
    <section className="home-rail" aria-labelledby="trending-heading">
      <div className="home-rail__header">
        <div className="home-rail__copy">
          <h2 id="trending-heading" className="home-rail__title">
            Trending now
          </h2>
          <p className="home-rail__desc">
            Popular courses learners are starting this week.
          </p>
        </div>
        <Link href="/courses" className="home-rail__link">
          All courses
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <HomeCarousel itemWidth={272} gap={20} ariaLabel="Trending courses">
        {peek.map((c) => (
          <HomeCourseCard key={c.id} {...c} />
        ))}
      </HomeCarousel>
    </section>
  );
}
