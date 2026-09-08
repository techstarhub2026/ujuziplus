/**
 * Discussion & community server actions — Phase 3
 */
"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { assertActor, requireUser } from "@/lib/auth-server";
import type { ActionResult } from "./courses";
import { createNotification } from "./notifications";
import { excerptFromBody, extractFirstImage } from "@/lib/community/rich-content";
import { getFollowState } from "./follows";

export async function createDiscussion(
  authorId: string,
  input: {
    title: string;
    body: string;
    channel: string;
    courseId?: string;
    coverImageUrl?: string;
    excerpt?: string;
  }
): Promise<ActionResult<{ id: string }>> {
  await assertActor(authorId);

  if (!input.title.trim()) return { success: false, error: "Title is required." };
  if (!input.body.trim())  return { success: false, error: "Body is required." };

  const body = input.body.trim();
  const coverImageUrl =
    input.coverImageUrl?.trim() || extractFirstImage(body) || null;
  const excerpt = input.excerpt?.trim() || excerptFromBody(body);

  const discussion = await db.discussion.create({
    data: {
      authorId,
      title: input.title.trim(),
      body,
      excerpt,
      coverImageUrl,
      channel: input.channel,
      courseId: input.courseId ?? null,
    },
  });

  revalidatePath(`/dashboard/community/${input.channel}`);
  revalidatePath("/dashboard/community");
  revalidatePath("/community");
  revalidateTag("course-discussions");
  revalidateTag("community-preview");
  if (input.courseId) {
    const course = await db.course.findUnique({
      where: { id: input.courseId },
      select: { slug: true },
    });
    if (course) revalidatePath(`/courses/${course.slug}`);
  }

  return { success: true, data: { id: discussion.id } };
}

// ─── Public community preview (guest-facing, no session) ────────────────────

export const getCommunityPreview = unstable_cache(
  async () => {
    const CHANNELS = (await import("@/lib/discussions/channels")).CHANNELS;
    const [recent, channelCounts, total] = await Promise.all([
      db.discussion.findMany({
        where: { courseId: null },
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 30,
        include: {
          author: { select: { fullName: true, username: true, avatarUrl: true } },
          _count: { select: { replies: true, likes: true } },
        },
      }),
      Promise.all(
        CHANNELS.map(async (ch) => ({
          slug: ch.slug,
          count: await db.discussion.count({ where: { channel: ch.slug, courseId: null } }),
        }))
      ),
      db.discussion.count({ where: { courseId: null } }),
    ]);

    return {
      recent,
      postCounts: Object.fromEntries(channelCounts.map((c) => [c.slug, c.count])),
      total,
    };
  },
  ["community-preview"],
  { revalidate: 30, tags: ["community-preview"] }
);

// ─── List discussions in a channel ───────────────────────────────────────────

export async function getChannelDiscussions(channel: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    db.discussion.findMany({
      where: { channel, courseId: null },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        author: { select: { id: true, fullName: true, username: true, avatarUrl: true, role: true } },
        _count: { select: { replies: true, likes: true } },
      },
    }),
    db.discussion.count({ where: { channel, courseId: null } }),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) };
}

// ─── All recent discussions (hub feed) ───────────────────────────────────────

export async function getRecentDiscussions(channel?: string, page = 1, limit = 30) {
  const skip = (page - 1) * limit;
  const where = {
    courseId: null,
    ...(channel ? { channel } : {}),
  };

  const [items, total] = await Promise.all([
    db.discussion.findMany({
      where,
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
      include: {
        author: { select: { id: true, fullName: true, username: true, avatarUrl: true, role: true } },
        _count: { select: { replies: true, likes: true } },
      },
    }),
    db.discussion.count({ where }),
  ]);

  return { items, total, page, pages: Math.ceil(total / limit) };
}

// ─── Get a single discussion with replies ─────────────────────────────────────

export async function getDiscussion(id: string, viewerId?: string | null) {
  const discussion = await db.discussion.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, fullName: true, username: true, avatarUrl: true, role: true } },
      replies: {
        orderBy: [{ isAccepted: "desc" }, { createdAt: "asc" }],
        include: {
          author: { select: { id: true, fullName: true, username: true, avatarUrl: true, role: true } },
          _count: { select: { likes: true } },
        },
      },
      _count: { select: { likes: true, replies: true } },
    },
  });

  if (!discussion) return null;

  const replyIds = discussion.replies.map((r) => r.id);
  const [viewerDiscLike, viewerReplyLikes, followState] = await Promise.all([
    viewerId
      ? db.discussionLike.findUnique({
          where: { userId_discussionId: { userId: viewerId, discussionId: id } },
        })
      : Promise.resolve(null),
    viewerId && replyIds.length > 0
      ? db.discussionLike.findMany({
          where: { userId: viewerId, replyId: { in: replyIds } },
          select: { replyId: true },
        })
      : Promise.resolve([]),
    getFollowState(viewerId ?? null, discussion.author.id),
  ]);

  const viewerLikedReplies = Object.fromEntries(
    viewerReplyLikes.filter((l) => l.replyId).map((l) => [l.replyId!, true])
  );

  return {
    ...discussion,
    viewerLiked: !!viewerDiscLike,
    viewerLikedReplies,
    authorFollow: {
      followerCount: followState.followerCount,
      isFollowing: followState.isFollowing,
    },
  };
}

