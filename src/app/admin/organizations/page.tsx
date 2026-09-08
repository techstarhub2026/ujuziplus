import { getAdminOrganizations } from "@/lib/actions/organizations";
import { AdminOrganizationsPanel } from "@/components/admin/AdminOrganizationsPanel";

export default async function AdminOrganizationsPage() {
  const organizations = await getAdminOrganizations();
  return <AdminOrganizationsPanel organizations={organizations} />;
}
