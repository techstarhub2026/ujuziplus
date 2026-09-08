import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/lib/actions/org-kits";
import { getOrgNavItems, requireOrgPageAccess } from "@/lib/org-access";
import { OrgShell } from "@/components/layout/OrgShell";

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const org = await getOrganizationBySlug(params.slug);
  if (!org) notFound();

  const access = await requireOrgPageAccess(params.slug);
  const nav = getOrgNavItems(params.slug, access);

  return (
    <OrgShell orgName={org.name} nav={nav}>
      {children}
    </OrgShell>
  );
}
