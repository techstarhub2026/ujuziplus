"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenLine, Sparkles, ImageIcon } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { RichPostComposer } from "@/components/community/RichPostComposer";
import { CHANNELS } from "@/lib/discussions/channels";

export function CommunityComposerBar({
  userId,
  defaultChannel = "general",
  avatarUrl,
  userName,
}: {
  userId: string;
  defaultChannel?: string;
  avatarUrl?: string | null;
  userName?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [channel, setChannel] = useState(defaultChannel);

  if (!open) {
    return (
      <div className="community-composer-bar">
        <Avatar src={avatarUrl ?? undefined} alt={userName ?? "You"} size="md" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="community-composer-bar__prompt"
        >
          Ask a question or share what you&apos;re building…
        </button>
        <div className="community-composer-bar__actions">
          <Link
            href={`/dashboard/community/write?channel=${defaultChannel}`}
            className="community-composer-bar__action"
            title="Write a story with photos"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Story</span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="community-composer-bar__post-btn"
          >
            <PenLine className="h-4 w-4" />
            Post
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="community-composer-expanded">
      <div className="community-composer-expanded__head">
        <h3 className="font-display text-sm font-bold text-navy">New discussion</h3>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          Cancel
        </button>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="text-xs font-semibold text-gray-500">Channel</label>
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium focus:ring-2 focus:ring-brand focus:outline-none"
        >
          {CHANNELS.map((ch) => (
            <option key={ch.slug} value={ch.slug}>
              {ch.label}
            </option>
          ))}
        </select>
        <Link
          href={`/dashboard/community/write?channel=${channel}`}
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline"
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Add photos &amp; cover
        </Link>
      </div>

      <RichPostComposer
        userId={userId}
        defaultChannel={channel}
        variant="compact"
        onSuccess={(id) => {
          setOpen(false);
          router.refresh();
          router.push(`/dashboard/community/${channel}/${id}`);
        }}
      />
    </div>
  );
}

export function CommunityComposerBarGuest() {
  return (
    <div className="community-composer-bar community-composer-bar--guest">
      <div className="community-composer-bar__prompt community-composer-bar__prompt--static">
        Join the conversation — ask questions, share projects, and learn from peers.
      </div>
      <div className="community-composer-bar__actions">
        <Link href="/auth/register" className="community-composer-bar__post-btn">
          Sign up free
        </Link>
        <Link href="/auth/login" className="community-composer-bar__action">
          Sign in
        </Link>
      </div>
    </div>
  );
}
