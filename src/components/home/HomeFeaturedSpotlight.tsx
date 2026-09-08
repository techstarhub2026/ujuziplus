import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Play, Package, Rocket } from "lucide-react";
import { SciFiHeading } from "@/components/home/SciFiHeading";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=700&fit=crop";

type SpotlightCourse = {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  instructorName: string;
  durationHours: number;
  level: string;
  category: string | null;
  isFree: boolean;
};

type SpotlightProgram = {
  slug: string;
  title: string;
  type: string;
  startDate: string | null;
};

type SpotlightKit = {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  category: string | null;
};

export function HomeFeaturedSpotlight({
  course,
  program,
  kit,
}: {
  course: SpotlightCourse | null;
  program: SpotlightProgram | null;
  kit: SpotlightKit | null;
}) {
  if (!course && !program && !kit) return null;

  return (
    <section className="home-spotlight" aria-label="Featured learning paths">
      <div className="home-spotlight__head">
        <div>
          <p className="home-spotlight__eyebrow">Start here</p>
          <h2 className="home-spotlight__title">
            <SciFiHeading text="Featured picks for new learners" />
          </h2>
        </div>
        <Link href="/courses" className="home-spotlight__link">
          Browse catalog
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="home-spotlight__grid">
        {course && (
          <Link href={`/courses/${course.slug}`} className="home-spotlight__hero group">
            <Image
              src={course.thumbnailUrl || PLACEHOLDER}
              alt=""
              fill
              className="object-cover transition duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
              unoptimized={(course.thumbnailUrl || PLACEHOLDER).startsWith("/content/")}
            />
            <div className="home-spotlight__hero-overlay" />
            <div className="home-spotlight__hero-content">
              {course.category && (
                <span className="home-spotlight__chip">{course.category}</span>
              )}
              <h3 className="home-spotlight__hero-title">{course.title}</h3>
              <p className="home-spotlight__hero-meta">
                {course.instructorName} · {course.durationHours}h ·{" "}
                <span className="capitalize">{course.level.toLowerCase()}</span>
              </p>
              <span className="home-spotlight__cta">
                <Play className="h-4 w-4" />
                {course.isFree ? "Start free" : "View course"}
              </span>
            </div>
          </Link>
        )}

        <div className="home-spotlight__stack">
          {program && (
            <Link href={`/programs/${program.slug}`} className="home-spotlight__side group">
              <span className="home-spotlight__side-icon home-spotlight__side-icon--program">
                <Rocket className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="home-spotlight__side-label">Bootcamp</span>
                <span className="home-spotlight__side-title">{program.title}</span>
                <span className="home-spotlight__side-meta">
                  {program.type} · {program.startDate ?? "Dates TBD"}
                </span>
              </span>
              <ArrowRight className="home-spotlight__side-arrow" />
            </Link>
          )}
          {kit && (
            <Link href={`/kits/${kit.slug}`} className="home-spotlight__side group">
              <span className="home-spotlight__side-icon home-spotlight__side-icon--kit">
                {kit.thumbnailUrl ? (
                  <Image
                    src={kit.thumbnailUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full object-cover"
                    unoptimized={kit.thumbnailUrl.startsWith("/content/")}
                  />
                ) : (
                  <Package className="h-5 w-5" />
                )}
              </span>
              <span className="min-w-0">
                <span className="home-spotlight__side-label">Learning kit</span>
                <span className="home-spotlight__side-title">{kit.title}</span>
                <span className="home-spotlight__side-meta">
                  {kit.category ?? "Hands-on hardware"}
                </span>
              </span>
              <ArrowRight className="home-spotlight__side-arrow" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
