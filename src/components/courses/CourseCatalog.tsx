"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  CourseStoreCard,
  type CourseStoreItem,
} from "@/components/courses/CourseStoreCard";
import { CourseDiscoveryRail } from "@/components/courses/CourseDiscoveryRail";
import { CourseTrendingRail } from "@/components/courses/CourseTrendingRail";
import { groupCatalogItems } from "@/components/home/HomeCategoryCarousel";
import { getBannerImage } from "@/lib/banner-images";
import { LAB_COURSE_FILTERS } from "@/lib/ujuzi-brand";
import { MotionGrid } from "@/components/motion/RevealStagger";
import { Reveal } from "@/components/motion/Reveal";
import { usePersistedFilter } from "@/hooks/usePersistedFilter";
import { ParticleNetworkBackground } from "@/components/home/ParticleNetworkBackground";
import type { ParticleSettings } from "@/components/home/PageParticleBackground";

type SortKey = "popular" | "title" | "price-low" | "price-high";
type PriceFilter = "all" | "free" | "paid";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";

function sortCourses(courses: CourseStoreItem[], sort: SortKey): CourseStoreItem[] {
  const list = [...courses];
  switch (sort) {
    case "title":
      return list.sort((a, b) => a.title.localeCompare(b.title));
    case "price-low":
      return list.sort(
        (a, b) =>
          (a.isFree ? 0 : a.discountPrice ?? a.price) - (b.isFree ? 0 : b.discountPrice ?? b.price)
      );
    case "price-high":
      return list.sort(
        (a, b) =>
          (b.isFree ? 0 : b.discountPrice ?? b.price) - (a.isFree ? 0 : a.discountPrice ?? a.price)
      );
    case "popular":
    default:
      return list.sort((a, b) => b.totalEnrollments - a.totalEnrollments);
  }
}

function applyFilters(
  courses: CourseStoreItem[],
  {
    category,
    priceFilter,
    levelFilter,
  }: {
    category: string | null;
    priceFilter: PriceFilter;
    levelFilter: LevelFilter;
  }
): CourseStoreItem[] {
  return courses.filter((c) => {
    if (category && c.category !== category) return false;
    if (priceFilter === "free" && !c.isFree) return false;
    if (priceFilter === "paid" && c.isFree) return false;
    if (levelFilter !== "all" && c.level.toLowerCase() !== levelFilter) return false;
    return true;
  });
}

