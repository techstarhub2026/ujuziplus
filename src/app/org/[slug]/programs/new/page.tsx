import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireOrgAdmin } from "@/lib/org-access";
import { OrgProgramForm } from "@/components/org/OrgProgramForm";

export default async function OrgNewProgramPage({ params }: { params: { slug: string } }) {
  await requireOrgAdmin(params.slug);

  const org = await db.organization.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!org) notFound();

  return <OrgProgramForm orgId={org.id} orgSlug={params.slug} />;
}
