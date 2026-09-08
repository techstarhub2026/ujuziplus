"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/lib/actions/projects";
import { useAppStore } from "@/store/appStore";

export function ProjectCardActions({ userId, projectId, title }: { userId: string; projectId: string; title: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;

    startTransition(async () => {
      const res = await deleteProject(userId, projectId);
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
      <Trash2 className="h-3.5 w-3.5 mr-1" />Delete
    </Button>
  );
}
