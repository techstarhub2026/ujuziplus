import { AdminProgramForm } from "@/components/admin/AdminProgramForm";
import { getOrgsForSelect } from "@/lib/actions/programs";

export default async function AdminNewProgramPage() {
  const orgs = await getOrgsForSelect();
  return <AdminProgramForm orgs={orgs} />;
}
