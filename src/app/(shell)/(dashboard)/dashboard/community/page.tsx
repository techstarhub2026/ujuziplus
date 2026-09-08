/**
 * /dashboard/community — feed-first hub: discussions + composer up front
 */

import { redirect } from "next/navigation";
import { CHANNELS } from "@/lib/discussions/channels";
import { getRecentDiscussions } from "@/lib/actions/discussions";
import { db } from "@/lib/db";
import { CommunityHubLayout } from "@/components/community/CommunityHubLayout";
import { getAuthSession } from "@/lib/auth-server";

export default async function CommunityHubPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login?callbackUrl=/dashboard/community");

  const [{ items, total }, channelCounts] = await Promise.all([
    getRecentDiscussions(undefined, 1, 40),
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
      postCounts={postCounts}
      userId={session.user.id}
      userName={session.user.name ?? undefined}
      avatarUrl={session.user.image}
    />
  );
}
