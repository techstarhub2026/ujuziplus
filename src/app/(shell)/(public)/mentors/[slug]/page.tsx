import { notFound } from "next/navigation";
import Link from "next/link";
import { getMentorDetailBySlug } from "@/lib/actions/mentors";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MentorRequestForm } from "@/components/mentors/MentorRequestForm";
import { MentorBookSessionForm } from "@/components/mentors/MentorBookSessionForm";
import { MentorGroupSessions } from "@/components/mentors/MentorGroupSessions";
import { DAY_LABELS } from "@/lib/mentors/tracks";
import {
  MapPin, ExternalLink, Github, Linkedin,
  Star, Calendar, BookOpen, Briefcase, FlaskConical,
} from "lucide-react";
import { OptimizedImage } from "@/components/shared/OptimizedImage";
import { getAuthSession } from "@/lib/auth-server";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface Props {
  params: { slug: string };
}

const MENTOR_TYPE_CONFIG = {
  ACADEMIC: {
    label: "Academic mentor",
    icon: <BookOpen className="h-3.5 w-3.5" />,
    className: "bg-blue-100 text-blue-700 border-blue-200",
  },
  INDUSTRY: {
    label: "Industry mentor",
    icon: <Briefcase className="h-3.5 w-3.5" />,
    className: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  INNOVATION: {
    label: "Innovation mentor",
    icon: <FlaskConical className="h-3.5 w-3.5" />,
    className: "bg-violet-100 text-violet-700 border-violet-200",
  },
  GENERAL: null,
};

export default async function MentorProfilePage({ params }: Props) {
  const [session, mentor] = await Promise.all([
    getAuthSession(),
    getMentorDetailBySlug(params.slug).catch(() => null),
  ]);
  if (!mentor) notFound();

  const typeConfig = MENTOR_TYPE_CONFIG[(mentor.mentorType ?? "GENERAL") as keyof typeof MENTOR_TYPE_CONFIG] ?? null;

  return (
    <div className="learner-canvas">
      <header className="mentor-profile-hero">
        <div className="mentor-profile-hero__inner">
          <Breadcrumbs
            theme="dark"
            className="mb-6"
            items={[{ label: "Mentors", href: "/mentors" }, { label: mentor.displayName }]}
          />
          <div className="mentor-profile-hero__row">
            <Avatar
              src={mentor.avatarUrl}
              alt={mentor.displayName}
              size="2xl"
              ring
              ringTone="dark"
            />
            <div className="mentor-profile-hero__info">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="mentor-profile-hero__name">{mentor.displayName}</h1>
                {typeConfig && (
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeConfig.className}`}>
                    {typeConfig.icon}{typeConfig.label}
                  </span>
                )}
              </div>
              <p className="mentor-profile-hero__role">
                {mentor.title}
                {mentor.company ? ` · ${mentor.company}` : ""}
              </p>
              {(mentor.city || mentor.country) && (
                <p className="mentor-profile-hero__location">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {[mentor.city, mentor.country].filter(Boolean).join(", ")}
                </p>
              )}

              {/* Star rating */}
              {mentor.ratingCount > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star
                        key={s}
                        className={`h-4 w-4 ${s <= Math.round(mentor.averageRating ?? 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-amber-600">
                    {mentor.averageRating?.toFixed(1)}
                  </span>
                  <span className="text-xs text-white/70">
                    ({mentor.ratingCount} {mentor.ratingCount === 1 ? "rating" : "ratings"})
                  </span>
                </div>
              )}

              <div className="mentor-profile-hero__tracks">
                {mentor.tracks.slice(0, 4).map((t) => (
                  <Badge key={t} className="mentor-profile-hero__track">
                    {t}
                  </Badge>
                ))}
              </div>
              {mentor.isAcceptingRequests && (
                <span className="mentor-profile-hero__status">Accepting requests</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            {mentor.quote && (
              <blockquote className="mentor-profile-quote">{mentor.quote}</blockquote>
            )}
            {mentor.bio && (
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold mb-3">About</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{mentor.bio}</p>
              </Card>
            )}

            {mentor.learningPath.length > 0 && (
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold mb-1">
                  Learning path from {mentor.displayName.split(" ")[0]}
                </h2>
                <p className="text-sm text-gray-500 mb-4">Follow these UjuziLab resources in order.</p>
                <ol className="mentor-learning-path">
                  {mentor.learningPath.map((step, i) => (
                    <li key={i}>
                      <span className="mentor-learning-path__step">{i + 1}</span>
                      <div>
                        <Link href={step.href} className="font-medium text-brand hover:underline">
                          {step.title}
                        </Link>
                        {step.note && <p className="text-sm text-gray-500 mt-0.5">{step.note}</p>}
                      </div>
                    </li>
                  ))}
                </ol>
              </Card>
            )}

            {(mentor.recommendedCourses.length > 0 || mentor.recommendedKits.length > 0) && (
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold mb-4">Recommended resources</h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {mentor.recommendedCourses.map((c) => (
                    <Link key={c.id} href={`/courses/${c.slug}`} className="mentor-resource-link">
                      {c.thumbnailUrl && (
                        <div className="relative h-24 w-full rounded-lg overflow-hidden">
                          <OptimizedImage src={c.thumbnailUrl} alt="" fill sizes="200px" />
                        </div>
                      )}
                      <span className="text-sm font-medium mt-2 block">{c.title}</span>
                      <span className="text-xs text-gray-400">Course</span>
                    </Link>
                  ))}
                  {mentor.recommendedKits.map((k) => (
                    <Link key={k.id} href={`/kits/${k.slug}`} className="mentor-resource-link">
                      {k.thumbnailUrl && (
                        <div className="relative h-24 w-full rounded-lg overflow-hidden">
                          <OptimizedImage src={k.thumbnailUrl} alt="" fill sizes="200px" />
                        </div>
                      )}
                      <span className="text-sm font-medium mt-2 block">{k.title}</span>
                      <span className="text-xs text-gray-400">Kit</span>
                    </Link>
                  ))}
                </div>
              </Card>
            )}

            {mentor.officeHours.length > 0 && (
              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold mb-3">Office hours</h2>
                {mentor.officeHoursNote && (
                  <p className="text-sm text-gray-500 mb-3">{mentor.officeHoursNote}</p>
                )}
                <ul className="space-y-2">
                  {mentor.officeHours.map((h) => (
                    <li key={h.id} className="flex justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
                      <span className="font-medium">{h.title}</span>
                      <span className="text-gray-500">
                        {DAY_LABELS[h.dayOfWeek]} {h.startTime}–{h.endTime} EAT
                      </span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <MentorGroupSessions
              sessions={mentor.groupSessions}
              isAuthenticated={!!session?.user}
              mentorSlug={mentor.slug}
            />
          </div>

          <aside className="space-y-6" id="book">
            {/* Prominent booking CTA */}
            {mentor.bookingUrl && (
              <Card className="p-5 border-2 border-brand/30 bg-gradient-to-br from-brand/5 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-brand" />
                  <h3 className="font-semibold text-gray-900">Book a time</h3>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Use {mentor.displayName.split(" ")[0]}&apos;s external booking calendar to schedule a session directly at a time that works for both of you.
                </p>
                <Button asChild className="w-full gap-2">
                  <a href={mentor.bookingUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    Open booking calendar
                  </a>
                </Button>
                <p className="mt-2 text-xs text-center text-gray-400">Opens in Calendly / Google Calendar or {mentor.displayName.split(" ")[0]}&apos;s preferred tool</p>
              </Card>
            )}

            <Card className="p-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {mentor.expertiseTags.map((t) => (
                  <Badge key={t} variant="outline">{t}</Badge>
                ))}
              </div>
              <dl className="text-sm space-y-2 text-gray-600">
                {mentor.yearsExperience > 0 && (
                  <div className="flex justify-between">
                    <dt>Experience</dt>
                    <dd className="font-medium">{mentor.yearsExperience}+ years</dd>
                  </div>
                )}
                {mentor.ratingCount > 0 && (
                  <div className="flex justify-between">
                    <dt>Rating</dt>
                    <dd className="flex items-center gap-1 font-medium text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      {mentor.averageRating?.toFixed(1)} / 5
                      <span className="text-gray-400 font-normal text-xs">({mentor.ratingCount})</span>
                    </dd>
                  </div>
                )}
                {mentor.languages.length > 0 && (
                  <div className="flex justify-between">
                    <dt>Languages</dt>
                    <dd className="font-medium">{mentor.languages.join(", ")}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-4 flex gap-3">
                {mentor.linkedin && (
                  <a href={mentor.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {mentor.github && (
                  <a href={mentor.github} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-brand">
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </Card>

            {mentor.isAcceptingRequests && (
              <MentorRequestForm
                mentorSlug={mentor.slug}
                mentorName={mentor.displayName}
                isAuthenticated={!!session?.user}
              />
            )}

            <MentorBookSessionForm
              mentorSlug={mentor.slug}
              mentorName={mentor.displayName}
              isAuthenticated={!!session?.user}
            />

            <Card className="p-4 text-center text-sm">
              <Link href="/dashboard/community/mentorship" className="text-brand font-medium hover:underline">
                Join #mentorship community →
              </Link>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}
