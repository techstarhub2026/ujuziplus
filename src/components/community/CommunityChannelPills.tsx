"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CHANNELS } from "@/lib/discussions/channels";
import { CommunityChannelIcon } from "@/components/community/CommunityChannelIcon";

export function CommunityChannelPills({
  activeChannel,
  postCounts,
  basePath = "/dashboard/community",
  loginBase,
}: {
  activeChannel?: string;
  postCounts?: Record<string, number>;
  basePath?: string;
  /** When set, links go to login with callback instead of dashboard */
  loginBase?: string;
}) {
  const allHref = loginBase
    ? `${loginBase}${encodeURIComponent(basePath)}`
    : basePath;

  function hrefFor(slug: string) {
    if (loginBase) {
      return `${loginBase}${encodeURIComponent(`${basePath}/${slug}`)}`;
    }
    return slug ? `${basePath}/${slug}` : basePath;
  }

  return (
    <div className="community-channel-pills" role="tablist" aria-label="Filter by channel">
      <Link
        href={allHref}
        className={cn(
          "community-channel-pill",
          !activeChannel && "community-channel-pill--active"
        )}
        role="tab"
        aria-selected={!activeChannel}
      >
        All topics
      </Link>
      {CHANNELS.map((ch) => (
        <Link
          key={ch.slug}
          href={hrefFor(ch.slug)}
          className={cn(
            "community-channel-pill",
            activeChannel === ch.slug && "community-channel-pill--active"
          )}
          role="tab"
          aria-selected={activeChannel === ch.slug}
        >
          <CommunityChannelIcon channel={ch} size="sm" />
          <span>{ch.label}</span>
          {postCounts && postCounts[ch.slug] > 0 && (
            <span className="community-channel-pill__count">{postCounts[ch.slug]}</span>
          )}
        </Link>
      ))}
    </div>
  );
}
