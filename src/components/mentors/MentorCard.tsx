import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { cn } from "@/lib/utils";
import type { SerializedMentor } from "@/lib/actions/mentors";

const MENTOR_TYPE_LABEL: Record<string, string> = {
  ACADEMIC: "Academic",
  INDUSTRY: "Industry",
  INNOVATION: "Innovation",
  GENERAL: "",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * A mentor is a person, so the card leads with a square portrait rather than
 * the 16:9 crop used for course thumbnails — a widescreen crop of a headshot
 * slices off the top of the head or the chin and reads as a mistake.
 *
 * Content is ordered the way someone actually evaluates a mentor: who they
 * are, what they do, what they know, then the social proof. Everything sits
 * on one baseline grid so a row of cards lines up even when the underlying
 * records are uneven.
 */
export function MentorCard({
  mentor,
  variant = "grid",
}: {
  mentor: SerializedMentor;
  /** `compact` trims the card for dense rails. */
  variant?: "grid" | "compact";
}) {
  const tags = mentor.expertiseTags.slice(0, variant === "compact" ? 2 : 3);
  const typeLabel = MENTOR_TYPE_LABEL[mentor.mentorType ?? "GENERAL"];
  const role = [mentor.title, mentor.company].filter(Boolean).join(" · ");
  const place = [mentor.city, mentor.country].filter(Boolean).join(", ");
  const hasRating = mentor.averageRating != null && mentor.ratingCount > 0;

  return (
    <Link
      href={`/mentors/${mentor.slug}`}
      className={cn("mentor-card group", variant === "compact" && "mentor-card--compact")}
    >
      <div className="mentor-card__head">
        <span className="mentor-card__portrait">
          {mentor.avatarUrl ? (
            <OptimizedImage
              src={mentor.avatarUrl}
              alt=""
              fill
              className="mentor-card__img"
              sizes="96px"
            />
          ) : (
            <span className="mentor-card__monogram" aria-hidden>
              {initials(mentor.displayName)}
            </span>
          )}
        </span>

        <span className="mentor-card__identity">
          <span className="mentor-card__name">
            {mentor.displayName}
            {mentor.isFeatured && (
              <BadgeCheck
                className="mentor-card__verified"
                aria-label="Featured mentor"
              />
            )}
          </span>
          {role && <span className="mentor-card__role">{role}</span>}
          {place && (
            <span className="mentor-card__place">
              <MapPin className="h-3 w-3 shrink-0" aria-hidden />
              {place}
            </span>
          )}
        </span>
      </div>

      {mentor.hook && <p className="mentor-card__hook">{mentor.hook}</p>}

      {tags.length > 0 && (
        <ul className="mentor-card__tags">
          {tags.map((t) => (
            <li key={t} className="mentor-card__tag">
              {t}
            </li>
          ))}
        </ul>
      )}

      <div className="mentor-card__foot">
        <span className="mentor-card__stats">
          {hasRating && (
            <span className="mentor-card__stat">
              <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
              {mentor.averageRating!.toFixed(1)}
              <span className="mentor-card__stat-sub">({mentor.ratingCount})</span>
            </span>
          )}
          {mentor.yearsExperience > 0 && (
            <span className="mentor-card__stat mentor-card__stat--quiet">
              {mentor.yearsExperience}+ yrs
            </span>
          )}
          {typeLabel && (
            <span className="mentor-card__stat mentor-card__stat--quiet">
              {typeLabel}
            </span>
          )}
        </span>

        {mentor.isAcceptingRequests && (
          <span className="mentor-card__open">
            <span className="mentor-card__open-dot" aria-hidden />
            Open
          </span>
        )}
      </div>
    </Link>
  );
}
