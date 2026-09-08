"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminDeleteOpenKnowledgeResource } from "@/lib/actions/open-knowledge";
import { useAppStore } from "@/store/appStore";

export function AdminOpenKnowledgeRowActions({
  id,
  slug,
  title,
  viewHref,
}: {
  id: string;
  slug: string;
  title: string;
  viewHref: string;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await adminDeleteOpenKnowledgeResource(id);
      if (res.success) {
        showToast("Resource deleted", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Delete failed", "error");
      }
    });
  };

  return (
    <div className="flex gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/open-knowledge/${slug}/edit`}>Edit</Link>
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={viewHref} target="_blank" rel="noopener noreferrer">
          View
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
        disabled={isPending}
        onClick={handleDelete}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
