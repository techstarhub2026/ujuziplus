import {
  getMentorUsersForLinking,
  getCoursesForMentorLinking,
  getKitsForMentorLinking,
} from "@/lib/actions/mentors";
import { AdminMentorForm } from "@/components/admin/AdminMentorForm";

export default async function AdminNewMentorPage() {
  const [linkableUsers, courses, kits] = await Promise.all([
    getMentorUsersForLinking(),
    getCoursesForMentorLinking(),
    getKitsForMentorLinking(),
  ]);

  return (
    <AdminMentorForm linkableUsers={linkableUsers} courses={courses} kits={kits} />
  );
}
