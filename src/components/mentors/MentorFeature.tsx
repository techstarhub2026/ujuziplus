import Link from "next/link";
import { ArrowRight, BadgeCheck, MapPin, Star } from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { cn } from "@/lib/utils";
import type { SerializedMentor } from "@/lib/actions/mentors";

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * The featured-mentor treatment, shared by the homepage mentor section and
 * the mentors index so the two never drift apart.
 *
 * It replaces a dark gradient panel with glow orbs and a serif pull-quote.
 * That panel had the visual weight of a hero but the content of a business
 * card — name, role, two tags — and sat on a light page in a completely
 * different palette. This version stays on the page's own surface, gives the
 * mentor's own words room, and puts the facts a reader actually weighs
 * (rating, learners helped, experience, location) into a scannable list.
 */
export function MentorFeature({
  mentor,
  className,
}: {
  mentor: SerializedMentor;
  className?: string;
}) {
  const role = [mentor.title, mentor.company].filter(Boolean).join(" · ");
  const place = [mentor.city, mentor.country].filter(Boolean).join(", ");
  const tags = mentor.expertiseTags.slice(0, 4);
  const hasRating = mentor.averageRating != null && mentor.ratingCount > 0;
  const blurb = mentor.quote || mentor.hook || mentor.bio;

  return (
    <article className={cn("mentor-lead", className)}>
      <Link
        href={`/mentors/${mentor.slug}`}
        className="mentor-lead__portrait"
        tabIndex={-1}
        aria-hidden
      >
        {mentor.avatarUrl ? (
          <OptimizedImage
            src={mentor.avatarUrl}
            alt=""
            fill
            className="mentor-lead__img"
            sizes="(max-width: 900px) 100vw, 260px"
          />
        ) : (
          <span className="mentor-lead__monogram">
            {initials(mentor.displayName)}
          </span>
        )}
      </Link>

      <div className="mentor-lead__body">
        <p className="mentor-lead__eyebrow">Featured mentor</p>

        <h3 className="mentor-lead__name">
          <Link href={`/mentors/${mentor.slug}`} className="mentor-lead__name-link">
            {mentor.displayName}
          </Link>
          {mentor.isFeatured && (
            <BadgeCheck className="mentor-lead__verified" aria-label="Verified" />
          )}
        </h3>

        {role && <p className="mentor-lead__role">{role}</p>}

        {blurb && <p className="mentor-lead__blurb">{blurb}</p>}

        {tags.length > 0 && (
          <ul className="mentor-lead__tags">
            {tags.map((t) => (
              <li key={t} className="mentor-lead__tag">
                {t}
              </li>
            ))}
          </ul>
        )}

        <dl className="mentor-lead__facts">
          {hasRating && (
            <div className="mentor-lead__fact">
              <dt>Rating</dt>
              <dd>
                <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
                {mentor.averageRating!.toFixed(1)}
                <span className="mentor-lead__fact-sub">({mentor.ratingCount})</span>
              </dd>
            </div>
          )}
          {mentor.studentsHelped > 0 && (
            <div className="mentor-lead__fact">
              <dt>Learners helped</dt>
              <dd>{mentor.studentsHelped.toLocaleString()}</dd>
            </div>
          )}
          {mentor.yearsExperience > 0 && (
            <div className="mentor-lead__fact">
              <dt>Experience</dt>
              <dd>{mentor.yearsExperience}+ years</dd>
            </div>
          )}
          {place && (
            <div className="mentor-lead__fact">
              <dt>Based in</dt>
              <dd>
                <MapPin className="h-3.5 w-3.5" aria-hidden />
                {place}
              </dd>
            </div>
          )}
        </dl>

        <div className="mentor-lead__actions">
          <Link href={`/mentors/${mentor.slug}`} className="mentor-lead__cta">
            View profile
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          {mentor.isAcceptingRequests && (
            <span className="mentor-lead__open">
              <span className="mentor-lead__open-dot" aria-hidden />
              Accepting requests
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
