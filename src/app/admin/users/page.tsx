/**
 * /admin/users — user management
 */

import { getAllUsers } from "@/lib/actions/admin";
import { UserManagementPanel } from "@/components/admin/UserManagementPanel";
import { getAuthSession } from "@/lib/auth-server";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { page?: string; q?: string };
}) {
  const session = await getAuthSession();
  const page = Number(searchParams.page ?? 1);
  const search = searchParams.q ?? "";

  const { users, total, pages } = await getAllUsers(page, 30, search);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UserManagementPanel
        users={users}
        total={total}
        page={page}
        pages={pages}
        search={search}
        adminId={session!.user.id}
      />
    </div>
  );
}
