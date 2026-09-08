import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { MediaCard } from "@/components/shared/MediaCard";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { HomeCatalogRail } from "@/components/home/HomeCatalogRail";
import { HomeProgramCard } from "@/components/home/HomeProgramCard";
import { Reveal } from "@/components/motion/Reveal";
import { getOrganizationPublic } from "@/lib/actions/organizations";
import { formatDate } from "@/lib/utils";
import { GraduationCap, CalendarClock, MapPin, Rocket } from "lucide-react";

const EVENT_TYPE_LABEL: Record<string, string> = {
  WORKSHOP: "Workshop",
  ONLINE_SESSION: "Online session",
  OTHER: "Event",
};

export default async function OrganizationPublicPage({ params }: { params: { slug: string } }) {
  const org = await getOrganizationPublic(params.slug);
  if (!org) notFound();

  const activePrograms = org.programs.length;
  const upcomingEvents = org.events.length;

  return (
    <div className="learner-canvas px-4 py-6 sm:px-6 lg:px-8">
      <LearnerPageHero
        banner="organizations"
        eyebrow={org.type.charAt(0) + org.type.slice(1).toLowerCase().replace("_", " ")}
        title={org.name}
        subtitle={`${org._count.members.toLocaleString()} member${org._count.members !== 1 ? "s" : ""} · ${org.courses.length} course${org.courses.length !== 1 ? "s" : ""} · ${activePrograms} active program${activePrograms !== 1 ? "s" : ""}`}
      >
        {org.isVerified && (
          <Badge variant="outline" className="mt-2 border-0 bg-white/20 text-white shadow-none backdrop-blur-none">
            Verified partner
          </Badge>
        )}
      </LearnerPageHero>

      <div className="mx-auto mt-6 max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <p className="org-pulse-strip">
            <span className="org-pulse-strip__dot" aria-hidden />
            {activePrograms > 0 || upcomingEvents > 0
              ? "Active right now"
              : "Quiet for now — check back soon"}
          </p>
          <Button asChild variant="outline" size="sm">
            <Link href={`/org/${org.slug}/dashboard`}>Organization portal</Link>
          </Button>
        </div>

        {/* Upcoming events */}
        <Reveal className="mb-8">
          <section className="home-rail">
            <div className="home-rail__header">
              <div className="home-rail__copy">
                <h2 className="home-trending-rail__title">
                  <span className="home-trending-rail__live" aria-hidden />
                  Upcoming events
                </h2>
                <p className="home-rail__desc">
                  Workshops and sessions hosted by {org.name}.
                </p>
              </div>
            </div>

            {org.events.length > 0 ? (
              <div className="home-rail-grid">
                {org.events.map((e) => (
                  <Link
                    key={e.id}
                    href={`/programs/${e.program.slug}`}
                    className="org-event-card group"
                  >
                    <span className="org-event-card__type">{EVENT_TYPE_LABEL[e.type] ?? "Event"}</span>
                    <h3 className="org-event-card__title">{e.title}</h3>
                    <p className="org-event-card__meta">
                      <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                      {formatDate(e.startAt)}
                    </p>
                    {e.location && (
                      <p className="org-event-card__meta">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {e.location}
                      </p>
                    )}
                    <span className="org-event-card__program">Part of {e.program.title}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarClock className="h-8 w-8" />}
                title="No upcoming events"
                description={`${org.name} has no scheduled workshops or sessions right now.`}
              />
            )}
          </section>
        </Reveal>

        {/* Active programs */}
        <Reveal className="mb-8" delay={0.05}>
          {org.programs.length > 0 ? (
            <HomeCatalogRail
              title="Active programs"
              description={`Cohort-based bootcamps and programs run by ${org.name}.`}
              layout="grid"
            >
              {org.programs.map((p) => (
                <HomeProgramCard
                  key={p.id}
                  slug={p.slug}
                  title={p.title}
                  type={p.type}
                  thumbnailUrl={p.thumbnailUrl}
                  startDate={p.startDate ? formatDate(p.startDate) : null}
                  format={p.format}
                  enrolledCount={p.enrolledCount}
                  seats={p.seats}
                />
              ))}
            </HomeCatalogRail>
          ) : (
            <section className="home-rail">
              <div className="home-rail__header">
                <div className="home-rail__copy">
                  <h2 className="home-rail__title">Active programs</h2>
                </div>
              </div>
              <EmptyState
                icon={<Rocket className="h-8 w-8" />}
                title="No active programs"
                description={`${org.name} isn't running any bootcamps or programs right now.`}
              />
            </section>
          )}
        </Reveal>

        {/* Courses offered */}
        <Reveal delay={0.1}>
          <section className="home-rail">
            <div className="home-rail__header">
              <div className="home-rail__copy">
                <h2 className="home-rail__title">Courses offered by {org.name}</h2>
              </div>
            </div>

            {org.courses.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {org.courses.map((c) => (
                  <MediaCard
                    key={c.slug}
                    href={`/courses/${c.slug}`}
                    title={c.title}
                    subtitle={c.subtitle ?? undefined}
                    image={
                      c.thumbnailUrl ? (
                        <OptimizedImage src={c.thumbnailUrl} alt={c.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-brand-light">
                          <GraduationCap className="h-8 w-8 text-brand/40" />
                        </div>
                      )
                    }
                    badges={
                      <>
                        <Badge variant="outline" size="sm" className="bg-white/95 capitalize backdrop-blur-sm">
                          {c.level.toLowerCase()}
                        </Badge>
                        {c.isFree && (
                          <Badge variant="success" size="sm">
                            Free
                          </Badge>
                        )}
                      </>
                    }
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<GraduationCap className="h-8 w-8" />}
                title="No courses yet"
                description={`${org.name} hasn't published any courses on the platform yet.`}
              />
            )}
          </section>
        </Reveal>
      </div>
    </div>
  );
}
