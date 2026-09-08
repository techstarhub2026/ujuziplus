/**
 * Mentors — directory, requests, sessions, office hours, group sessions
 */
"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "./courses";
import {
  MentorRequestStatus,
  MentorSessionStatus,
  MentorSessionType,
  MentorStatus,
  MentorType,
  NotificationType,
} from "@prisma/client";
import { requireUser, requireAdmin, assertSelfOrAdmin } from "@/lib/auth-server";
import { createNotification } from "./notifications";
import { sendEmail, mentorRequestEmail, mentorSessionEmail } from "@/lib/email";
import { sendSms, mentorSessionReminderSms } from "@/lib/sms";
import type { LearningPathStep } from "@/lib/mentors/tracks";

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "mentor"
  );
}

async function uniqueMentorSlug(name: string, excludeId?: string) {
  const base = slugify(name);
  let slug = base;
  let i = 0;
  while (true) {
    const existing = await db.mentorProfile.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    i++;
    slug = `${base}-${i}`;
  }
  return slug;
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val.filter((x) => typeof x === "string") as string[];
  return [];
}

function parseLearningPath(val: unknown): LearningPathStep[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((x) => x && typeof x === "object" && "title" in x && "href" in x)
    .map((x) => ({
      title: String((x as LearningPathStep).title),
      href: String((x as LearningPathStep).href),
      note: (x as LearningPathStep).note ? String((x as LearningPathStep).note) : undefined,
    }));
}

export type SerializedMentor = {
  id: string;
  slug: string;
  displayName: string;
  title: string | null;
  company: string | null;
  companyLogoUrl: string | null;
  avatarUrl: string | null;
  bio: string | null;
  hook: string | null;
  quote: string | null;
  videoIntroUrl: string | null;
  city: string | null;
  country: string | null;
  expertiseTags: string[];
  tracks: string[];
  languages: string[];
  yearsExperience: number;
  linkedin: string | null;
  github: string | null;
  learningPath: LearningPathStep[];
  recommendedCourseIds: string[];
  recommendedKitSlugs: string[];
  officeHoursNote: string | null;
  bookingUrl: string | null;
  isFeatured: boolean;
  isAcceptingRequests: boolean;
  studentsHelped: number;
  sortOrder: number;
  status: MentorStatus;
  userId: string | null;
  mentorType: MentorType;
  agreedToCodeOfConduct: boolean;
  averageRating: number | null;
  ratingCount: number;
};

function serializeMentor(m: {
  id: string;
  slug: string;
  displayName: string;
  title: string | null;
  company: string | null;
  companyLogoUrl: string | null;
  avatarUrl: string | null;
  bio: string | null;
  hook: string | null;
  quote: string | null;
  videoIntroUrl: string | null;
  city: string | null;
  country: string | null;
  expertiseTags: unknown;
  tracks: unknown;
  languages: unknown;
  learningPath: unknown;
  recommendedCourseIds: unknown;
  recommendedKitSlugs: unknown;
  officeHoursNote: string | null;
  bookingUrl: string | null;
  isFeatured: boolean;
  isAcceptingRequests: boolean;
  studentsHelped: number;
  sortOrder: number;
  status: MentorStatus;
  userId: string | null;
  yearsExperience: number;
  linkedin: string | null;
  github: string | null;
  mentorType: MentorType;
  agreedToCodeOfConduct: boolean;
  averageRating: number | null;
  ratingCount: number;
}): SerializedMentor {
  return {
    ...m,
    expertiseTags: parseJsonArray(m.expertiseTags),
    tracks: parseJsonArray(m.tracks),
    languages: parseJsonArray(m.languages),
    learningPath: parseLearningPath(m.learningPath),
    recommendedCourseIds: parseJsonArray(m.recommendedCourseIds),
    recommendedKitSlugs: parseJsonArray(m.recommendedKitSlugs),
  };
}

// ─── Public catalog ───────────────────────────────────────────────────────────

export async function getPublishedMentors(): Promise<SerializedMentor[]> {
  return getPublishedMentorsCached();
}

const getPublishedMentorsCached = unstable_cache(
  async (): Promise<SerializedMentor[]> => {
    const rows = await db.mentorProfile.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { displayName: "asc" }],
    });
    return rows.map(serializeMentor);
  },
  ["published-mentors"],
  { revalidate: 60, tags: ["published-mentors"] }
);

