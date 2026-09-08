import { getPendingInstructors } from "@/lib/actions/admin";
import { PendingInstructorsPanel } from "@/components/admin/PendingInstructorsPanel";
import { getAuthSession } from "@/lib/auth-server";

export default async function AdminInstructorsPage() {
  const session = await getAuthSession();
  const applicants = await getPendingInstructors();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Instructor Applications</h1>
      <PendingInstructorsPanel applicants={applicants} adminId={session!.user.id} />
    </div>
  );
}
