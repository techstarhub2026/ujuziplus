import { getLabResources, getUserLabResourceIds } from "@/lib/actions/lab-resources";
import { LabResourcesClient } from "@/components/lab/LabResourcesClient";
import { getAuthSession } from "@/lib/auth-server";

export default async function LabResourcesPage() {
  const session = await getAuthSession();
  const resources = await getLabResources();
  const savedIds = session?.user?.id ? await getUserLabResourceIds(session.user.id) : [];

  return (
    <LabResourcesClient
      resources={resources.map((r) => ({
        id: r.id,
        slug: r.slug,
        title: r.title,
        type: r.type,
        category: r.category,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
      }))}
      savedIds={savedIds}
      userId={session?.user?.id ?? null}
    />
  );
}
