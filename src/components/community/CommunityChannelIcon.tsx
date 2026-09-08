"use client";

import {
  MessageSquare,
  CircleHelp,
  Rocket,
  Briefcase,
  Megaphone,
  Handshake,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChannelConfig } from "@/lib/discussions/channels";

const ICONS: Record<ChannelConfig["icon"], LucideIcon> = {
  messages: MessageSquare,
  help: CircleHelp,
  rocket: Rocket,
  briefcase: Briefcase,
  megaphone: Megaphone,
  handshake: Handshake,
};

export function CommunityChannelIcon({
  channel,
  size = "md",
  className,
}: {
  channel: Pick<ChannelConfig, "icon" | "accent">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const Icon = ICONS[channel.icon];
  const sizeClass =
    size === "lg" ? "community-channel-icon--lg" : size === "sm" ? "community-channel-icon--sm" : "";

  return (
    <span
      className={cn(
        "community-channel-icon",
        `community-channel-icon--${channel.accent}`,
        sizeClass,
        className
      )}
      aria-hidden
    >
      <Icon className="community-channel-icon__glyph" strokeWidth={1.75} />
    </span>
  );
}
