/**
 * /dashboard/community/write — rich story / blog-style composer
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";
import { CHANNELS } from "@/lib/discussions/channels";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card } from "@/components/ui/card";
import { RichPostComposer } from "@/components/community/RichPostComposer";
import { getAuthSession } from "@/lib/auth-server";

interface Props {
  searchParams: { channel?: string };
}

export default async function CommunityWritePage({ searchParams }: Props) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login?callbackUrl=/dashboard/community/write");

  const defaultChannel =
    CHANNELS.find((c) => c.slug === searchParams.channel)?.slug ?? "showcase";

  return (
    <div className="community-hub animate-fade-in">
      <PageHeader
        variant="hero"
        banner="community"
        title="Write a story"
        description="Publish project write-ups, lab notes, and community blogs with images, links, and rich formatting"
        breadcrumbs={[
          { label: "Community", href: "/dashboard/community" },
          { label: "Write" },
        ]}
        action={
          <Link
            href={`/dashboard/community/${defaultChannel}`}
            className="hero-action-secondary inline-flex items-center gap-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to channel
          </Link>
        }
      />

      <Card className="community-compose-card mx-auto max-w-3xl p-6 shadow-card ring-1 ring-gray-100/80 sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <PenLine className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold text-navy">Rich post composer</h2>
            <p className="text-sm text-gray-500">
              Images, links, headings — formatted for readers across the network
            </p>
          </div>
        </div>
        <RichPostComposer
          userId={session.user.id}
          defaultChannel={defaultChannel}
          variant="full"
        />
      </Card>
    </div>
  );
}
