"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Star, ExternalLink, Github, Eye, Trash2 } from "lucide-react";
import { ShowcaseStatus } from "@prisma/client";
import { useAppStore } from "@/store/appStore";

type Project = {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  status: ShowcaseStatus;
  isFeatured: boolean;
  thumbnailUrl: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  videoUrl: string | null;
  track: string | null;
  likeCount: number;
  viewCount: number;
  createdAt: Date;
  user: { id: string; fullName: string; email: string; username: string | null; avatarUrl: string | null };
};

const STATUS_FILTER_OPTIONS = [
  { value: "ALL", label: "All" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "PUBLISHED", label: "Published" },
  { value: "REJECTED", label: "Rejected" },
  { value: "DRAFT", label: "Draft" },
] as const;

const STATUS_COLOR: Record<ShowcaseStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING_REVIEW: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
};

export function AdminShowcaseClient({
  projects,
  onUpdate,
  onDelete,
}: {
  projects: Project[];
  onUpdate: (id: string, updates: { status?: ShowcaseStatus; isFeatured?: boolean }) => Promise<{ success: boolean; error?: string }>;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"ALL" | ShowcaseStatus>("PENDING_REVIEW");
  const showToast = useAppStore((s) => s.showToast);

  const visible = filter === "ALL" ? projects : projects.filter((p) => p.status === filter);

  function update(id: string, updates: { status?: ShowcaseStatus; isFeatured?: boolean }) {
    startTransition(async () => {
      await onUpdate(id, updates);
      router.refresh();
    });
  }

  function handleDelete(id: string, title: string) {
    if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await onDelete(id);
      if (res.success) { showToast("Project deleted", "success"); router.refresh(); }
      else showToast(res.error ?? "Delete failed", "error");
    });
  }

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value as typeof filter)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              filter === opt.value
                ? "border-brand text-brand"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {opt.label}
            <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
              {opt.value === "ALL" ? projects.length : projects.filter((p) => p.status === opt.value).length}
            </span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="py-16 text-center text-sm text-gray-400">No projects in this category.</Card>
      ) : (
        <div className="space-y-4">
          {visible.map((p) => (
            <Card key={p.id} className="p-4">
              <div className="flex flex-wrap gap-4">
                {/* Thumbnail */}
                {p.thumbnailUrl && (
                  <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={p.thumbnailUrl}
                      alt={p.title}
                      fill
                      sizes="128px"
                      className="object-cover"
                      unoptimized={p.thumbnailUrl.startsWith("/content/")}
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{p.title}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[p.status]}`}>
                      {p.status.replace("_", " ")}
                    </span>
                    {p.isFeatured && (
                      <span className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        <Star className="h-3 w-3 fill-amber-500" />Featured
                      </span>
                    )}
                    {p.track && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{p.track}</span>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.description}</p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 mb-3">
                    <span className="flex items-center gap-1">
                      <Avatar src={p.user.avatarUrl} alt={p.user.fullName} size="xs" />
                      {p.user.fullName} · {p.user.email}
                    </span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{p.viewCount}</span>
                    <span>{new Date(p.createdAt).toLocaleDateString("en-TZ")}</span>
                    {p.demoUrl && (
                      <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-brand hover:underline">
                        <ExternalLink className="h-3 w-3" />Demo
                      </a>
                    )}
                    {p.repoUrl && (
                      <a href={p.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 text-gray-500 hover:text-gray-700">
                        <Github className="h-3 w-3" />Source
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {p.status === "PENDING_REVIEW" && (
                      <>
                        <Button size="sm" disabled={isPending} onClick={() => update(p.id, { status: "PUBLISHED" })}>
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Publish
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200" disabled={isPending} onClick={() => update(p.id, { status: "REJECTED" })}>
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />Reject
                        </Button>
                      </>
                    )}
                    {p.status === "PUBLISHED" && (
                      <Button size="sm" variant="outline" className="text-red-600 border-red-200" disabled={isPending} onClick={() => update(p.id, { status: "REJECTED" })}>
                        Unpublish
                      </Button>
                    )}
                    {p.status === "REJECTED" && (
                      <Button size="sm" variant="outline" disabled={isPending} onClick={() => update(p.id, { status: "PUBLISHED" })}>
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />Approve & publish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={p.isFeatured ? "outline" : "ghost"}
                      disabled={isPending}
                      onClick={() => update(p.id, { isFeatured: !p.isFeatured })}
                    >
                      <Star className={`h-3.5 w-3.5 mr-1.5 ${p.isFeatured ? "fill-amber-400 text-amber-500" : ""}`} />
                      {p.isFeatured ? "Unfeature" : "Feature"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={isPending}
                      onClick={() => handleDelete(p.id, p.title)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
