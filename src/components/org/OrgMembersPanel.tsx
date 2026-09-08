"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import {
  inviteOrgMember,
  revokeOrgInvite,
  removeOrgMember,
} from "@/lib/actions/org-members";
import { OrgMembersBulkImport } from "@/components/org/OrgMembersBulkImport";
import { useAppStore } from "@/store/appStore";
import type { OrgMemberRole } from "@prisma/client";

type MemberRow = {
  id: string;
  role: OrgMemberRole;
  user: {
    id: string;
    fullName: string;
    email: string;
    username: string;
    avatarUrl: string | null;
  };
};

type InviteRow = {
  id: string;
  email: string;
  role: OrgMemberRole;
  expiresAt: Date;
  createdAt: Date;
};

export function OrgMembersPanel({
  orgSlug,
  actorUserId,
  isOrgAdmin,
  members,
  invites,
}: {
  orgSlug: string;
  actorUserId: string;
  isOrgAdmin: boolean;
  members: MemberRow[];
  invites: InviteRow[];
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgMemberRole>("MEMBER");
  const [isPending, startTransition] = useTransition();

  const sendInvite = () => {
    startTransition(async () => {
      const res = await inviteOrgMember(actorUserId, orgSlug, { email, role });
      if (res.success) {
        showToast("Invitation sent", "success");
        setEmail("");
        router.refresh();
      } else showToast(res.error ?? "Failed", "error");
    });
  };

  return (
    <div>
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Members</h1>
          <p className="text-sm text-gray-500">{members.length} active members</p>
        </div>
      </div>

      {isOrgAdmin && (
        <>
          <OrgMembersBulkImport orgSlug={orgSlug} actorUserId={actorUserId} />
          <Card className="mb-6 p-4 space-y-3">
          <h3 className="font-semibold text-sm">Invite by email</h3>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <Input
              label="Email"
              type="email"
              placeholder="colleague@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <label className="text-sm block">
              <span className="font-medium">Role</span>
              <select
                className="mt-1 block w-full rounded-lg border px-3 py-2"
                value={role}
                onChange={(e) => setRole(e.target.value as OrgMemberRole)}
              >
                <option value="MEMBER">Member</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <Button disabled={isPending || !email.trim()} onClick={sendInvite}>
              Send invite
            </Button>
          </div>
          <p className="text-xs text-gray-400">
            Invites expire in 7 days. The recipient must sign in with the same email to accept.
          </p>
        </Card>
        </>
      )}

      {invites.length > 0 && (
        <Card className="mb-6 p-4">
          <h3 className="font-semibold text-sm mb-3">Pending invitations</h3>
          <ul className="space-y-2">
            {invites.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm border-b pb-2 last:border-0"
              >
                <span>
                  {inv.email}{" "}
                  <Badge variant="outline" className="ml-1 capitalize">
                    {inv.role.toLowerCase()}
                  </Badge>
                  <span className="text-gray-400 ml-2">
                    expires {new Date(inv.expiresAt).toLocaleDateString("en-TZ")}
                  </span>
                </span>
                {isOrgAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    onClick={() => {
                      startTransition(async () => {
                        const res = await revokeOrgInvite(actorUserId, orgSlug, inv.id);
                        if (res.success) router.refresh();
                      });
                    }}
                  >
                    Revoke
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left text-gray-500">
              <th className="p-3">Member</th>
              <th>Role</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-b">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Avatar src={m.user.avatarUrl ?? undefined} alt={m.user.fullName} size="sm" />
                    <div>
                      <div className="font-medium">{m.user.fullName}</div>
                      <div className="text-gray-500">{m.user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <Badge variant="outline" className="capitalize">
                    {m.role.toLowerCase()}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/profile/${m.user.username}`}>Profile</Link>
                  </Button>
                  {isOrgAdmin && m.user.id !== actorUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 ml-1"
                      disabled={isPending}
                      onClick={() => {
                        if (!confirm(`Remove ${m.user.fullName} from the organization?`)) return;
                        startTransition(async () => {
                          const res = await removeOrgMember(actorUserId, orgSlug, m.user.id);
                          if (res.success) router.refresh();
                          else showToast(res.error ?? "Failed", "error");
                        });
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {members.length === 0 && (
          <p className="p-8 text-center text-gray-500">No members yet. Send an invite to get started.</p>
        )}
      </Card>
    </div>
  );
}
