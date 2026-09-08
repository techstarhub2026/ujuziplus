"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptOrgInvite } from "@/lib/actions/org-members";
import { useAppStore } from "@/store/appStore";

export function AcceptOrgInviteButton({
  userId,
  token,
}: {
  userId: string;
  token: string;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      className="mt-6 w-full"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await acceptOrgInvite(userId, token);
          if (res.success && res.data) {
            showToast(`Welcome to the organization!`, "success");
            router.push(`/org/${res.data.orgSlug}/dashboard`);
          } else showToast(!res.success ? res.error : "Failed", "error");
        });
      }}
    >
      Accept invitation
    </Button>
  );
}
