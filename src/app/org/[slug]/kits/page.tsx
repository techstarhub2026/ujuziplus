import { getOrgKitInventory, getOrgKitRequests } from "@/lib/actions/org-kits";
import { requireOrgStaff } from "@/lib/org-access";
import { OrgKitsPanel } from "@/components/org/OrgKitsPanel";

export default async function OrgKitsPage({ params }: { params: { slug: string } }) {
  const { session, isOrgAdmin } = await requireOrgStaff(params.slug);

  const [inventory, requests] = await Promise.all([
    getOrgKitInventory(params.slug),
    getOrgKitRequests(params.slug),
  ]);

  return (
    <OrgKitsPanel
      orgSlug={params.slug}
      userId={session.user.id}
      isOrgAdmin={isOrgAdmin}
      inventory={inventory}
      requests={requests}
    />
  );
}