export async function getFeaturedMentors(limit = 8) {
  const mentors = await getPublishedMentors();
  const featured = mentors.filter((m) => m.isFeatured);
  return (featured.length > 0 ? featured : mentors).slice(0, limit);
}

export async function getMentorBySlug(slug: string) {
  const m = await db.mentorProfile.findUnique({ where: { slug } });
  if (!m || m.status !== "PUBLISHED") return null;
  return serializeMentor(m);
}

export async function getMentorDetailBySlug(slug: string): Promise<MentorDetail | null> {
  return getMentorDetailCached(slug);
}

export type MentorDetail = SerializedMentor & {
  officeHours: Array<{
    id: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    title: string;
  }>;
  groupSessions: Array<{
    id: string;
    title: string;
    description: string | null;
    scheduledAt: string;
    durationMins: number;
    maxAttendees: number;
    meetingUrl: string | null;
    attendeeCount: number;
  }>;
  recommendedCourses: Array<{
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string | null;
  }>;
  recommendedKits: Array<{
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string | null;
  }>;
};

const getMentorDetailCached = unstable_cache(
  async (slug: string): Promise<MentorDetail | null> => {
    const m = await db.mentorProfile.findUnique({
      where: { slug },
      include: {
        officeHours: { where: { isActive: true }, orderBy: { dayOfWeek: "asc" } },
        groupSessions: {
          where: { isActive: true, scheduledAt: { gte: new Date() } },
          orderBy: { scheduledAt: "asc" },
          include: { _count: { select: { attendees: true } } },
        },
      },
    });
    if (!m || m.status !== "PUBLISHED") return null;

    const courseIds = parseJsonArray(m.recommendedCourseIds);
    const kitSlugs = parseJsonArray(m.recommendedKitSlugs);

    const [courses, kits] = await Promise.all([
      courseIds.length
        ? db.course.findMany({
            where: { id: { in: courseIds }, status: "PUBLISHED" },
            select: { id: true, slug: true, title: true, thumbnailUrl: true },
          })
        : Promise.resolve([]),
      kitSlugs.length
        ? db.kit.findMany({
            where: { slug: { in: kitSlugs }, status: "PUBLISHED" },
            select: { id: true, slug: true, title: true, thumbnailUrl: true },
          })
        : Promise.resolve([]),
    ]);

    return {
      ...serializeMentor(m),
      officeHours: m.officeHours,
      groupSessions: m.groupSessions.map((s) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        scheduledAt: s.scheduledAt.toISOString(),
        durationMins: s.durationMins,
        maxAttendees: s.maxAttendees,
        meetingUrl: s.meetingUrl,
        attendeeCount: s._count.attendees,
      })),
      recommendedCourses: courses,
      recommendedKits: kits,
    };
  },
  ["mentor-detail"],
  { revalidate: 60, tags: ["mentor-detail"] }
);

// ─── Learner dashboard ────────────────────────────────────────────────────────

