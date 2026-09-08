import { notFound } from "next/navigation";
import { AdminKitForm } from "@/components/admin/AdminKitForm";
import { getKitById } from "@/lib/actions/kits";
import { serializeKitForClient } from "@/lib/serialize";

export default async function AdminEditKitPage({
  params,
}: {
  params: { kitId: string };
}) {
  const kit = await getKitById(params.kitId);
  if (!kit) notFound();

  return <AdminKitForm kitId={params.kitId} initialKit={serializeKitForClient(kit)} />;
}
