"use client";

import Image from "next/image";
import Link from "next/link";
import { MessageSquare, ThumbsUp, CheckCircle2, Pin } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { getChannel } from "@/lib/discussions/channels";
import { CommunityChannelIcon } from "@/components/community/CommunityChannelIcon";

type DiscussionSummary = {
  id: string;
  title: string;
  channel: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  isPinned: boolean;
  isResolved: boolean;
  createdAt: Date;
  author: { id: string; fullName: string; username: string; avatarUrl: string | null };
  _count: { replies: number; likes: number };
};

export function DiscussionList({
  items,
  channel,
}: {
  items: DiscussionSummary[];
  channel: string;
  userId: string;
}) {
  const ch = getChannel(channel);

  if (items.length === 0) {
    return (
      <div className="community-feed-empty">
        <div className="community-feed-empty__icon" aria-hidden>
          <MessageSquare className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h3 className="community-feed-empty__title">No threads in {ch?.label ?? channel} yet</h3>
        <p className="community-feed-empty__desc">
          Use the composer on the right to ask a question or share an update with the community.
        </p>
      </div>
    );
  }

  return (
    <div className="community-feed">
      <div className="community-feed__head">
        <h2 className="community-feed__title">Threads</h2>
        <span className="community-feed__count">{items.length} shown</span>
      </div>

      <div className="community-feed__list">
        {items.map((d) => (
          <Link
            key={d.id}
            href={`/dashboard/community/${channel}/${d.id}`}
            className="community-feed-item group"
          >
            {d.isPinned && <span className="community-feed-item__pin-bar" aria-hidden />}
            {d.coverImageUrl && (
              <div className="community-feed-item__cover hidden sm:block">
                <Image
                  src={d.coverImageUrl}
                  alt=""
                  width={120}
                  height={80}
                  className="h-16 w-24 rounded-lg object-cover ring-1 ring-gray-100"
                />
              </div>
            )}
            <div className="community-feed-item__avatar-wrap">
              <Avatar
                src={d.author.avatarUrl ?? undefined}
                alt={d.author.fullName}
                size="md"
                className="ring-2 ring-white shadow-sm"
              />
              {ch && (
                <span className="community-feed-item__channel-badge">
                  <CommunityChannelIcon channel={ch} size="sm" />
                </span>
              )}
            </div>

            <div className="community-feed-item__body">
              <div className="community-feed-item__title-row">
                <h3 className="community-feed-item__title">{d.title}</h3>
                {d.isPinned && (
                  <span className="community-feed-item__badge community-feed-item__badge--pin">
                    <Pin className="h-3 w-3" />
                    Pinned
                  </span>
                )}
                {d.isResolved && (
                  <span className="community-feed-item__badge community-feed-item__badge--resolved">
                    <CheckCircle2 className="h-3 w-3" />
                    Resolved
                  </span>
                )}
              </div>
              {d.excerpt && (
                <p className="community-feed-item__excerpt line-clamp-2">{d.excerpt}</p>
              )}
              <p className="community-feed-item__meta">
                <span className="font-medium text-gray-700">{d.author.fullName}</span>
                <span className="text-gray-300">·</span>
                <span>{formatDate(d.createdAt)}</span>
              </p>
            </div>

            <div className="community-feed-item__stats">
              <span className="community-feed-item__stat">
                <MessageSquare className="h-3.5 w-3.5" />
                {d._count.replies}
              </span>
              <span className="community-feed-item__stat">
                <ThumbsUp className="h-3.5 w-3.5" />
                {d._count.likes}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
