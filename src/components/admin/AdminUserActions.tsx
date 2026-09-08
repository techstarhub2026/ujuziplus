"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { changeUserRole, suspendUser } from "@/lib/actions/admin";
import { useAppStore } from "@/store/appStore";
import type { Role } from "@prisma/client";

const ROLES: Role[] = ["STUDENT", "INSTRUCTOR", "MODERATOR", "ADMIN", "ORG_ADMIN"];

export function AdminUserActions({
  userId,
  currentRole,
  isActive,
}: {
  userId: string;
  currentRole: Role;
  isActive: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);
  const adminId = session?.user?.id;
  const isSelf = adminId === userId;

  function handleRole(role: Role) {
    if (!adminId) return;
    startTransition(async () => {
      const res = await changeUserRole(adminId, userId, role);
      if (res.success) {
        showToast(`Role set to ${role}`, "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  }

  function handleSuspend(suspend: boolean) {
    if (!adminId) return;
    startTransition(async () => {
      const res = await suspendUser(adminId, userId, suspend);
      if (res.success) {
        showToast(suspend ? "User suspended" : "User reactivated", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  }

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border bg-gray-50 p-4">
      <label className="text-sm font-medium text-gray-700">Role</label>
      <select
        value={currentRole}
        disabled={isPending || isSelf}
        onChange={(e) => handleRole(e.target.value as Role)}
        className="rounded-lg border px-3 py-2 text-sm"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>

      {!isSelf && (
        <Button
          variant={isActive ? "destructive" : "secondary"}
          size="sm"
          disabled={isPending}
          onClick={() => handleSuspend(isActive)}
        >
          {isActive ? "Suspend account" : "Reactivate account"}
        </Button>
      )}
      {isSelf && (
        <p className="text-xs text-gray-500">You cannot change your own role or suspend yourself.</p>
      )}
    </div>
  );
}
