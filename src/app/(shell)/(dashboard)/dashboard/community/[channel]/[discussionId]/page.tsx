/**
 * /dashboard/community/[channel]/[discussionId] — single discussion thread
 */

import { notFound, redirect } from "next/navigation";
import { CHANNELS } from "@/lib/discussions/channels";
import { getDiscussion } from "@/lib/actions/discussions";
import { PageHeader } from "@/components/shared/PageHeader";
import { DiscussionThread } from "@/components/community/DiscussionThread";
import { getAuthSession } from "@/lib/auth-server";

interface Props { params: { channel: string; discussionId: string } }

export default async function DiscussionPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session)
    redirect(
      `/auth/login?callbackUrl=${encodeURIComponent(`/dashboard/community/${params.channel}/${params.discussionId}`)}`
    );

  const discussion = await getDiscussion(params.discussionId, session.user.id);
  if (!discussion) notFound();

  const channel = CHANNELS.find((c) => c.slug === params.channel);

  return (
    <div className="animate-fade-in">
      <PageHeader
        title={discussion.title}
        breadcrumbs={[
          { label: "Community", href: "/dashboard/community" },
          { label: `#${channel?.label ?? params.channel}`, href: `/dashboard/community/${params.channel}` },
          { label: discussion.title.slice(0, 30) + (discussion.title.length > 30 ? "…" : "") },
        ]}
      />

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm ring-1 ring-gray-100 sm:p-6">
        <DiscussionThread
          discussion={discussion}
          userId={session.user.id}
          channel={params.channel}
        />
      </div>
    </div>
  );
}
