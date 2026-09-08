import { getAdminOrgKitRequests } from "@/lib/actions/org-kits";
import { AdminKitRequestsPanel } from "@/components/admin/AdminKitRequestsPanel";

export default async function AdminKitRequestsPage() {
  const requests = await getAdminOrgKitRequests();
  return <AdminKitRequestsPanel requests={requests} />;
}
