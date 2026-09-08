import Link from "next/link";
import { Star, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MediaCard, MediaCardPrice } from "@/components/shared/MediaCard";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { formatCurrency } from "@/lib/utils";
import type { Course } from "@/types/app";

export function CourseCard({ course }: { course: Course }) {
  return (
    <MediaCard
      href={`/courses/${course.slug}`}
      title={course.title}
      subtitle={course.instructor.fullName}
      badges={
        <>
          {course.isFree && <Badge variant="success" size="sm">Free</Badge>}
          {course.discountPrice && (
            <Badge variant="warning" size="sm" className="bg-white/95 backdrop-blur-sm">
              Sale
            </Badge>
          )}
        </>
      }
      image={
        <OptimizedImage
          src={course.thumbnailUrl}
          alt={course.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
      }
      meta={
        <>
          <Badge variant="outline" size="sm">
            {course.category}
          </Badge>
          <span className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {course.rating}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {course.durationHours}h
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {course.totalEnrollments.toLocaleString()}
          </span>
        </>
      }
      footer={
        <div className="flex items-center justify-between">
          <Avatar src={course.instructor.avatarUrl} alt={course.instructor.fullName} size="sm" ring />
          <MediaCardPrice
            isFree={course.isFree}
            price={course.isFree ? undefined : formatCurrency(course.discountPrice ?? course.price)}
            originalPrice={
              course.discountPrice ? formatCurrency(course.price) : undefined
            }
          />
        </div>
      }
    />
  );
}
