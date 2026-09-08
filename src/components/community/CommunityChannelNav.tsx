"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { CHANNELS, type ChannelConfig } from "@/lib/discussions/channels";
import { CommunityChannelIcon } from "@/components/community/CommunityChannelIcon";

export function CommunityChannelNav({
  activeSlug,
  className,
}: {
  activeSlug?: string;
  className?: string;
}) {
  return (
    <nav className={cn("community-channel-nav", className)} aria-label="Community channels">
      <p className="community-channel-nav__label">Channels</p>
      <ul className="community-channel-nav__list">
        {CHANNELS.map((ch) => (
          <li key={ch.slug}>
            <Link
              href={`/dashboard/community/${ch.slug}`}
              className={cn(
                "community-channel-nav__link",
                activeSlug === ch.slug && "community-channel-nav__link--active"
              )}
            >
              <CommunityChannelIcon channel={ch} size="sm" />
              <span>{ch.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function CommunityChannelNavCompact({
  excludeSlug,
}: {
  excludeSlug?: string;
}) {
  const items = CHANNELS.filter((c) => c.slug !== excludeSlug);

  return (
    <div className="community-channel-nav-compact">
      <p className="community-channel-nav__label">Other channels</p>
      <div className="space-y-1">
        {items.map((ch: ChannelConfig) => (
          <Link
            key={ch.slug}
            href={`/dashboard/community/${ch.slug}`}
            className="community-channel-nav-compact__link"
          >
            <CommunityChannelIcon channel={ch} size="sm" />
            <span>{ch.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
