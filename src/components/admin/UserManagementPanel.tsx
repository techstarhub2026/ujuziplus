"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Ban, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { changeUserRole, suspendUser } from "@/lib/actions/admin";
import { useAppStore } from "@/store/appStore";
import { Role } from "@prisma/client";

type UserItem = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  avatarUrl: string | null;
  _count: { enrollments: number; courses: number };
};

type Props = {
  users: UserItem[];
  total: number;
  page: number;
  pages: number;
  search: string;
  adminId: string;
};

const ROLE_VARIANT: Record<string, "success" | "accent" | "outline" | "secondary"> = {
  ADMIN: "accent", MODERATOR: "secondary",
  INSTRUCTOR: "success", STUDENT: "outline", ORG_ADMIN: "secondary",
};

const ROLES: Role[] = ["STUDENT", "INSTRUCTOR", "MODERATOR", "ADMIN", "ORG_ADMIN"];

export function UserManagementPanel({ users, total, page, pages, search, adminId }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(search);
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  function doSearch(e: React.FormEvent) {
    e.preventDefault();
    router.push(`/admin/users?q=${encodeURIComponent(q)}&page=1`);
  }

  function handleRoleChange(userId: string, role: Role) {
    startTransition(async () => {
      const res = await changeUserRole(adminId, userId, role);
      if (res.success) {
        showToast(`Role updated to ${role}`, "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  }

  function handleSuspend(userId: string, suspend: boolean) {
    startTransition(async () => {
      const res = await suspendUser(adminId, userId, suspend);
      if (res.success) {
        showToast(suspend ? "User suspended" : "User unsuspended", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  }

  return (
    <div>
      {/* Search bar */}
      <form onSubmit={doSearch} className="mb-5 flex gap-2 max-w-sm">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, username…"
        />
        <Button type="submit" variant="secondary" size="sm">Search</Button>
      </form>
      <p className="text-sm text-gray-500 mb-4">{total} user{total !== 1 ? "s" : ""} found</p>

      <Card>
        {users.length === 0 ? (
          <div className="py-14 text-center">
            <Users className="mx-auto h-8 w-8 text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">No users match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4 font-medium">User</th>
                  <th className="pb-3 pr-4 font-medium">Role</th>
                  <th className="pb-3 pr-4 font-medium">Enrolled</th>
                  <th className="pb-3 pr-4 font-medium">Courses</th>
                  <th className="pb-3 pr-4 font-medium">Joined</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={`border-b border-gray-50 last:border-0 ${!u.isActive ? "opacity-50" : ""}`}>
                    <td className="py-3 pr-4">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="flex items-center gap-2 hover:text-brand"
                      >
                        <Avatar src={u.avatarUrl ?? undefined} alt={u.fullName} size="sm" />
                        <div>
                          <p className="font-medium">{u.fullName}</p>
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 pr-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        disabled={isPending || u.id === adminId}
                        className="rounded-md border px-2 py-1 text-xs"
                      >
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{u._count.enrollments}</td>
                    <td className="py-3 pr-4 text-gray-600">{u._count.courses}</td>
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td className="py-3">
                      {u.id !== adminId && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleSuspend(u.id, u.isActive)}
                          disabled={isPending}
                          className={u.isActive ? "text-red-600 hover:text-red-700" : "text-green-600 hover:text-green-700"}
                        >
                          <Ban className="h-3.5 w-3.5 mr-1" />
                          {u.isActive ? "Suspend" : "Unsuspend"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Button asChild variant="secondary" size="sm">
                <a href={`/admin/users?q=${q}&page=${page - 1}`}>← Previous</a>
              </Button>
            )}
            {page < pages && (
              <Button asChild size="sm">
                <a href={`/admin/users?q=${q}&page=${page + 1}`}>Next →</a>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
