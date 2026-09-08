"use client";

import type { ChannelConfig } from "@/lib/discussions/channels";
import { CommunityChannelCard } from "@/components/community/CommunityChannelCard";
import { RevealStagger, RevealItem } from "@/components/motion/RevealStagger";

export type CommunityChannelGridItem = ChannelConfig & {
  href: string;
  postCount: number;
};

export function CommunityChannelsGrid({
  channels,
  showCta,
}: {
  channels: readonly CommunityChannelGridItem[];
  showCta?: boolean;
}) {
  return (
    <RevealStagger className="community-channels-grid">
      {channels.map((ch) => (
        <RevealItem key={ch.slug}>
          <CommunityChannelCard
            channel={ch}
            postCount={ch.postCount}
            href={ch.href}
            showCta={showCta}
          />
        </RevealItem>
      ))}
    </RevealStagger>
  );
}
