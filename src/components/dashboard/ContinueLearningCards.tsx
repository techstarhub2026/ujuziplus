"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Play } from "lucide-react";
import { ProgressBar } from "@/components/ui/progress";

export type ContinueCourseItem = {
  id: string;
  progressPct: number;
  completedLessons: number;
  totalLessons: number;
  course: {
    title: string;
    slug: string;
    thumbnailUrl: string | null;
    instructor: { fullName: string };
  };
};

export function FeaturedContinueCourse({ course }: { course: ContinueCourseItem }) {
  const href = `/learn/${course.course.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="learner-featured-course group"
    >
      <Link href={href} className="learner-featured-course__link">
        <div className="learner-featured-course__media">
          {course.course.thumbnailUrl ? (
            <Image
              src={course.course.thumbnailUrl}
              alt=""
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 70vw"
              priority
              unoptimized={course.course.thumbnailUrl.startsWith("/content/")}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-navy/10">
              <BookOpen className="h-16 w-16 text-navy/20" />
            </div>
          )}
          <div className="learner-featured-course__overlay" />
          <span className="learner-featured-course__badge">
            <Play className="h-3.5 w-3.5 fill-current" />
            Pick up where you left off
          </span>
        </div>

        <div className="learner-featured-course__body">
          <div className="min-w-0 flex-1">
            <p className="learner-featured-course__eyebrow">{course.course.instructor.fullName}</p>
            <h3 className="learner-featured-course__title">{course.course.title}</h3>
            <div className="mt-4 max-w-md">
              <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-white/90">
                <span>{course.progressPct}% complete</span>
                <span className="text-white/70">
                  {course.completedLessons}/{course.totalLessons} lessons
                </span>
              </div>
              <ProgressBar value={course.progressPct} variant="onDark" showMarks />
            </div>
          </div>
          <span className="learner-featured-course__cta inline-flex shrink-0 items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white shadow-lg transition group-hover:bg-brand-dark">
            Resume
            <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}

export function ContinueLearningCard({
  course,
  index = 0,
}: {
  course: ContinueCourseItem;
  index?: number;
}) {
  const href = `/learn/${course.course.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="learner-course-card group"
    >
      <Link href={href} className="learner-course-card__link">
        <div className="learner-course-card__thumb">
          {course.course.thumbnailUrl ? (
            <Image
              src={course.course.thumbnailUrl}
              alt=""
              fill
              className="object-cover transition duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 33vw"
              unoptimized={course.course.thumbnailUrl.startsWith("/content/")}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-100">
              <BookOpen className="h-10 w-10 text-gray-300" />
            </div>
          )}
          <div className="learner-course-card__thumb-overlay" />
          <span className="learner-course-card__pct">{course.progressPct}%</span>
        </div>

        <div className="learner-course-card__content">
          <h3 className="learner-course-card__title">{course.course.title}</h3>
          <p className="learner-course-card__instructor">{course.course.instructor.fullName}</p>
          <ProgressBar value={course.progressPct} className="mt-3" showMarks />
          <p className="mt-2 text-xs text-gray-500">
            {course.completedLessons} of {course.totalLessons} lessons
          </p>
          <span className="learner-course-card__resume">
            Continue
            <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
