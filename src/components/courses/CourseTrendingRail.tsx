"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { HomeCourseCard } from "@/components/home/HomeCourseCard";
import type { CourseStoreItem } from "@/components/courses/CourseStoreCard";

export function CourseTrendingRail({
  courses,
}: {
  courses: CourseStoreItem[];
  /** Retained for call-site compatibility; enrolment happens on the course page. */
  onEnroll?: (course: CourseStoreItem) => void;
}) {
  if (courses.length < 2) return null;

  return (
    <section className="course-trending-section" aria-labelledby="course-trending-heading">
      <div className="home-rail__header">
        <div className="home-rail__copy">
          <h2 id="course-trending-heading" className="home-rail__title">
            Trending now
          </h2>
          <p className="home-rail__desc">Most enrolled courses this week.</p>
        </div>
        <Link href="/courses" className="home-rail__link">
          Browse all
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <HomeCarousel itemWidth={272} gap={20} ariaLabel="Trending courses">
        {courses.map((c) => (
          <div key={c.id} className="course-trending-card-wrap">
            <HomeCourseCard
              slug={c.slug}
              title={c.title}
              thumbnailUrl={c.thumbnailUrl || null}
              instructorName={c.instructor.fullName}
              durationHours={c.durationHours}
              level={c.level}
              category={c.category}
              isFree={c.isFree}
            />
            {c.totalEnrollments > 0 && (
              <p className="course-trending-learners">
                {c.totalEnrollments.toLocaleString()} enrolled
              </p>
            )}
          </div>
        ))}
      </HomeCarousel>
    </section>
  );
}
