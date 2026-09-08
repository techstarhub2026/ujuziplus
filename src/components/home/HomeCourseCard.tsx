import Image from "next/image";
import Link from "next/link";
import { Clock, User } from "lucide-react";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop";

export function HomeCourseCard({
  slug,
  title,
  thumbnailUrl,
  instructorName,
  durationHours,
  level,
  category,
  isFree,
}: {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  instructorName: string;
  durationHours: number;
  level: string;
  category: string | null;
  isFree: boolean;
  /** @deprecated the trending variant's bespoke motion was removed. */
  variant?: "default" | "trending";
}) {
  const src = thumbnailUrl || PLACEHOLDER;

  return (
    <Link href={`/courses/${slug}`} className="home-course-card group">
      <div className="home-course-card__media">
        <Image
          src={src}
          alt=""
          fill
          className="object-cover"
          sizes="280px"
          unoptimized={src.startsWith("/content/")}
        />
        {category && (
          <span className="home-course-card__category">{category}</span>
        )}
        {isFree && <span className="home-course-card__free">Free</span>}
      </div>
      <div className="home-course-card__body">
        <h3 className="home-course-card__title">{title}</h3>
        <p className="home-course-card__instructor">
          <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {instructorName}
        </p>
        <p className="home-course-card__meta">
          <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {durationHours}h · <span className="capitalize">{level.toLowerCase()}</span>
        </p>
      </div>
    </Link>
  );
}
