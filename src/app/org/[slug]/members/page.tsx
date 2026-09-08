import { getOrgMembers } from "@/lib/actions/org-members";
import { OrgMembersPanel } from "@/components/org/OrgMembersPanel";
import { requireOrgAdmin } from "@/lib/org-access";

export default async function OrgMembersPage({ params }: { params: { slug: string } }) {
  const { session, isOrgAdmin } = await requireOrgAdmin(params.slug);
  const { members, invites } = await getOrgMembers(params.slug);

  return (
    <OrgMembersPanel
      orgSlug={params.slug}
      actorUserId={session.user.id}
      isOrgAdmin={isOrgAdmin}
      members={members}
      invites={invites}
    />
  );
}
