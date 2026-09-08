"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteShowcaseProject } from "@/lib/actions/showcase";
import { useAppStore } from "@/store/appStore";

export function ShowcaseSubmissionActions({ projectId, title }: { projectId: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  const handleDelete = () => {
    if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;

    startTransition(async () => {
      const res = await deleteShowcaseProject(projectId);
      if (res.success) {
        showToast("Project deleted", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Delete failed", "error");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
      disabled={isPending}
      onClick={handleDelete}
    >
      <Trash2 className="h-3 w-3" />
    </Button>
  );
}
