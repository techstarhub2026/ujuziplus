import { db } from "@/lib/db";
import { requireOrgAdmin } from "@/lib/org-access";
import { OrgSettingsPanel } from "@/components/org/OrgSettingsPanel";

export default async function OrgSettingsPage({ params }: { params: { slug: string } }) {
  const { session, isOrgAdmin } = await requireOrgAdmin(params.slug);

  const org = await db.organization.findUnique({ where: { slug: params.slug } });
  if (!org) return null;

  return (
    <OrgSettingsPanel
      orgSlug={params.slug}
      actorUserId={session.user.id}
      isOrgAdmin={isOrgAdmin}
      initial={{ name: org.name, logoUrl: org.logoUrl, type: org.type }}
    />
  );
}