export function CourseCatalog({
  courses,
  userId,
  particleSettings,
}: {
  courses: CourseStoreItem[];
  userId: string | null;
  particleSettings?: ParticleSettings;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = useState<string | null>(null);
  const [sort, setSort] = usePersistedFilter<SortKey>("courses_sort", "popular");
  const [priceFilter, setPriceFilter] = usePersistedFilter<PriceFilter>("courses_price_filter", "all");
  const [levelFilter, setLevelFilter] = usePersistedFilter<LevelFilter>("courses_level_filter", "all");

  useEffect(() => {
    const fromUrl = searchParams.get("category");
    if (fromUrl) setCategory(fromUrl);
  }, [searchParams]);

  const filtered = useMemo(
    () => sortCourses(applyFilters(courses, { category, priceFilter, levelFilter }), sort),
    [courses, category, priceFilter, levelFilter, sort]
  );

  const hasActiveFilters =
    !!category || priceFilter !== "all" || levelFilter !== "all";

  const browseMode = !hasActiveFilters;

  const topics = useMemo(() => {
    const counts = new Map<string, number>();
    for (const c of courses) {
      counts.set(c.category, (counts.get(c.category) ?? 0) + 1);
    }
    const ordered = LAB_COURSE_FILTERS.filter((name) => counts.has(name)).map((name) => ({
      name,
      count: counts.get(name)!,
    }));
    const extras = Array.from(counts.entries())
      .filter(([name]) => !LAB_COURSE_FILTERS.includes(name as (typeof LAB_COURSE_FILTERS)[number]))
      .map(([name, count]) => ({ name, count }));
    return [...ordered, ...extras];
  }, [courses]);

  const trending = useMemo(
    () => sortCourses(courses, "popular").slice(0, 8),
    [courses]
  );

  const freeCourses = useMemo(() => courses.filter((c) => c.isFree), [courses]);

  const categoryRails = useMemo(
    () => groupCatalogItems(courses, (c) => c.category, "Featured"),
    [courses]
  );

  function handleEnroll(course: CourseStoreItem) {
    if (!userId) {
      router.push(`/auth/login?callbackUrl=/courses/${course.slug}`);
      return;
    }
    router.push(`/courses/${course.slug}`);
  }

  function clearFilters() {
    setCategory(null);
    setPriceFilter("all");
    setLevelFilter("all");
    setSort("popular");
  }

  return (
    <div className="course-store" style={{ position: "relative" }}>
      {particleSettings?.enabled && (
        <ParticleNetworkBackground
          enabled
          colors={particleSettings.colors}
          rainbowMode={particleSettings.rainbowMode}
          speed={particleSettings.speed}
          connectDistance={particleSettings.connectDistance}
          lineThickness={particleSettings.lineThickness}
          interaction={particleSettings.interaction}
          intensity={particleSettings.intensity}
        />
      )}
      <div className="course-store-body mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ position: "relative", zIndex: 1 }}>
        <div
          className="course-store-toolbar learner-hero learner-hero--photo"
          style={
            {
              "--hero-banner-image": `url(${getBannerImage("courses")})`,
            } as React.CSSProperties
          }
        >
          <div className="relative z-10">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white md:text-3xl lg:text-4xl">
              Courses
            </h1>
            <div className="course-store-toolbar__row mt-4">
            <p className="course-store-toolbar__count">
              {hasActiveFilters ? (
                <>
                  <strong>{filtered.length}</strong> result{filtered.length !== 1 ? "s" : ""}
                  {category && <> in {category}</>}
                </>
              ) : (
                <>
                  Showing <strong>{courses.length}</strong> course{courses.length !== 1 ? "s" : ""}
                </>
              )}
            </p>
            <label className="course-store-sort">
              <span className="sr-only">Sort courses</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                <option value="popular">Most popular</option>
                <option value="title">Title A–Z</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>

          <div className="course-store-quick-filters">
            {(["all", "free", "paid"] as const).map((p) => (
              <button
                key={p}
                type="button"
                className={`course-store-chip ${priceFilter === p ? "course-store-chip--active" : ""}`}
                onClick={() => setPriceFilter(p)}
              >
                {p === "all" ? "Any price" : p === "free" ? "Free" : "Paid"}
              </button>
            ))}
            {(["all", "beginner", "intermediate", "advanced"] as const).map((l) => (
              <button
                key={l}
                type="button"
                className={`course-store-chip ${levelFilter === l ? "course-store-chip--active" : ""}`}
                onClick={() => setLevelFilter(l)}
              >
                {l === "all" ? "All levels" : l.charAt(0).toUpperCase() + l.slice(1)}
              </button>
            ))}
            {hasActiveFilters && (
              <button type="button" className="course-store-chip course-store-chip--clear" onClick={clearFilters}>
                Clear all
              </button>
            )}
          </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="h-8 w-8 text-brand" />}
            title="No courses match"
            description="Try a different topic or reset your filters."
            actionLabel="Reset filters"
            onAction={clearFilters}
          />
        ) : browseMode ? (
          <div className="course-store-discovery animate-fade-in">
            {trending.length > 1 && (
              <CourseTrendingRail courses={trending} onEnroll={handleEnroll} />
            )}

            {freeCourses.length > 0 && (
              <Reveal delay={0.05}>
                <CourseDiscoveryRail
                  title="Start for free"
                  subtitle="No payment required — begin learning today"
                >
                  {freeCourses.map((c) => (
                    <CourseStoreCard key={c.id} course={c} onEnroll={handleEnroll} compact />
                  ))}
                </CourseDiscoveryRail>
              </Reveal>
            )}

            {categoryRails.map((group, i) =>
              group.items.length > 0 ? (
                <Reveal key={group.label} delay={0.04 + i * 0.015}>
                  <CourseDiscoveryRail
                    title={group.label}
                    subtitle={`${group.items.length} course${group.items.length !== 1 ? "s" : ""} in this topic`}
                    seeAllHref={`/courses?category=${encodeURIComponent(group.label)}`}
                  >
                    {group.items.map((c) => (
                      <CourseStoreCard key={c.id} course={c} onEnroll={handleEnroll} compact />
                    ))}
                  </CourseDiscoveryRail>
                </Reveal>
              ) : null
            )}

            <Reveal delay={0.04}>
              <section className="course-store-all">
                <div className="course-store-all__head">
                  <h2 className="course-store-all__title">All courses</h2>
                  <p className="course-store-all__desc">Complete catalog — compare and enroll in one click.</p>
                </div>
                <MotionGrid className="course-store-grid">
                  {sortCourses(courses, sort).map((c) => (
                    <CourseStoreCard key={c.id} course={c} onEnroll={handleEnroll} />
                  ))}
                </MotionGrid>
              </section>
            </Reveal>
          </div>
        ) : (
          <div className="course-store-results animate-fade-in">
            <div className="course-store-layout">
              <aside className="course-store-facet-panel">
                <h3 className="course-store-facet-panel__title">Filter results</h3>
                <div className="course-store-facet-group">
                  <p className="course-store-facet-label">Topic</p>
                  <ul className="course-store-facet-list">
                    <li>
                      <button
                        type="button"
                        className={!category ? "is-active" : undefined}
                        onClick={() => setCategory(null)}
                      >
                        All topics
                      </button>
                    </li>
                    {topics.map((t) => (
                      <li key={t.name}>
                        <button
                          type="button"
                          className={category === t.name ? "is-active" : undefined}
                          onClick={() => setCategory(t.name)}
                        >
                          {t.name}
                          <span>{t.count}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="course-store-facet-group">
                  <p className="course-store-facet-label">Price</p>
                  <ul className="course-store-facet-list">
                    {(["all", "free", "paid"] as const).map((p) => (
                      <li key={p}>
                        <button
                          type="button"
                          className={priceFilter === p ? "is-active" : undefined}
                          onClick={() => setPriceFilter(p)}
                        >
                          {p === "all" ? "Any price" : p === "free" ? "Free" : "Paid"}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="course-store-facet-group">
                  <p className="course-store-facet-label">Level</p>
                  <ul className="course-store-facet-list">
                    {(["all", "beginner", "intermediate", "advanced"] as const).map((l) => (
                      <li key={l}>
                        <button
                          type="button"
                          className={levelFilter === l ? "is-active" : undefined}
                          onClick={() => setLevelFilter(l)}
                        >
                          {l === "all" ? "All levels" : l.charAt(0).toUpperCase() + l.slice(1)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>

              <div className="min-w-0 flex-1">
                <MotionGrid className="course-store-grid">
                  {filtered.map((c) => (
                    <CourseStoreCard key={c.id} course={c} onEnroll={handleEnroll} />
                  ))}
                </MotionGrid>
              </div>
            </div>
          </div>
        )}

        {!userId && courses.length > 0 && (
          <Reveal>
          <div className="course-store-cta">
            <div>
              <p className="course-store-cta__title">Turn curiosity into a credential</p>
              <p className="course-store-cta__desc">
                Create your free account to enroll, track progress, and earn certificates.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/auth/register">Sign up free</Link>
            </Button>
          </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
