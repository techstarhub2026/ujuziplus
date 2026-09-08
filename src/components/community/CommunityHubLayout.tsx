import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { CHANNELS } from "@/lib/discussions/channels";
import { CommunityComposerBar, CommunityComposerBarGuest } from "@/components/community/CommunityComposerBar";
import { CommunityChannelPills } from "@/components/community/CommunityChannelPills";
import { CommunityDiscussionFeed } from "@/components/community/CommunityDiscussionFeed";
import { CommunityChannelNav } from "@/components/community/CommunityChannelNav";
import { getChannel } from "@/lib/discussions/channels";
import { CommunityChannelIcon } from "@/components/community/CommunityChannelIcon";

type FeedItem = {
  id: string;
  title: string;
  channel: string;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  isPinned?: boolean;
  isResolved?: boolean;
  createdAt: Date;
  author: { fullName: string; username?: string; avatarUrl: string | null };
  _count: { replies: number; likes: number };
};

export function CommunityHubLayout({
  items,
  total,
  activeChannel,
  postCounts,
  userId,
  userName,
  avatarUrl,
  guest = false,
  feedBasePath = "/dashboard/community",
}: {
  items: FeedItem[];
  total: number;
  activeChannel?: string;
  postCounts: Record<string, number>;
  userId?: string;
  userName?: string;
  avatarUrl?: string | null;
  guest?: boolean;
  feedBasePath?: string;
}) {
  const channel = activeChannel ? getChannel(activeChannel) : null;
  const loginCallback = guest
    ? `/auth/login?callbackUrl=`
    : undefined;

  return (
    <div className="community-hub community-hub--feed-first">
      <header className="community-hub-header">
        <div>
          <h1 className="community-hub-header__title">
            {channel ? channel.label : "Community"}
          </h1>
          <p className="community-hub-header__desc">
            {channel
              ? channel.description
              : "Discussions from learners, educators, and builders across Africa"}
          </p>
        </div>
        <div className="community-hub-header__meta">
          <MessageSquare className="h-4 w-4 text-brand" />
          <span>
            <strong>{total}</strong> {total === 1 ? "discussion" : "discussions"}
          </span>
        </div>
      </header>

      <CommunityChannelPills
        activeChannel={activeChannel}
        postCounts={postCounts}
        basePath={feedBasePath}
        loginBase={loginCallback}
      />

      <div className="community-hub-grid">
        <main className="community-hub-main">
          {guest ? (
            <CommunityComposerBarGuest />
          ) : userId ? (
            <CommunityComposerBar
              userId={userId}
              defaultChannel={activeChannel ?? "general"}
              avatarUrl={avatarUrl}
              userName={userName}
            />
          ) : null}

          {channel && (
            <div className="community-hub-channel-banner">
              <CommunityChannelIcon channel={channel} size="lg" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand">
                  {channel.tagline}
                </p>
                <p className="text-sm text-gray-500">
                  Showing threads in {channel.label}
                  {!guest && (
                    <>
                      {" · "}
                      <Link href={feedBasePath} className="font-medium text-brand hover:underline">
                        View all topics
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          <CommunityDiscussionFeed
            items={items.map((d) => ({
              ...d,
              href: guest
                ? `/auth/login?callbackUrl=${encodeURIComponent(`${feedBasePath}/${d.channel}/${d.id}`)}`
                : `${feedBasePath}/${d.channel}/${d.id}`,
            }))}
            emptyTitle={channel ? `No threads in ${channel.label} yet` : "Start the conversation"}
            emptyDescription={
              guest
                ? "Sign in to read full threads and post your own questions or project updates."
                : "Be the first to post — use the box above to ask a question or share a build."
            }
            emptyAction={
              guest ? (
                <Link href="/auth/register" className="hero-action-primary inline-flex text-sm">
                  Create free account
                </Link>
              ) : undefined
            }
          />
        </main>

        {!guest && (
          <aside className="community-hub-sidebar">
            <div className="community-hub-sidebar__card">
              <CommunityChannelNav activeSlug={activeChannel} />
            </div>
            <div className="community-hub-sidebar__card community-hub-sidebar__tips">
              <h4 className="font-display text-sm font-bold text-navy">Quick tips</h4>
              <ul className="mt-2 space-y-2 text-xs leading-relaxed text-gray-500">
                <li>Use <strong className="text-gray-700">Q&amp;A</strong> for technical help</li>
                <li>Use <strong className="text-gray-700">Showcase</strong> for project stories with photos</li>
                <li>Like and follow authors you learn from</li>
              </ul>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
