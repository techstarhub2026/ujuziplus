import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { getLearnerMentorSession, rateSession } from "@/lib/actions/mentors";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SessionRatingForm } from "@/components/mentors/SessionRatingForm";
import {
  ArrowLeft, Calendar, Clock, Video, FileText,
  CheckCircle, Star, MapPin, ExternalLink,
} from "lucide-react";

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  REQUESTED:  { label: "Requested",  color: "bg-gray-100 text-gray-600" },
  SCHEDULED:  { label: "Scheduled",  color: "bg-blue-100 text-blue-700" },
  CONFIRMED:  { label: "Confirmed",  color: "bg-brand/10 text-brand" },
  COMPLETED:  { label: "Completed",  color: "bg-green-100 text-green-700" },
  CANCELLED:  { label: "Cancelled",  color: "bg-red-100 text-red-600" },
  NO_SHOW:    { label: "No-show",    color: "bg-amber-100 text-amber-700" },
};

const TYPE_LABEL: Record<string, string> = {
  INTRO_CALL:    "Intro call",
  GUIDANCE:      "Guidance",
  OFFICE_HOURS:  "Office hours",
  GROUP_SESSION: "Group session",
};

export default async function MentorSessionPage({
  params,
}: {
  params: { sessionId: string };
}) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect(`/auth/login?callbackUrl=/dashboard/mentors/sessions/${params.sessionId}`);
  }

  const mentorSession = await getLearnerMentorSession(params.sessionId, session.user.id);
  if (!mentorSession) notFound();

  const scheduled = mentorSession.scheduledAt
    ? new Date(mentorSession.scheduledAt).toLocaleString("en-TZ", {
        timeZone: "Africa/Dar_es_Salaam",
        weekday: "long", year: "numeric", month: "long",
        day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : null;

  const statusInfo = STATUS_LABEL[mentorSession.status] ?? { label: mentorSession.status, color: "bg-gray-100 text-gray-600" };
  const isCompleted = mentorSession.status === "COMPLETED";
  const isRated = !!mentorSession.rating;

  async function handleRate(sessionId: string, rating: number, feedback: string) {
    "use server";
    return rateSession(sessionId, rating, feedback);
  }

  return (
    <div className="learner-canvas mx-auto max-w-3xl px-4 py-6 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
        <Link href="/dashboard/mentors">
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Back to mentors
        </Link>
      </Button>

      <LearnerPageHero
        banner="dashboard"
        title={mentorSession.topic ?? "Mentorship session"}
        subtitle={`with ${mentorSession.mentor.displayName}`}
      />

      {/* Status banner */}
      <div className={`mt-6 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${statusInfo.color}`}>
        {isCompleted
          ? <CheckCircle className="h-4 w-4 shrink-0" />
          : <Calendar className="h-4 w-4 shrink-0" />}
        {statusInfo.label}
        {isCompleted && isRated && (
          <span className="ml-auto flex items-center gap-1 text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            Rated
          </span>
        )}
      </div>

      <Card className="mt-6 p-6 space-y-6">
        {/* Mentor */}
        <div className="flex flex-wrap items-start gap-4">
          <Avatar src={mentorSession.mentor.avatarUrl} alt={mentorSession.mentor.displayName} size="lg" ring />
          <div className="flex-1 min-w-0">
            <Link href={`/mentors/${mentorSession.mentor.slug}`} className="font-semibold text-lg hover:text-brand">
              {mentorSession.mentor.displayName}
            </Link>
            {(mentorSession.mentor.title || mentorSession.mentor.company) && (
              <p className="text-sm text-gray-500">
                {[mentorSession.mentor.title, mentorSession.mentor.company].filter(Boolean).join(" · ")}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                {TYPE_LABEL[mentorSession.type] ?? mentorSession.type}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        {/* Schedule */}
        {scheduled && (
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <div>
              <p className="font-medium text-gray-900">Scheduled</p>
              <p>{scheduled} EAT</p>
            </div>
          </div>
        )}

        <div className="flex items-start gap-3 text-sm text-gray-700">
          <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
          <div>
            <p className="font-medium text-gray-900">Duration</p>
            <p>{mentorSession.durationMins} minutes</p>
          </div>
        </div>

        {/* Notes */}
        {mentorSession.notes && (
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <div>
              <p className="font-medium text-gray-900 mb-1">Session notes</p>
              <p className="whitespace-pre-wrap text-gray-600">{mentorSession.notes}</p>
            </div>
          </div>
        )}

        {/* Related request */}
        {mentorSession.request && (
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Your guidance request</p>
            <p className="text-sm font-medium text-gray-800">{mentorSession.request.goal}</p>
          </div>
        )}

        {/* Join / booking */}
        {mentorSession.meetingUrl ? (
          <Button asChild className="w-full sm:w-auto gap-2">
            <a href={mentorSession.meetingUrl} target="_blank" rel="noopener noreferrer">
              <Video className="h-4 w-4" />
              Join meeting
            </a>
          </Button>
        ) : !isCompleted && (
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
            <p className="font-medium mb-1">Waiting for meeting link</p>
            <p className="text-blue-600">The meeting link will appear here once your mentor confirms the session. You will also receive an email notification.</p>
          </div>
        )}

        {/* Book again */}
        {isCompleted && (
          <Link
            href={`/mentors/${mentorSession.mentor.slug}#book`}
            className="flex items-center gap-1.5 text-sm text-brand hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Book another session with {mentorSession.mentor.displayName.split(" ")[0]}
          </Link>
        )}
      </Card>

      {/* Rating — only shown when session is completed and not yet rated */}
      {isCompleted && !isRated && (
        <div className="mt-6">
          <SessionRatingForm
            sessionId={mentorSession.id}
            mentorName={mentorSession.mentor.displayName.split(" ")[0]}
            onRate={handleRate}
          />
        </div>
      )}

      {/* Already rated */}
      {isCompleted && isRated && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-sm">
          <div className="flex gap-0.5">
            {[1,2,3,4,5].map((s) => (
              <Star key={s} className={`h-4 w-4 ${s <= (mentorSession.rating ?? 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
            ))}
          </div>
          <span className="text-gray-600">You rated this session. Thank you!</span>
        </div>
      )}
    </div>
  );
}
