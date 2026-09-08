"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MentorCohortCard } from "@/components/mentors/MentorCohortCard";
import { joinCohort as joinCohortAction } from "@/lib/actions/mentors";
import {
  MessageSquare, Calendar, Users, BookOpen,
  Star, Video, ExternalLink, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

type Request = {
  id: string;
  goal: string;
  message: string;
  status: string;
  mentorReply: string | null;
  createdAt: string;
  mentor: { id: string; slug: string; displayName: string; avatarUrl: string | null; title: string | null; company: string | null };
};

type Session = {
  id: string;
  type: string;
  status: string;
  topic: string | null;
  scheduledAt: string | null;
  durationMins: number;
  meetingUrl: string | null;
  mentor: { id: string; slug: string; displayName: string; avatarUrl: string | null };
  rating?: number | null;
};

type GroupSession = {
  id: string;
  title: string;
  scheduledAt: string;
  durationMins: number;
  meetingUrl: string | null;
  attendeeCount: number;
  mentor: { slug: string; displayName: string; avatarUrl: string | null };
};

type CohortMembership = {
  id: string;
  title: string;
  description: string | null;
  track: string;
  startsAt: string;
  endsAt: string | null;
  maxMembers: number;
  memberCount: number;
  mentor: { slug: string; displayName: string; avatarUrl: string | null };
};

interface Props {
  data: {
    requests: Request[];
    sessions: Session[];
    groupSessions: GroupSession[];
    cohorts: CohortMembership[];
  };
}

const STATUS_BADGE: Record<string, "default" | "warning" | "success" | "error" | "accent" | "outline"> = {
  PENDING: "warning",
  ACCEPTED: "success",
  DECLINED: "error",
  CLOSED: "outline",
  SCHEDULED: "accent",
  CONFIRMED: "success",
  COMPLETED: "outline",
  CANCELLED: "error",
  NO_SHOW: "error",
};

const TABS = [
  { id: "requests",  label: "Requests",      icon: <MessageSquare className="h-4 w-4" /> },
  { id: "sessions",  label: "Sessions",       icon: <Calendar className="h-4 w-4" /> },
  { id: "groups",    label: "Group sessions", icon: <Video className="h-4 w-4" /> },
  { id: "cohorts",   label: "My cohorts",     icon: <Users className="h-4 w-4" /> },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function DashboardMentorsContent({ data }: Props) {
  const [tab, setTab] = useState<TabId>("requests");

  const upcomingSessions = data.sessions.filter(
    (s) => s.status !== "COMPLETED" && s.status !== "CANCELLED" && s.status !== "NO_SHOW"
  );
  const pastSessions = data.sessions.filter(
    (s) => s.status === "COMPLETED" || s.status === "CANCELLED" || s.status === "NO_SHOW"
  );

  return (
    <div>
      {/* Summary stats */}
      {(data.requests.length > 0 || data.sessions.length > 0) && (
        <motion.div
          className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {[
            { label: "Requests", value: data.requests.length, icon: <MessageSquare className="h-4 w-4 text-brand" /> },
            { label: "Sessions", value: data.sessions.length, icon: <Calendar className="h-4 w-4 text-violet-500" /> },
            { label: "Group sessions", value: data.groupSessions.length, icon: <Video className="h-4 w-4 text-sky-500" /> },
            { label: "Cohorts", value: data.cohorts.length, icon: <Users className="h-4 w-4 text-emerald-500" /> },
          ].map((stat) => (
            <motion.div key={stat.label} variants={fadeUp}>
              <Card className="flex items-center gap-3 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                {stat.icon}
                <div>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-gray-200">
        {TABS.map((t) => {
          const count = t.id === "requests" ? data.requests.length
            : t.id === "sessions" ? data.sessions.length
            : t.id === "groups" ? data.groupSessions.length
            : data.cohorts.length;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition -mb-px",
                tab === t.id
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {t.icon} {t.label}
              {count > 0 && (
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  tab === t.id ? "bg-brand/10 text-brand" : "bg-gray-100 text-gray-500"
                )}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content with fade transition ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Requests */}
          {tab === "requests" && (
            <div className="mt-6 space-y-4">
              {data.requests.length === 0 ? (
                <EmptyState
                  icon={<MessageSquare className="h-8 w-8 text-gray-300" />}
                  title="No mentorship requests yet"
                  action={<Button asChild size="sm"><Link href="/mentors">Find a mentor</Link></Button>}
                />
              ) : (
                data.requests.map((r) => (
                  <Card key={r.id} className="p-4 transition-all duration-200 hover:shadow-md">
                    <div className="flex flex-wrap items-start gap-4">
                      <Avatar src={r.mentor.avatarUrl} alt={r.mentor.displayName} size="md" ring />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Link href={`/mentors/${r.mentor.slug}`} className="font-semibold hover:text-brand">
                            {r.mentor.displayName}
                          </Link>
                          {r.mentor.title && (
                            <span className="text-xs text-gray-400">{r.mentor.title}</span>
                          )}
                          <Badge variant={STATUS_BADGE[r.status] ?? "outline"} className="ml-auto">
                            {r.status.charAt(0) + r.status.slice(1).toLowerCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium text-gray-900">Goal: </span>{r.goal}
                        </p>
                        {r.mentorReply && (
                          <div className="rounded-xl bg-brand/5 border border-brand/10 px-3 py-2 text-sm text-gray-700">
                            <p className="text-xs font-semibold text-brand mb-1">{r.mentor.displayName} replied:</p>
                            {r.mentorReply}
                          </div>
                        )}
                        {r.status === "ACCEPTED" && (
                          <Button asChild size="sm" className="mt-3">
                            <Link href={`/mentors/${r.mentor.slug}#book`}>
                              <Calendar className="h-3.5 w-3.5 mr-1.5" />Book a session
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
              <div className="pt-2">
                <Button asChild variant="outline" size="sm">
                  <Link href="/mentors">
                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />Browse more mentors
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* Sessions */}
          {tab === "sessions" && (
            <div className="mt-6 space-y-6">
              {data.sessions.length === 0 ? (
                <EmptyState
                  icon={<Calendar className="h-8 w-8 text-gray-300" />}
                  title="No sessions booked yet"
                  action={<Button asChild size="sm"><Link href="/mentors">Book a session</Link></Button>}
                />
              ) : (
                <>
                  {upcomingSessions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Upcoming</h3>
                      <div className="space-y-3">
                        {upcomingSessions.map((s) => (
                          <SessionCard key={s.id} session={s} />
                        ))}
                      </div>
                    </div>
                  )}
                  {pastSessions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 mb-3">Past sessions</h3>
                      <div className="space-y-3">
                        {pastSessions.map((s) => (
                          <SessionCard key={s.id} session={s} past />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Group sessions */}
          {tab === "groups" && (
            <div className="mt-6 space-y-4">
              {data.groupSessions.length === 0 ? (
                <EmptyState
                  icon={<Video className="h-8 w-8 text-gray-300" />}
                  title="No group sessions joined yet"
                  description="RSVP to live sessions from mentor profile pages."
                  action={<Button asChild size="sm"><Link href="/mentors">Browse mentors</Link></Button>}
                />
              ) : (
                data.groupSessions.map((s) => (
                  <Card key={s.id} className="p-4 flex flex-wrap items-center gap-4 transition-all duration-200 hover:shadow-md">
                    <Avatar src={s.mentor.avatarUrl} alt={s.mentor.displayName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{s.title}</p>
                      <p className="text-xs text-gray-500">
                        with{" "}
                        <Link href={`/mentors/${s.mentor.slug}`} className="text-brand">
                          {s.mentor.displayName}
                        </Link>
                        {" · "}
                        {new Date(s.scheduledAt).toLocaleString("en-TZ", { timeZone: "Africa/Dar_es_Salaam", dateStyle: "medium", timeStyle: "short" })} EAT
                        {" · "}{s.durationMins} min
                        {" · "}{s.attendeeCount} attendees
                      </p>
                    </div>
                    {s.meetingUrl && (
                      <Button asChild size="sm" variant="outline">
                        <a href={s.meetingUrl} target="_blank" rel="noopener noreferrer">
                          <Video className="h-3.5 w-3.5 mr-1.5" />Join
                        </a>
                      </Button>
                    )}
                  </Card>
                ))
              )}
            </div>
          )}

          {/* Cohorts */}
          {tab === "cohorts" && (
            <div className="mt-6">
              {data.cohorts.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-8 w-8 text-gray-300" />}
                  title="You haven't joined any cohorts yet"
                  description="Cohorts are structured mentorship groups by track. Join one to learn collaboratively with peers guided by a mentor."
                  action={<Button asChild size="sm"><Link href="/mentors#cohorts">Browse open cohorts</Link></Button>}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {data.cohorts.map((c) => (
                    <MentorCohortCard
                      key={c.id}
                      cohort={c}
                      isJoined
                      isAuthenticated
                      onJoin={joinCohortAction}
                    />
                  ))}
                </div>
              )}
              <div className="mt-6">
                <Button asChild variant="outline" size="sm">
                  <Link href="/mentors#cohorts">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />Find more cohorts
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SessionCard({ session, past }: { session: Session; past?: boolean }) {
  const scheduled = session.scheduledAt
    ? new Date(session.scheduledAt).toLocaleString("en-TZ", {
        timeZone: "Africa/Dar_es_Salaam",
        weekday: "short", month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : null;

  return (
    <Card className={cn("p-4", past && "opacity-75")}>
      <div className="flex flex-wrap justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Avatar src={session.mentor.avatarUrl} alt={session.mentor.displayName} size="sm" />
          <div>
            <Link href={`/dashboard/mentors/sessions/${session.id}`} className="font-semibold text-sm hover:text-brand">
              {session.topic ?? "Mentorship session"}
            </Link>
            <p className="text-xs text-gray-500">
              with <Link href={`/mentors/${session.mentor.slug}`} className="text-brand">{session.mentor.displayName}</Link>
            </p>
          </div>
        </div>
        <Badge variant={STATUS_BADGE[session.status] ?? "outline"}>
          {session.status.charAt(0) + session.status.slice(1).toLowerCase().replace("_", "-")}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
        {scheduled && (
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />{scheduled} EAT
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />{session.durationMins} min
        </span>
        {session.rating && (
          <span className="flex items-center gap-1 text-amber-500">
            <Star className="h-3 w-3 fill-amber-400" />{session.rating}/5 rated
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {session.meetingUrl && session.status !== "COMPLETED" && (
          <Button asChild size="sm" variant="outline">
            <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
              <Video className="h-3.5 w-3.5 mr-1.5" />Join meeting
            </a>
          </Button>
        )}
        <Button asChild size="sm" variant="ghost">
          <Link href={`/dashboard/mentors/sessions/${session.id}`}>
            View details →
          </Link>
        </Button>
      </div>
    </Card>
  );
}

function EmptyState({
  icon, title, description, action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <Card className="py-16 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="font-medium text-gray-600 mb-1">{title}</p>
      {description && <p className="text-sm text-gray-400 mb-4 max-w-sm mx-auto">{description}</p>}
      {action && <div className="flex justify-center">{action}</div>}
    </Card>
  );
}
