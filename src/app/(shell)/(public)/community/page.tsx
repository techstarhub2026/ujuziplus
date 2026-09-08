import { getCommunityPreview } from "@/lib/actions/discussions";
import { CommunityHubLayout } from "@/components/community/CommunityHubLayout";

export const dynamic = "force-dynamic";

export default async function CommunityPreviewPage() {
  const { recent, postCounts, total } = await getCommunityPreview();

  return (
    <div className="learner-canvas mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <CommunityHubLayout
        items={recent}
        total={total}
        postCounts={postCounts}
        guest
        feedBasePath="/dashboard/community"
      />
    </div>
  );
}
