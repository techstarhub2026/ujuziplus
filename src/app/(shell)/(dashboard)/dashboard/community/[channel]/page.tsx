/**
 * /dashboard/community/[channel] — filtered feed (same layout as hub)
 */

import { notFound, redirect } from "next/navigation";
import { CHANNELS } from "@/lib/discussions/channels";
import { getChannelDiscussions } from "@/lib/actions/discussions";
import { db } from "@/lib/db";
import { CommunityHubLayout } from "@/components/community/CommunityHubLayout";
import { getAuthSession } from "@/lib/auth-server";

interface Props {
  params: { channel: string };
}

export default async function ChannelPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/dashboard/community/${params.channel}`)}`);
  }

  const channel = CHANNELS.find((c) => c.slug === params.channel);
  if (!channel) notFound();

  const [{ items, total }, channelCounts] = await Promise.all([
    getChannelDiscussions(params.channel, 1, 40),
    Promise.all(
      CHANNELS.map(async (ch) => ({
        slug: ch.slug,
        count: await db.discussion.count({ where: { channel: ch.slug, courseId: null } }),
      }))
    ),
  ]);

  const postCounts = Object.fromEntries(channelCounts.map((c) => [c.slug, c.count]));

  return (
    <CommunityHubLayout
      items={items}
      total={total}
      activeChannel={params.channel}
      postCounts={postCounts}
      userId={session.user.id}
      userName={session.user.name ?? undefined}
      avatarUrl={session.user.image}
    />
  );
}
