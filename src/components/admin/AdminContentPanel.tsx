"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { adminApproveSolution, adminRejectSolution, adminDeleteSolution } from "@/lib/actions/solutions";
import { adminUpsertBlogPost } from "@/lib/actions/blog";
import { adminUpsertPricingPlan } from "@/lib/actions/pricing";
import { adminToggleProjectPublished, adminDeleteProject } from "@/lib/actions/projects";
import { useAppStore } from "@/store/appStore";

type Tab = "solutions" | "review" | "blog" | "pricing" | "projects";

export function AdminContentPanel({
  solutions,
  blogPosts,
  pricingPlans,
  projects,
}: {
  solutions: { id: string; slug: string; title: string; status: string; level: string; author?: { fullName: string | null; username: string | null } | null; organization?: { name: string } | null }[];
  blogPosts: { id: string; slug: string; title: string; status: string; category: string }[];
  pricingPlans: { id: string; slug: string; name: string; price: number; isActive: boolean }[];
  projects: { id: string; slug: string; title: string; isPublished: boolean; creator: { fullName: string } }[];
}) {
  const [tab, setTab] = useState<Tab>("solutions");
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pending = solutions.filter((s) => s.status === "PENDING_REVIEW");

  const approve = (id: string) => {
    startTransition(async () => {
      const res = await adminApproveSolution(id);
      if (res.success) { showToast("Solution approved and published", "success"); router.refresh(); }
      else showToast(res.error ?? "Failed", "error");
    });
  };

  const reject = (id: string) => {
    startTransition(async () => {
      const res = await adminRejectSolution(id, rejectReason);
      if (res.success) { showToast("Submission rejected", "success"); setRejectingId(null); setRejectReason(""); router.refresh(); }
      else showToast(res.error ?? "Failed", "error");
    });
  };

  const deleteSolution = (id: string, title: string) => {
    if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await adminDeleteSolution(id);
      if (res.success) { showToast("Solution deleted", "success"); router.refresh(); }
      else showToast(res.error ?? "Delete failed", "error");
    });
  };

  const deleteProject = (id: string, title: string) => {
    if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await adminDeleteProject(id);
      if (res.success) { showToast("Project deleted", "success"); router.refresh(); }
      else showToast(res.error ?? "Delete failed", "error");
    });
  };

  const tabs: { id: Tab; label: string; count: number; urgent?: boolean }[] = [
    { id: "review", label: "Review queue", count: pending.length, urgent: pending.length > 0 },
    { id: "solutions", label: "All solutions", count: solutions.length },
    { id: "blog", label: "Blog", count: blogPosts.length },
    { id: "pricing", label: "Pricing", count: pricingPlans.length },
    { id: "projects", label: "Projects", count: projects.length },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Platform content</h1>
      <p className="text-sm text-gray-500 mb-6">
        Manage solutions, lab resources, blog posts, pricing display plans, and moderate projects.
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={tab === t.id ? "primary" : "outline"}
            onClick={() => setTab(t.id)}
            className={t.urgent && tab !== t.id ? "border-amber-400 text-amber-600" : ""}
          >
            {t.label}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${t.urgent ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-500"}`}>
              {t.count}
            </span>
          </Button>
        ))}
      </div>

      {/* Review queue */}
      {tab === "review" && (
        <div className="space-y-4">
          {pending.length === 0 ? (
            <Card className="py-12 text-center text-sm text-gray-400">No submissions pending review.</Card>
          ) : (
            pending.map((s) => (
              <Card key={s.id} className="p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{s.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      by {s.author?.fullName ?? s.author?.username ?? "community"} {s.organization ? `· ${s.organization.name}` : ""} · {s.level.toLowerCase()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/solutions/${s.slug}`} target="_blank">Preview</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/solutions/${s.slug}/edit`}>Edit</Link>
                    </Button>
                    <Button size="sm" disabled={isPending} onClick={() => approve(s.id)}>
                      Approve & Publish
                    </Button>
                    <Button size="sm" variant="ghost" disabled={isPending} onClick={() => setRejectingId(rejectingId === s.id ? null : s.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
                {rejectingId === s.id && (
                  <div className="flex gap-2 mt-2 items-end">
                    <Input
                      label="Rejection reason"
                      className="flex-1"
                      placeholder="Reason for rejection (shown to author)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <Button size="sm" disabled={isPending} onClick={() => reject(s.id)}>
                      Send rejection
                    </Button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      )}

      {tab === "solutions" && (
        <div className="space-y-3">
          <Button asChild size="sm">
            <Link href="/solutions/new">Create solution</Link>
          </Button>
          {solutions.map((s) => (
            <Card key={s.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="text-sm text-gray-500">
                  /{s.slug} · {s.level.toLowerCase()}
                  {s.author ? ` · by ${s.author.fullName ?? s.author.username}` : ""}
                  {s.organization ? ` · ${s.organization.name}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Badge variant={s.status === "PUBLISHED" ? "success" : s.status === "PENDING_REVIEW" ? "warning" : "outline"}>
                  {s.status.replace("_", " ").toLowerCase()}
                </Badge>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/solutions/${s.slug}/edit`}>Edit</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/solutions/${s.slug}`}>View</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isPending}
                  onClick={() => deleteSolution(s.id, s.title)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {tab === "blog" && (
        <div className="space-y-3">
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const slug = `post-${Date.now()}`;
                await adminUpsertBlogPost({
                  slug,
                  title: "New blog post",
                  excerpt: "Short summary",
                  body: "Full article content…",
                  category: "Insights",
                  status: "PUBLISHED",
                });
                router.refresh();
              });
            }}
          >
            Add blog post
          </Button>
          {blogPosts.map((p) => (
            <Card key={p.id} className="p-4 flex justify-between">
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-gray-500">{p.category}</p>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link href={`/blog/${p.slug}`}>View</Link>
              </Button>
            </Card>
          ))}
        </div>
      )}

      {tab === "pricing" && (
        <div className="space-y-3">
          {pricingPlans.map((p) => (
            <Card key={p.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-gray-500">TZS {Number(p.price).toLocaleString()}</p>
              </div>
              <Badge variant={p.isActive ? "success" : "outline"}>
                {p.isActive ? "Active" : "Inactive"}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      {tab === "projects" && (
        <div className="space-y-3">
          {projects.map((p) => (
            <Card key={p.id} className="p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-gray-500">by {p.creator.fullName}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isPending}
                  onClick={() => {
                    startTransition(async () => {
                      await adminToggleProjectPublished(p.id, !p.isPublished);
                      router.refresh();
                    });
                  }}
                >
                  {p.isPublished ? "Hide" : "Publish"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  disabled={isPending}
                  onClick={() => deleteProject(p.id, p.title)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
