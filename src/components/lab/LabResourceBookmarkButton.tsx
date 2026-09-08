"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleLabResourceBookmark } from "@/lib/actions/lab-resources";
import { useAppStore } from "@/store/appStore";

export function LabResourceBookmarkButton({
  userId,
  resourceId,
  initialSaved,
  title,
}: {
  userId: string;
  resourceId: string;
  initialSaved: boolean;
  title: string;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  return (
    <Button
      disabled={isPending}
      variant={saved ? "primary" : "outline"}
      onClick={() => {
        startTransition(async () => {
          const res = await toggleLabResourceBookmark(userId, resourceId);
          if (res.success) {
            setSaved(res.data.saved);
            showToast(res.data.saved ? `Saved ${title}` : "Removed from My lab", "success");
          }
        });
      }}
    >
      {saved ? "Saved to My lab" : "Add to My lab"}
    </Button>
  );
}
