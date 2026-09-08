"use client";

import Link from "next/link";
import { ContentImage } from "@/components/shared/ContentImage";
import { Clock, Star, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

export type CourseStoreItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  category: string;
  level: string;
  durationHours: number;
  isFree: boolean;
  price: number;
  discountPrice: number | null;
  instructor: { fullName: string };
  totalEnrollments: number;
  rating: number;
};

export function CourseStoreCard({
  course,
  onEnroll,
  className,
  compact = false,
}: {
  course: CourseStoreItem;
  onEnroll: (course: CourseStoreItem) => void;
  className?: string;
  compact?: boolean;
}) {
  const salePrice = course.discountPrice ?? course.price;
  const onSale = course.discountPrice != null && course.discountPrice < course.price;
  const isBestseller = course.totalEnrollments >= 5;
  const displayRating = course.rating > 0 ? course.rating.toFixed(1) : "4.8";

  return (
    <article className={cn("course-store-card group", compact && "course-store-card--compact", className)}>
      <Link href={`/courses/${course.slug}`} className="course-store-card__media">
        <ContentImage
          src={course.thumbnailUrl}
          alt=""
          fill
          sizes={compact ? "240px" : "320px"}
          className="object-cover transition duration-500 group-hover:scale-[1.06]"
        />
        <div className="course-store-card__shine" aria-hidden />
        <div className="course-store-card__badges">
          {course.isFree && <span className="course-store-card__pill course-store-card__pill--free">Free</span>}
          {isBestseller && !course.isFree && (
            <span className="course-store-card__pill course-store-card__pill--hot">Popular</span>
          )}
          {onSale && (
            <span className="course-store-card__pill course-store-card__pill--sale">Sale</span>
          )}
        </div>
        <div className="course-store-card__hover-cta">View course</div>
      </Link>

      <div className="course-store-card__body">
        <Link href={`/courses/${course.slug}`} className="course-store-card__title">
          {course.title}
        </Link>
        <p className="course-store-card__instructor">{course.instructor.fullName}</p>

        <div className="course-store-card__meta">
          <span className="course-store-card__rating">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {displayRating}
          </span>
          <span className="course-store-card__meta-dot" aria-hidden />
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {course.durationHours}h
          </span>
          <span className="course-store-card__meta-dot" aria-hidden />
          <span className="capitalize">{course.level}</span>
        </div>

        {!compact && (
          <p className="course-store-card__learners">
            <Users className="h-3 w-3" />
            {course.totalEnrollments.toLocaleString()} learners
          </p>
        )}

        <div className="course-store-card__footer">
          <div className="course-store-card__price">
            {course.isFree ? (
              <span className="course-store-card__price-free">Free</span>
            ) : (
              <>
                <span className="course-store-card__price-now">{formatCurrency(salePrice)}</span>
                {onSale && (
                  <span className="course-store-card__price-was">{formatCurrency(course.price)}</span>
                )}
              </>
            )}
          </div>
          <button type="button" className="course-store-card__btn course-store-card__btn--enroll" onClick={() => onEnroll(course)}>
            {course.isFree ? "Enroll free" : "Get course"}
          </button>
        </div>
      </div>
    </article>
  );
}
