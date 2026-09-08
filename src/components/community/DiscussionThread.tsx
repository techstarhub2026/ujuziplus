"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  Send,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import {
  createReply,
  toggleDiscussionLike,
  toggleReplyLike,
  acceptReply,
  deleteDiscussion,
} from "@/lib/actions/discussions";
import { RichContentRenderer } from "@/components/community/RichContentRenderer";
import { PostLikeButton } from "@/components/community/PostLikeButton";
import { AuthorFollowButton } from "@/components/community/AuthorFollowButton";

type ReplyRow = {
  id: string;
  body: string;
  isAccepted: boolean;
  createdAt: Date;
  author: { id: string; fullName: string; username: string; avatarUrl: string | null; role: string };
  _count: { likes: number };
};

type DiscussionFull = {
  id: string;
  title: string;
  body: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  channel: string;
  isPinned: boolean;
  isResolved: boolean;
  createdAt: Date;
  author: { id: string; fullName: string; username: string; avatarUrl: string | null; role: string };
  replies: ReplyRow[];
  _count: { likes: number; replies: number };
  viewerLiked?: boolean;
  viewerLikedReplies?: Record<string, boolean>;
  authorFollow?: { followerCount: number; isFollowing: boolean };
};

function ReplyBubble({
  reply,
  userId,
  isPostAuthor,
  initialLiked,
}: {
  reply: ReplyRow;
  userId: string;
  isPostAuthor: boolean;
  initialLiked: boolean;
}) {
  const router = useRouter();
  const [accepting, startAccept] = useTransition();

  function handleAccept() {
    startAccept(async () => {
      await acceptReply(userId, reply.id);
      router.refresh();
    });
  }

  return (
    <div
      className={`rounded-xl border p-4 ${
        reply.isAccepted ? "border-green-300 bg-green-50" : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <Link href={`/profile/${reply.author.username}`}>
          <Avatar
            src={reply.author.avatarUrl ?? undefined}
            alt={reply.author.fullName}
            size="sm"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              href={`/profile/${reply.author.username}`}
              className="text-sm font-medium hover:text-brand"
            >
              {reply.author.fullName}
            </Link>
            {reply.author.role === "INSTRUCTOR" && (
              <Badge variant="accent" className="text-[10px]">Instructor</Badge>
            )}
            {reply.isAccepted && (
              <Badge variant="success" className="text-[10px] flex items-center gap-0.5">
                <CheckCircle2 className="h-2.5 w-2.5" />Accepted answer
              </Badge>
            )}
            <span className="text-xs text-gray-400 ml-auto">{formatDate(reply.createdAt)}</span>
          </div>
          <div className="mt-2 text-sm text-gray-700">
            <RichContentRenderer body={reply.body} />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <PostLikeButton
              size="sm"
              initialLiked={initialLiked}
              initialCount={reply._count.likes}
              onToggle={async () => {
                const res = await toggleReplyLike(userId, reply.id);
                return res.success ? res.data : null;
              }}
            />

            {isPostAuthor && !reply.isAccepted && (
              <button
                type="button"
                onClick={handleAccept}
                disabled={accepting}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-600 transition"
              >
                {accepting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                )}
                Accept answer
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DiscussionThread({
  discussion,
  userId,
  channel,
}: {
  discussion: DiscussionFull;
  userId: string;
  channel: string;
}) {
  const router = useRouter();
  const [replyBody, setReplyBody] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");
  const [deleting, startDelete] = useTransition();

  const isAuthor = discussion.author.id === userId;
  const follow = discussion.authorFollow ?? { followerCount: 0, isFollowing: false };

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    setPosting(true);
    setPostError("");
    const res = await createReply(userId, discussion.id, replyBody);
    setPosting(false);
    if (!res.success) { setPostError(res.error); return; }
    setReplyBody("");
    router.refresh();
  }

  function handleDelete() {
    if (!confirm("Delete this discussion?")) return;
    startDelete(async () => {
      await deleteDiscussion(userId, discussion.id);
      router.push(`/dashboard/community/${channel}`);
    });
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        {discussion.coverImageUrl && (
          <div className="thread-cover overflow-hidden rounded-2xl ring-1 ring-gray-100">
            <Image
              src={discussion.coverImageUrl}
              alt=""
              width={1200}
              height={500}
              className="h-48 w-full object-cover sm:h-64"
              priority
            />
          </div>
        )}

        <Card className="overflow-hidden">
          <div className="border-b border-gray-100 bg-gradient-to-r from-brand-light/30 to-transparent px-5 py-4">
            <div className="flex flex-wrap items-start gap-4">
              <Link href={`/profile/${discussion.author.username}`}>
                <Avatar
                  src={discussion.author.avatarUrl ?? undefined}
                  alt={discussion.author.fullName}
                  size="md"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${discussion.author.username}`}
                  className="font-semibold hover:text-brand"
                >
                  {discussion.author.fullName}
                </Link>
                <p className="text-xs text-gray-500">
                  @{discussion.author.username} · {formatDate(discussion.createdAt)}
                </p>
                {discussion.author.role === "INSTRUCTOR" && (
                  <Badge variant="accent" className="mt-1 text-[10px]">Instructor</Badge>
                )}
              </div>
              <AuthorFollowButton
                viewerId={userId}
                authorId={discussion.author.id}
                authorUsername={discussion.author.username}
                initialFollowing={follow.isFollowing}
                initialFollowerCount={follow.followerCount}
                size="sm"
              />
            </div>
          </div>

          <div className="px-5 py-5">
            {discussion.excerpt && (
              <p className="mb-4 text-base font-medium leading-relaxed text-gray-600">
                {discussion.excerpt}
              </p>
            )}
            <RichContentRenderer body={discussion.body} />

            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-gray-100 pt-4">
              <PostLikeButton
                initialLiked={discussion.viewerLiked ?? false}
                initialCount={discussion._count.likes}
                onToggle={async () => {
                  const res = await toggleDiscussionLike(userId, discussion.id);
                  return res.success ? res.data : null;
                }}
              />

              {discussion.isResolved && (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />Resolved
                </Badge>
              )}

              {isAuthor && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="ml-auto text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
              )}
            </div>
          </div>
        </Card>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            <MessageSquare className="inline h-4 w-4 mr-1" />
            {discussion.replies.length} {discussion.replies.length === 1 ? "reply" : "replies"}
          </h3>

          {discussion.replies.length > 0 && (
            <div className="space-y-3 mb-5">
              {discussion.replies.map((reply) => (
                <ReplyBubble
                  key={reply.id}
                  reply={reply}
                  userId={userId}
                  isPostAuthor={isAuthor}
                  initialLiked={discussion.viewerLikedReplies?.[reply.id] ?? false}
                />
              ))}
            </div>
          )}

          <form onSubmit={handleReply} className="space-y-2">
            <textarea
              rows={3}
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Write a reply… (links and **bold** supported)"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-brand focus:outline-none resize-none"
              required
            />
            {postError && <p className="text-sm text-red-600">{postError}</p>}
            <Button type="submit" size="sm" disabled={posting}>
              {posting ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
              ) : (
                <Send className="h-3.5 w-3.5 mr-1" />
              )}
              Post reply
            </Button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <Card className="text-sm space-y-3 p-4">
          <h4 className="font-semibold text-gray-700">About this post</h4>
          <dl className="space-y-1 text-gray-500">
            <div className="flex justify-between">
              <dt>Channel</dt>
              <dd className="font-medium text-gray-700">#{channel}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Replies</dt>
              <dd className="font-medium text-gray-700">{discussion._count.replies}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Likes</dt>
              <dd className="font-medium text-gray-700">{discussion._count.likes}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Author followers</dt>
              <dd className="font-medium text-gray-700">{follow.followerCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Status</dt>
              <dd>
                {discussion.isResolved ? (
                  <span className="text-green-600 font-medium">Resolved</span>
                ) : (
                  <span className="text-orange-600 font-medium">Open</span>
                )}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </div>
  );
}
