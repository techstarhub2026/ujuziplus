"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChannelConfig } from "@/lib/discussions/channels";
import { CommunityChannelIcon } from "@/components/community/CommunityChannelIcon";

export function CommunityChannelCard({
  channel,
  postCount,
  href,
  showCta,
}: {
  channel: ChannelConfig;
  postCount: number;
  href: string;
  showCta?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "community-channel-card group block h-full",
        `community-channel-card--${channel.accent}`
      )}
    >
      <div className="community-channel-card__glow" aria-hidden />
      <div className="community-channel-card__inner">
        <div className="flex items-start justify-between gap-3">
          <CommunityChannelIcon channel={channel} />
          <ArrowUpRight className="community-channel-card__arrow h-4 w-4 shrink-0 opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <div className="mt-5">
          <p className="community-channel-card__tagline">{channel.tagline}</p>
          <h3 className="community-channel-card__title">{channel.label}</h3>
          <p className="community-channel-card__desc">{channel.description}</p>
        </div>

        <div className="community-channel-card__footer">
          <span className="community-channel-card__metric">
            <span className="community-channel-card__metric-value">{postCount}</span>
            <span className="community-channel-card__metric-label">
              {postCount === 1 ? "thread" : "threads"}
            </span>
          </span>
          {showCta ? (
            <span className="community-channel-card__cta">Sign in to join</span>
          ) : (
            <span className="community-channel-card__cta">Open channel</span>
          )}
        </div>
      </div>
    </Link>
  );
}
