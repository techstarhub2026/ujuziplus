import { getAdminMentorRequests } from "@/lib/actions/mentors";
import { AdminMentorRequestsClient } from "@/components/admin/AdminMentorRequestsClient";

export default async function AdminMentorRequestsPage() {
  const requests = await getAdminMentorRequests();
  return <AdminMentorRequestsClient requests={requests} />;
}
