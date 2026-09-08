"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerForCompetition } from "@/lib/actions/competitions";
import { useAppStore } from "@/store/appStore";
import { useRouter } from "next/navigation";

export function CompetitionRegisterButton({
  userId,
  competitionSlug,
  isRegistered,
  open,
}: {
  userId: string;
  competitionSlug: string;
  isRegistered: boolean;
  open: boolean;
}) {
  const [teamName, setTeamName] = useState("");
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();

  if (!open) {
    return (
      <Button size="sm" variant="secondary" disabled>
        {isRegistered ? "Team registered" : "Registration closed"}
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
      {!isRegistered && (
        <Input
          label="Team name (optional)"
          placeholder="Innovators TZ"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="flex-1"
        />
      )}
      <Button
        size="sm"
        variant={isRegistered ? "secondary" : "primary"}
        disabled={isRegistered || isPending}
        onClick={() => {
          startTransition(async () => {
            const res = await registerForCompetition(userId, competitionSlug, teamName);
            if (res.success) {
              showToast("Team registered!", "success");
              router.refresh();
            } else {
              showToast(res.error ?? "Failed", "error");
            }
          });
        }}
      >
        {isRegistered ? "Registered" : "Register team"}
      </Button>
    </div>
  );
}