// ─── Course Q&A discussions ───────────────────────────────────────────────────

export async function getCourseDiscussions(courseId: string) {
  return getCourseDiscussionsCached(courseId);
}

const getCourseDiscussionsCached = unstable_cache(
  async (courseId: string) =>
    db.discussion.findMany({
      where: { courseId },
      orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
      take: 20,
      select: {
        id: true,
        title: true,
        body: true,
        excerpt: true,
        channel: true,
        createdAt: true,
        isPinned: true,
        isResolved: true,
        author: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
        _count: { select: { replies: true, likes: true } },
      },
    }),
  ["course-discussions"],
  { revalidate: 30, tags: ["course-discussions"] }
);

// ─── Post a reply ──────────────────────────────────────────────────────────────

export async function createReply(
  authorId: string,
  discussionId: string,
  body: string
): Promise<ActionResult<{ id: string }>> {
  await assertActor(authorId);

  if (!body.trim()) return { success: false, error: "Reply cannot be empty." };

  const reply = await db.discussionReply.create({
    data: { discussionId, authorId, body: body.trim() },
    include: { discussion: { select: { authorId: true, title: true, channel: true, courseId: true } } },
  });

  // Notify original poster (if not self-reply)
  if (reply.discussion.authorId !== authorId) {
    await createNotification(reply.discussion.authorId, {
      type: "REPLY_ON_POST",
      title: "New reply on your post",
      message: `Someone replied to your discussion: "${reply.discussion.title.slice(0, 60)}"`,
      href: reply.discussion.courseId
        ? `/dashboard/community/${reply.discussion.channel}/${discussionId}`
        : `/dashboard/community/${reply.discussion.channel}/${discussionId}`,
    });
  }

  revalidatePath(`/dashboard/community/${reply.discussion.channel}/${discussionId}`);
  return { success: true, data: { id: reply.id } };
}

// ─── Mark reply as accepted answer ────────────────────────────────────────────

export async function acceptReply(
  userId: string,
  replyId: string
): Promise<ActionResult> {
  await assertActor(userId);

  const reply = await db.discussionReply.findUnique({
    where: { id: replyId },
    include: { discussion: true },
  });
  if (!reply) return { success: false, error: "Reply not found." };
  if (reply.discussion.authorId !== userId)
    return { success: false, error: "Only the post author can accept an answer." };

  // Unaccept all others, accept this one
  await db.discussionReply.updateMany({
    where: { discussionId: reply.discussionId },
    data: { isAccepted: false },
  });
  await db.discussionReply.update({ where: { id: replyId }, data: { isAccepted: true } });
  await db.discussion.update({
    where: { id: reply.discussionId },
    data: { isResolved: true },
  });

  revalidatePath(`/dashboard/community`);
  return { success: true, data: undefined };
}

// ─── Toggle like on a discussion ──────────────────────────────────────────────

export async function toggleDiscussionLike(
  userId: string,
  discussionId: string
): Promise<ActionResult<{ liked: boolean }>> {
  await assertActor(userId);

  const existing = await db.discussionLike.findUnique({
    where: { userId_discussionId: { userId, discussionId } },
  });

  if (existing) {
    await db.discussionLike.delete({ where: { id: existing.id } });
    return { success: true, data: { liked: false } };
  }

  const discussion = await db.discussion.findUnique({
    where: { id: discussionId },
    select: { authorId: true, title: true, channel: true },
  });

  await db.discussionLike.create({ data: { userId, discussionId } });

  if (discussion && discussion.authorId !== userId) {
    await createNotification(discussion.authorId, {
      type: "LIKE_ON_POST",
      title: "Someone liked your post",
      message: `"${discussion.title.slice(0, 60)}" received a new like.`,
      href: `/dashboard/community/${discussion.channel}/${discussionId}`,
    });
  }

  return { success: true, data: { liked: true } };
}

// ─── Toggle like on a reply ───────────────────────────────────────────────────

export async function toggleReplyLike(
  userId: string,
  replyId: string
): Promise<ActionResult<{ liked: boolean }>> {
  await assertActor(userId);

  const existing = await db.discussionLike.findUnique({
    where: { userId_replyId: { userId, replyId } },
  });

  if (existing) {
    await db.discussionLike.delete({ where: { id: existing.id } });
    return { success: true, data: { liked: false } };
  }

  await db.discussionLike.create({ data: { userId, replyId } });
  return { success: true, data: { liked: true } };
}

// ─── Delete a discussion (author or moderator) ────────────────────────────────

export async function deleteDiscussion(
  userId: string,
  discussionId: string
): Promise<ActionResult> {
  const { user } = await requireUser();

  const d = await db.discussion.findUnique({ where: { id: discussionId } });
  if (!d) return { success: false, error: "Not found." };

  const canDelete =
    d.authorId === user.id ||
    user.role === "ADMIN" ||
    user.role === "MODERATOR";

  if (!canDelete) return { success: false, error: "Not authorized." };

  await db.discussion.delete({ where: { id: discussionId } });
  revalidatePath(`/dashboard/community/${d.channel}`);
  return { success: true, data: undefined };
}