export async function getLearnerMentorData(userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const [requests, sessions, groupAttendees, cohortMembers] = await Promise.all([
    db.mentorRequest.findMany({
      where: { learnerId: userId },
      include: {
        mentor: {
          select: {
            id: true,
            slug: true,
            displayName: true,
            avatarUrl: true,
            title: true,
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.mentorSession.findMany({
      where: { learnerId: userId },
      include: {
        mentor: {
          select: {
            id: true,
            slug: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { scheduledAt: "desc" },
    }),
    db.mentorGroupSessionAttendee.findMany({
      where: { userId },
      include: {
        session: {
          include: {
            mentor: {
              select: { slug: true, displayName: true, avatarUrl: true },
            },
            _count: { select: { attendees: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
    db.mentorCohortMember.findMany({
      where: { userId },
      include: {
        cohort: {
          include: {
            mentor: { select: { slug: true, displayName: true, avatarUrl: true } },
            _count: { select: { members: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    }),
  ]);

  return {
    requests: requests.map((r) => ({
      id: r.id,
      goal: r.goal,
      message: r.message,
      status: r.status,
      mentorReply: r.mentorReply,
      createdAt: r.createdAt.toISOString(),
      mentor: r.mentor,
    })),
    sessions: sessions.map((s) => ({
      id: s.id,
      type: s.type,
      status: s.status,
      topic: s.topic,
      scheduledAt: s.scheduledAt?.toISOString() ?? null,
      durationMins: s.durationMins,
      meetingUrl: s.meetingUrl,
      mentor: s.mentor,
    })),
    groupSessions: groupAttendees.map((a) => ({
      id: a.session.id,
      title: a.session.title,
      scheduledAt: a.session.scheduledAt.toISOString(),
      durationMins: a.session.durationMins,
      meetingUrl: a.session.meetingUrl,
      attendeeCount: a.session._count.attendees,
      mentor: a.session.mentor,
    })),
    cohorts: cohortMembers.map((cm) => ({
      id: cm.cohort.id,
      title: cm.cohort.title,
      description: cm.cohort.description,
      track: cm.cohort.track,
      startsAt: cm.cohort.startsAt.toISOString(),
      endsAt: cm.cohort.endsAt?.toISOString() ?? null,
      maxMembers: cm.cohort.maxMembers,
      memberCount: cm.cohort._count.members,
      isActive: cm.cohort.isActive,
      mentor: cm.cohort.mentor,
      joinedAt: cm.joinedAt.toISOString(),
    })),
  };
}

export async function getLearnerMentorSession(sessionId: string, userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  return db.mentorSession.findFirst({
    where: { id: sessionId, learnerId: userId },
    include: {
      mentor: {
        select: {
          id: true,
          slug: true,
          displayName: true,
          avatarUrl: true,
          title: true,
          company: true,
        },
      },
      request: {
        select: { id: true, goal: true, status: true },
      },
    },
    // include rating fields so session detail can show "already rated" state
    // and render the rating form only if not yet rated
  });
}

// Re-export the correct type so pages can type-annotate the result
export type LearnerSessionDetail = NonNullable<Awaited<ReturnType<typeof getLearnerMentorSession>>>;

export async function submitMentorRequest(input: {
  mentorSlug: string;
  goal: string;
  message: string;
}): Promise<ActionResult<{ requestId: string }>> {
  const { user } = await requireUser();

  const mentor = await db.mentorProfile.findUnique({
    where: { slug: input.mentorSlug },
    include: { user: { select: { id: true, email: true, fullName: true } } },
  });
  if (!mentor || mentor.status !== "PUBLISHED") {
    return { success: false, error: "Mentor not found." };
  }
  if (!mentor.isAcceptingRequests) {
    return { success: false, error: "This mentor is not accepting requests right now." };
  }

  const goal = input.goal.trim();
  const message = input.message.trim();
  if (!goal || goal.length < 10) {
    return { success: false, error: "Please describe your learning goal (at least 10 characters)." };
  }
  if (!message || message.length < 20) {
    return { success: false, error: "Please add a message (at least 20 characters)." };
  }

  const existing = await db.mentorRequest.findFirst({
    where: {
      learnerId: user.id,
      mentorId: mentor.id,
      status: { in: ["PENDING", "ACCEPTED"] },
    },
  });
  if (existing) {
    return { success: false, error: "You already have an open request with this mentor." };
  }

  const request = await db.mentorRequest.create({
    data: {
      learnerId: user.id,
      mentorId: mentor.id,
      goal,
      message,
    },
  });

  if (mentor.userId) {
    await createNotification(mentor.userId, {
      type: "MENTOR_REQUEST",
      title: "New mentorship request",
      message: `${user.fullName} asked for guidance: ${goal.slice(0, 80)}${goal.length > 80 ? "…" : ""}`,
      href: `/dashboard/mentors/requests/${request.id}`,
      prefCategory: "Mentorship",
    });
    if (mentor.user?.email) {
      await sendEmail({
        to: mentor.user.email,
        subject: `New mentorship request — ${user.fullName}`,
        html: mentorRequestEmail({
          mentorName: mentor.displayName,
          learnerName: user.fullName,
          goal,
          message,
          reviewUrl: `${process.env.NEXTAUTH_URL}/dashboard/mentors/requests/${request.id}`,
        }),
      });
    }
  }

  const admins = await db.user.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  await Promise.all(
    admins.map((a) =>
      createNotification(a.id, {
        type: "MENTOR_REQUEST",
        title: "New mentorship request",
        message: `${user.fullName} → ${mentor.displayName}`,
        href: `/admin/mentors/requests`,
        prefCategory: "Mentorship",
      })
    )
  );

  revalidatePath("/dashboard/mentors");
  revalidatePath(`/mentors/${mentor.slug}`);
  return { success: true, data: { requestId: request.id } };
}

// ─── Session booking (Phase 4) ────────────────────────────────────────────────

export async function bookMentorSession(input: {
  mentorSlug: string;
  topic: string;
  scheduledAt: string;
  durationMins?: number;
  type?: MentorSessionType;
  requestId?: string;
}): Promise<ActionResult<{ sessionId: string }>> {
  const { user } = await requireUser();

  const mentor = await db.mentorProfile.findUnique({
    where: { slug: input.mentorSlug },
    include: { user: { select: { id: true, email: true } } },
  });
  if (!mentor || mentor.status !== "PUBLISHED") {
    return { success: false, error: "Mentor not found." };
  }

  const scheduledAt = new Date(input.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime()) || scheduledAt <= new Date()) {
    return { success: false, error: "Please pick a future date and time." };
  }

  const topic = input.topic.trim();
  if (!topic) return { success: false, error: "Topic is required." };

  const session = await db.mentorSession.create({
    data: {
      mentorId: mentor.id,
      learnerId: user.id,
      requestId: input.requestId ?? null,
      type: input.type ?? "GUIDANCE",
      status: "SCHEDULED",
      topic,
      scheduledAt,
      durationMins: input.durationMins ?? 30,
      meetingUrl: mentor.bookingUrl,
    },
  });

  await createNotification(user.id, {
    type: "MENTOR_SESSION_SCHEDULED",
    title: "Mentorship session scheduled",
    message: `Your session with ${mentor.displayName} is booked.`,
    href: `/dashboard/mentors/sessions/${session.id}`,
    prefCategory: "Mentorship",
  });

  if (mentor.userId) {
    await createNotification(mentor.userId, {
      type: "MENTOR_SESSION_SCHEDULED",
      title: "New session booked",
      message: `${user.fullName} booked a session: ${topic}`,
      href: `/dashboard/mentors/sessions/${session.id}`,
      prefCategory: "Mentorship",
    });
  }

  await sendEmail({
    to: user.email,
    subject: `Mentorship session confirmed — ${mentor.displayName}`,
    html: mentorSessionEmail({
      recipientName: user.fullName,
      mentorName: mentor.displayName,
      topic,
      scheduledAt,
      meetingUrl: mentor.bookingUrl,
    }),
  });

  revalidatePath("/dashboard/mentors");
  return { success: true, data: { sessionId: session.id } };
}

export async function joinGroupSession(sessionId: string): Promise<ActionResult> {
  const { user } = await requireUser();

  const session = await db.mentorGroupSession.findUnique({
    where: { id: sessionId },
    include: { _count: { select: { attendees: true } } },
  });
  if (!session || !session.isActive) {
    return { success: false, error: "Group session not found." };
  }
  if (session.scheduledAt < new Date()) {
    return { success: false, error: "This session has already started." };
  }
  if (session._count.attendees >= session.maxAttendees) {
    return { success: false, error: "This session is full." };
  }

  await db.mentorGroupSessionAttendee.upsert({
    where: { sessionId_userId: { sessionId, userId: user.id } },
    create: { sessionId, userId: user.id },
    update: {},
  });

  revalidatePath("/dashboard/mentors");
  revalidatePath("/mentors");
  return { success: true, data: undefined };
}

// ─── Admin CRUD ─────────────────────────────────────────────────────────────

export type MentorSaveInput = {
  displayName: string;
  userId?: string | null;
  title?: string;
  company?: string;
  companyLogoUrl?: string | null;
  avatarUrl?: string | null;
  bio?: string;
  hook?: string;
  quote?: string;
  videoIntroUrl?: string;
  city?: string;
  country?: string;
  expertiseTags: string[];
  tracks: string[];
  languages: string[];
  yearsExperience: number;
  linkedin?: string;
  github?: string;
  learningPath: LearningPathStep[];
  recommendedCourseIds: string[];
  recommendedKitSlugs: string[];
  officeHoursNote?: string;
  bookingUrl?: string;
  isFeatured: boolean;
  isAcceptingRequests: boolean;
  studentsHelped: number;
  sortOrder: number;
  status: MentorStatus;
  mentorType: MentorType;
  agreedToCodeOfConduct: boolean;
};

export async function getAdminMentors() {
  await requireAdmin();
  const rows = await db.mentorProfile.findMany({
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    include: { _count: { select: { requests: true, sessions: true } } },
  });
  return rows.map((m) => ({ ...serializeMentor(m), requestCount: m._count.requests, sessionCount: m._count.sessions }));
}

export async function getMentorById(mentorId: string) {
  await requireAdmin();
  const m = await db.mentorProfile.findUnique({
    where: { id: mentorId },
    include: { officeHours: true, groupSessions: { orderBy: { scheduledAt: "desc" } } },
  });
  return m ? { ...serializeMentor(m), officeHours: m.officeHours, groupSessions: m.groupSessions } : null;
}

export async function createMentor(input: MentorSaveInput): Promise<ActionResult<{ mentorId: string }>> {
  await requireAdmin();
  if (!input.displayName.trim()) return { success: false, error: "Display name is required." };

  const slug = await uniqueMentorSlug(input.displayName);
  const mentor = await db.mentorProfile.create({
    data: mentorPayload(slug, input),
  });

  revalidateMentorPaths();
  return { success: true, data: { mentorId: mentor.id } };
}

export async function updateMentor(mentorId: string, input: MentorSaveInput): Promise<ActionResult> {
  await requireAdmin();
  const existing = await db.mentorProfile.findUnique({ where: { id: mentorId } });
  if (!existing) return { success: false, error: "Mentor not found." };

  const slug =
    slugify(input.displayName) === existing.slug
      ? existing.slug
      : await uniqueMentorSlug(input.displayName, mentorId);

  await db.mentorProfile.update({
    where: { id: mentorId },
    data: mentorPayload(slug, input),
  });

  revalidateMentorPaths(existing.slug);
  return { success: true, data: undefined };
}

export async function deleteMentor(mentorId: string): Promise<ActionResult> {
  await requireAdmin();
  const m = await db.mentorProfile.findUnique({ where: { id: mentorId } });
  if (!m) return { success: false, error: "Mentor not found." };
  await db.mentorProfile.delete({ where: { id: mentorId } });
  revalidateMentorPaths(m.slug);
  return { success: true, data: undefined };
}

function mentorPayload(slug: string, input: MentorSaveInput) {
  return {
    slug,
    displayName: input.displayName.trim(),
    userId: input.userId?.trim() || null,
    title: input.title?.trim() || null,
    company: input.company?.trim() || null,
    companyLogoUrl: input.companyLogoUrl?.trim() || null,
    avatarUrl: input.avatarUrl?.trim() || null,
    bio: input.bio?.trim() || null,
    hook: input.hook?.trim() || null,
    quote: input.quote?.trim() || null,
    videoIntroUrl: input.videoIntroUrl?.trim() || null,
    city: input.city?.trim() || null,
    country: input.country?.trim() || null,
    expertiseTags: input.expertiseTags,
    tracks: input.tracks,
    languages: input.languages,
    yearsExperience: input.yearsExperience,
    linkedin: input.linkedin?.trim() || null,
    github: input.github?.trim() || null,
    learningPath: input.learningPath,
    recommendedCourseIds: input.recommendedCourseIds,
    recommendedKitSlugs: input.recommendedKitSlugs,
    officeHoursNote: input.officeHoursNote?.trim() || null,
    bookingUrl: input.bookingUrl?.trim() || null,
    isFeatured: input.isFeatured,
    isAcceptingRequests: input.isAcceptingRequests,
    studentsHelped: input.studentsHelped,
    sortOrder: input.sortOrder,
    status: input.status,
    mentorType: input.mentorType,
    agreedToCodeOfConduct: input.agreedToCodeOfConduct,
  };
}

function revalidateMentorPaths(slug?: string) {
  revalidateTag("published-mentors");
  revalidateTag("mentor-detail");
  revalidatePath("/admin/mentors");
  revalidatePath("/mentors");
  revalidatePath("/");
  revalidatePath("/dashboard/mentors");
  if (slug) revalidatePath(`/mentors/${slug}`);
}

// ─── Admin: requests & sessions ───────────────────────────────────────────────

export async function getAdminMentorRequests() {
  await requireAdmin();
  return db.mentorRequest.findMany({
    include: {
      learner: { select: { id: true, fullName: true, email: true, username: true } },
      mentor: { select: { id: true, slug: true, displayName: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateMentorRequestStatus(
  requestId: string,
  status: MentorRequestStatus,
  mentorReply?: string
): Promise<ActionResult> {
  await requireAdmin();
  const req = await db.mentorRequest.findUnique({
    where: { id: requestId },
    include: { mentor: true, learner: true },
  });
  if (!req) return { success: false, error: "Request not found." };

  await db.mentorRequest.update({
    where: { id: requestId },
    data: { status, mentorReply: mentorReply?.trim() || req.mentorReply },
  });

  if (status === "ACCEPTED") {
    await db.mentorProfile.update({
      where: { id: req.mentorId },
      data: { studentsHelped: { increment: 1 } },
    });
  }

  await createNotification(req.learnerId, {
    type: "MENTOR_REQUEST_UPDATE",
    title: `Mentorship request ${status.toLowerCase()}`,
    message:
      mentorReply?.trim() ||
      `Your request to ${req.mentor.displayName} was ${status.toLowerCase()}.`,
    href: "/dashboard/mentors",
    prefCategory: "Mentorship",
  });

  revalidatePath("/admin/mentors/requests");
  revalidatePath("/dashboard/mentors");
  return { success: true, data: undefined };
}

// ─── Office hours (admin) ─────────────────────────────────────────────────────

export type OfficeHourInput = {
  title: string;
  description?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone?: string;
  meetingUrl?: string;
  isActive: boolean;
};

export async function addMentorOfficeHour(
  mentorId: string,
  input: OfficeHourInput
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const row = await db.mentorOfficeHour.create({
    data: {
      mentorId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      dayOfWeek: input.dayOfWeek,
      startTime: input.startTime,
      endTime: input.endTime,
      timezone: input.timezone ?? "Africa/Dar_es_Salaam",
      meetingUrl: input.meetingUrl?.trim() || null,
      isActive: input.isActive,
    },
  });
  revalidateMentorPaths();
  return { success: true, data: { id: row.id } };
}

export async function deleteMentorOfficeHour(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.mentorOfficeHour.delete({ where: { id } });
  revalidateMentorPaths();
  return { success: true, data: undefined };
}

// ─── Group sessions (admin) ───────────────────────────────────────────────────

export type GroupSessionInput = {
  title: string;
  description?: string;
  scheduledAt: string;
  durationMins: number;
  maxAttendees: number;
  meetingUrl?: string;
  isActive: boolean;
};

export async function addMentorGroupSession(
  mentorId: string,
  input: GroupSessionInput
): Promise<ActionResult<{ id: string }>> {
  await requireAdmin();
  const row = await db.mentorGroupSession.create({
    data: {
      mentorId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      scheduledAt: new Date(input.scheduledAt),
      durationMins: input.durationMins,
      maxAttendees: input.maxAttendees,
      meetingUrl: input.meetingUrl?.trim() || null,
      isActive: input.isActive,
    },
  });
  revalidateMentorPaths();
  return { success: true, data: { id: row.id } };
}

export async function deleteMentorGroupSession(id: string): Promise<ActionResult> {
  await requireAdmin();
  await db.mentorGroupSession.delete({ where: { id } });
  revalidateMentorPaths();
  return { success: true, data: undefined };
}

// ─── SMS reminders cron ───────────────────────────────────────────────────────

export async function sendMentorSessionReminders(): Promise<{ sent: number; errors: string[] }> {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in25h = new Date(now.getTime() + 25 * 60 * 60 * 1000);

  const sessions = await db.mentorSession.findMany({
    where: {
      smsReminderSent: false,
      status: { in: ["SCHEDULED", "CONFIRMED"] },
      scheduledAt: { gte: in24h, lte: in25h },
    },
    include: {
      learner: { select: { id: true, fullName: true, email: true, location: true } },
      mentor: { select: { displayName: true } },
    },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const s of sessions) {
    if (!s.scheduledAt) continue;

    const phone = s.learner.location;
    const smsText = mentorSessionReminderSms({
      mentorName: s.mentor.displayName,
      scheduledAt: s.scheduledAt,
      meetingUrl: s.meetingUrl,
    });

    if (phone) {
      const smsRes = await sendSms(phone, smsText);
      if (!smsRes.ok) errors.push(`SMS ${s.id}: ${smsRes.error}`);
    }

    await createNotification(s.learnerId, {
      type: "MENTOR_SESSION_REMINDER",
      title: "Mentorship session tomorrow",
      message: `Your session with ${s.mentor.displayName} is coming up.`,
      href: `/dashboard/mentors/sessions/${s.id}`,
      prefCategory: "Mentorship",
    });

    await sendEmail({
      to: s.learner.email,
      subject: `Reminder: mentorship session tomorrow`,
      html: mentorSessionEmail({
        recipientName: s.learner.fullName,
        mentorName: s.mentor.displayName,
        topic: s.topic ?? "Mentorship session",
        scheduledAt: s.scheduledAt,
        meetingUrl: s.meetingUrl,
        isReminder: true,
      }),
    });

    await db.mentorSession.update({
      where: { id: s.id },
      data: { smsReminderSent: true },
    });
    sent++;
  }

  return { sent, errors };
}

export async function getMentorUsersForLinking() {
  await requireAdmin();
  return db.user.findMany({
    where: { role: { in: ["INSTRUCTOR", "ADMIN"] }, isActive: true },
    select: { id: true, fullName: true, email: true, role: true },
    orderBy: { fullName: "asc" },
  });
}

export async function getCoursesForMentorLinking() {
  await requireAdmin();
  return db.course.findMany({
    where: { status: "PUBLISHED" },
    select: { id: true, title: true, slug: true },
    orderBy: { title: "asc" },
  });
}

export async function getKitsForMentorLinking() {
  await requireAdmin();
  return db.kit.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, title: true },
    orderBy: { title: "asc" },
  });
}

// ─── Match wizard ─────────────────────────────────────────────────────────────

export async function matchMentors(tracks: string[], goal?: string, mentorType?: string) {
  const allMentors = await getPublishedMentors();
  const mentors = mentorType
    ? allMentors.filter((m) => m.mentorType === mentorType)
    : allMentors;
  if (tracks.length === 0 && !goal) return mentors.slice(0, 6);

  const goalLower = goal?.toLowerCase() ?? "";
  const scored = mentors.map((m) => {
    let score = 0;
    for (const t of tracks) {
      if (m.tracks.some((mt) => mt.toLowerCase() === t.toLowerCase())) score += 3;
    }
    if (goalLower) {
      for (const tag of m.expertiseTags) {
        if (goalLower.includes(tag.toLowerCase())) score += 2;
      }
      if (m.hook?.toLowerCase().includes(goalLower)) score += 1;
      if (m.bio?.toLowerCase().includes(goalLower)) score += 1;
    }
    if (m.isFeatured) score += 1;
    if (m.isAcceptingRequests) score += 1;
    return { mentor: m, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .filter((s) => s.score > 0)
    .slice(0, 6)
    .map((s) => s.mentor);
}

// ─── Session rating ────────────────────────────────────────────────────────────

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export async function rateSession(
  sessionId: string,
  rating: number,
  feedback: string
): Promise<ActionResult> {
  const { user } = await requireUser();

  const session = await db.mentorSession.findFirst({
    where: { id: sessionId, learnerId: user.id, status: "COMPLETED" },
  });
  if (!session) {
    return { success: false, error: "Session not found or not yet completed." };
  }
  if (session.ratedAt !== null) {
    return { success: false, error: "You have already rated this session." };
  }

  await db.mentorSession.update({
    where: { id: sessionId },
    data: {
      rating: clamp(Math.round(rating), 1, 5),
      learnerFeedback: feedback.trim() || null,
      ratedAt: new Date(),
    },
  });

  // Recompute mentor average
  const ratedSessions = await db.mentorSession.findMany({
    where: { mentorId: session.mentorId, rating: { not: null } },
    select: { rating: true },
  });
  const ratingCount = ratedSessions.length;
  const averageRating =
    ratingCount > 0
      ? ratedSessions.reduce((sum, s) => sum + (s.rating ?? 0), 0) / ratingCount
      : null;

  await db.mentorProfile.update({
    where: { id: session.mentorId },
    data: { averageRating, ratingCount },
  });

  revalidatePath("/dashboard/mentors");
  revalidateTag("mentor-detail");
  return { success: true, data: undefined };
}

// ─── Public cohorts ────────────────────────────────────────────────────────────

export async function getPublicCohorts() {
  const cohorts = await db.mentorCohort.findMany({
    where: { isActive: true, mentor: { status: "PUBLISHED" } },
    include: {
      mentor: { select: { slug: true, displayName: true, avatarUrl: true, mentorType: true } },
      _count: { select: { members: true } },
    },
    orderBy: { startsAt: "asc" },
  });

  return cohorts.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    track: c.track,
    startsAt: c.startsAt.toISOString(),
    endsAt: c.endsAt?.toISOString() ?? null,
    maxMembers: c.maxMembers,
    memberCount: c._count.members,
    isActive: c.isActive,
    mentor: c.mentor,
  }));
}

// ─── Join cohort ───────────────────────────────────────────────────────────────

export async function joinCohort(cohortId: string): Promise<ActionResult> {
  const { user } = await requireUser();

  const cohort = await db.mentorCohort.findUnique({
    where: { id: cohortId },
    include: { _count: { select: { members: true } } },
  });
  if (!cohort || !cohort.isActive) {
    return { success: false, error: "Cohort not found or is no longer active." };
  }
  if (cohort._count.members >= cohort.maxMembers) {
    return { success: false, error: "This cohort is full." };
  }

  const alreadyMember = await db.mentorCohortMember.findUnique({
    where: { cohortId_userId: { cohortId, userId: user.id } },
  });
  if (alreadyMember) {
    return { success: false, error: "You are already a member of this cohort." };
  }

  await db.mentorCohortMember.create({
    data: { cohortId, userId: user.id },
  });

  await createNotification(user.id, {
    type: "MENTOR_REQUEST",
    title: "Joined cohort",
    message: `You have joined the cohort: ${cohort.title}`,
    href: `/dashboard/mentors`,
    prefCategory: "Mentorship",
  });

  revalidatePath("/dashboard/mentors");
  return { success: true, data: undefined };
}

// ─── Learner cohorts ───────────────────────────────────────────────────────────

export async function getLearnerCohorts(userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const members = await db.mentorCohortMember.findMany({
    where: { userId },
    include: {
      cohort: {
        include: {
          mentor: { select: { slug: true, displayName: true, avatarUrl: true } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  return members.map((cm) => ({
    id: cm.cohort.id,
    title: cm.cohort.title,
    description: cm.cohort.description,
    track: cm.cohort.track,
    startsAt: cm.cohort.startsAt.toISOString(),
    endsAt: cm.cohort.endsAt?.toISOString() ?? null,
    maxMembers: cm.cohort.maxMembers,
    memberCount: cm.cohort._count.members,
    isActive: cm.cohort.isActive,
    mentor: cm.cohort.mentor,
    joinedAt: cm.joinedAt.toISOString(),
  }));
}

// ─── Admin cohort actions ──────────────────────────────────────────────────────

export async function getAdminCohorts(mentorId: string) {
  await requireAdmin();
  const cohorts = await db.mentorCohort.findMany({
    where: { mentorId },
    include: { _count: { select: { members: true } } },
    orderBy: { startsAt: "asc" },
  });
  return cohorts.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description,
    track: c.track,
    startsAt: c.startsAt.toISOString(),
    endsAt: c.endsAt?.toISOString() ?? null,
    maxMembers: c.maxMembers,
    memberCount: c._count.members,
    isActive: c.isActive,
  }));
}

export async function createCohort(
  mentorId: string,
  input: {
    title: string;
    description?: string;
    track?: string;
    startsAt: string;
    endsAt?: string;
    maxMembers: number;
  }
): Promise<ActionResult<{ cohortId: string }>> {
  await requireAdmin();
  if (!input.title.trim()) {
    return { success: false, error: "Title is required." };
  }
  const cohort = await db.mentorCohort.create({
    data: {
      mentorId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      track: input.track?.trim() || "General",
      startsAt: new Date(input.startsAt),
      endsAt: input.endsAt ? new Date(input.endsAt) : null,
      maxMembers: input.maxMembers,
    },
  });
  revalidatePath("/admin/mentors");
  revalidatePath("/mentors");
  return { success: true, data: { cohortId: cohort.id } };
}

export async function deleteCohort(cohortId: string): Promise<ActionResult> {
  await requireAdmin();
  const cohort = await db.mentorCohort.findUnique({ where: { id: cohortId } });
  if (!cohort) return { success: false, error: "Cohort not found." };
  await db.mentorCohort.delete({ where: { id: cohortId } });
  revalidatePath("/admin/mentors");
  revalidatePath("/mentors");
  return { success: true, data: undefined };
}
