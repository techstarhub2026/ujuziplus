"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleProjectLike } from "@/lib/actions/projects";
import { useAppStore } from "@/store/appStore";

export function ProjectLikeButton({
  userId,
  projectId,
  initialLiked,
  initialCount,
}: {
  userId: string;
  projectId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const res = await toggleProjectLike(userId, projectId);
          if (res.success) showToast(res.data.liked ? "Liked!" : "Unliked", "success");
        });
      }}
    >
      {initialLiked ? "Unlike" : "Like"} ({initialCount})
    </Button>
  );
}
