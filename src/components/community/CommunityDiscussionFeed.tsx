"use client";

import Image from "next/image";
import Link from "next/link";
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle2,
  Pin,
  Sparkles,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import { getChannel } from "@/lib/discussions/channels";
import { CommunityChannelIcon } from "@/components/community/CommunityChannelIcon";
import { Reveal } from "@/components/motion/Reveal";

export type CommunityDiscussionItem = {
  id: string;
  title: string;
  channel: string;
  href: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  isPinned?: boolean;
  isResolved?: boolean;
  createdAt: Date;
  author: { fullName: string; username?: string; avatarUrl: string | null };
  _count: { replies: number; likes: number };
};

export function CommunityDiscussionFeed({
  items,
  emptyTitle = "The conversation starts here",
  emptyDescription = "Be the first to post a question, share a build, or welcome a new learner.",
  emptyAction,
  title = "Discussions",
}: {
  items: CommunityDiscussionItem[];
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  title?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="community-feed-empty">
        <div className="community-feed-empty__icon" aria-hidden>
          <MessageSquare className="h-7 w-7" strokeWidth={1.5} />
        </div>
        <h3 className="community-feed-empty__title">{emptyTitle}</h3>
        <p className="community-feed-empty__desc">{emptyDescription}</p>
        {emptyAction && <div className="mt-6">{emptyAction}</div>}
      </div>
    );
  }

  return (
    <div className="community-feed">
      <div className="community-feed__head">
        <h2 className="community-feed__title">{title}</h2>
        <span className="community-feed__count">{items.length} active</span>
      </div>

      <div className="community-feed__list">
        {items.map((d, i) => {
          const ch = getChannel(d.channel);
          return (
            <Reveal key={d.id} delay={Math.min(i * 0.04, 0.2)}>
              <Link href={d.href} className="community-feed-item group">
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
                    {ch && (
                      <>
                        <span className="text-gray-300">·</span>
                        <span className="text-navy/70">{ch.label}</span>
                      </>
                    )}
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
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

export function CommunityStatsStrip({
  totalThreads,
  channelCount,
  activeChannels,
}: {
  totalThreads: number;
  channelCount: number;
  activeChannels: number;
}) {
  return (
    <div className="community-stats-strip">
      <div className="community-stats-strip__item">
        <Sparkles className="h-4 w-4 text-brand" />
        <div>
          <p className="community-stats-strip__value">{totalThreads}</p>
          <p className="community-stats-strip__label">Threads</p>
        </div>
      </div>
      <div className="community-stats-strip__divider" />
      <div className="community-stats-strip__item">
        <p className="community-stats-strip__value">{channelCount}</p>
        <p className="community-stats-strip__label">Channels</p>
      </div>
      <div className="community-stats-strip__divider" />
      <div className="community-stats-strip__item">
        <p className="community-stats-strip__value">{activeChannels}</p>
        <p className="community-stats-strip__label">With activity</p>
      </div>
    </div>
  );
}
