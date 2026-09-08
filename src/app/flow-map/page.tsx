"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, Search } from "lucide-react";
import { PLATFORM_FLOWS, ALL_ROUTES, type FlowNode } from "@/lib/flows";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LabShell } from "@/components/layout/wazilab/LabShell";

function FlowTree({ nodes, depth = 0 }: { nodes: FlowNode[]; depth?: number }) {
  return (
    <ul className={depth > 0 ? "ml-4 mt-2 border-l border-gray-200 pl-4 space-y-2" : "space-y-3"}>
      {nodes.map((node) => (
        <li key={node.id}>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {node.level}
            </Badge>
            <span className="font-medium text-gray-900">{node.title}</span>
            {node.route && (
              <Link href={node.route.replace(/\[.*?\]/g, "demo")} className="text-xs text-brand hover:underline flex items-center gap-0.5">
                {node.route} <ExternalLink className="h-3 w-3" />
              </Link>
            )}
            {node.action && <span className="text-xs text-gray-500">→ {node.action}</span>}
          </div>
          {node.children && node.children.length > 0 && <FlowTree nodes={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

const DEMO_LINKS: Record<string, string> = {
  "/courses/[slug]": "/courses/arduino-robotics-fundamentals",
  "/programs/[slug]": "/programs/stem-bootcamp-2026",
  "/projects/[slug]": "/projects/solar-irrigation-iot",
  "/competitions/[slug]": "/competitions/dar-hackathon-2026",
  "/organizations/[slug]": "/organizations/dit-tanzania",
  "/blog/[slug]": "/blog/stem-education-africa-2026",
  "/kits/[slug]": "/kits/arduino-starter-kit",
  "/solutions/[slug]": "/solutions/automated-temperature-control",
  "/lab-resources/[slug]": "/lab-resources/arduino-uno",
  "/learn/[courseSlug]/[lessonSlug]": "/learn/arduino-robotics-fundamentals/introduction",
  "/dashboard/community/[channelSlug]": "/dashboard/community/general",
  "/dashboard/community/post/[postId]": "/dashboard/community/post/post-1",
  "/dashboard/certificates/[certId]": "/dashboard/certificates/UJZ-2026-00142",
  "/profile/[username]": "/profile/william-mwangi",
  "/instructor/courses/[courseId]/edit": "/instructor/courses/c-001/edit",
  "/instructor/courses/[courseId]/preview": "/instructor/courses/c-001/preview",
  "/instructor/courses/[courseId]/analytics": "/instructor/courses/c-001/analytics",
  "/instructor/students/[studentId]": "/instructor/students/u-001",
  "/admin/users/[userId]": "/admin/users/u-001",
  "/admin/kits/[kitId]/edit": "/admin/kits/kit-001/edit",
  "/org/[slug]/dashboard": "/org/dit-tanzania/dashboard",
  "/org/[slug]/members": "/org/dit-tanzania/members",
  "/org/[slug]/courses": "/org/dit-tanzania/courses",
  "/org/[slug]/kits": "/org/dit-tanzania/kits",
  "/org/[slug]/programs": "/org/dit-tanzania/programs",
  "/org/[slug]/competitions": "/org/dit-tanzania/competitions",
  "/org/[slug]/analytics": "/org/dit-tanzania/analytics",
  "/org/[slug]/settings": "/org/dit-tanzania/settings",
};

export default function FlowMapPage() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"tree" | "routes">("tree");

  const filteredRoutes = useMemo(() => {
    if (!q.trim()) return [...ALL_ROUTES];
    const lower = q.toLowerCase();
    return ALL_ROUTES.filter((r) => r.toLowerCase().includes(lower));
  }, [q]);

  return (
    <LabShell>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-gray-900">Complete flow map</h1>
          <p className="mt-2 text-gray-600">
            High-level platform → portals → modules → pages → atomic actions. Every route in the prototype is listed below.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild variant="primary" size="sm">
              <Link href="/dashboard">Student dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/courses">Course catalog</Link>
            </Button>
          </div>
        </div>

        <div className="mb-6 flex gap-2">
          <Button variant={tab === "tree" ? "primary" : "outline"} size="sm" onClick={() => setTab("tree")}>
            Flow tree (L0–L4)
          </Button>
          <Button variant={tab === "routes" ? "primary" : "outline"} size="sm" onClick={() => setTab("routes")}>
            All routes ({ALL_ROUTES.length})
          </Button>
        </div>

        {tab === "tree" ? (
          <Card className="p-6">
            <FlowTree nodes={PLATFORM_FLOWS} />
          </Card>
        ) : (
          <Card className="p-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter routes..."
                aria-label="Filter routes"
                className="w-full rounded-lg border pl-10 pr-4 py-2 text-sm"
              />
            </div>
            <ul className="grid gap-1 sm:grid-cols-2">
              {filteredRoutes.map((route) => {
                const href = DEMO_LINKS[route] || route;
                const isDynamic = route.includes("[");
                return (
                  <li key={route}>
                    {isDynamic && !DEMO_LINKS[route] ? (
                      <span className="flex items-center gap-1 py-1 text-sm text-gray-500 font-mono">
                        <ChevronRight className="h-3 w-3" />
                        {route}
                      </span>
                    ) : (
                      <Link
                        href={href}
                        className="flex items-center gap-1 py-1 text-sm text-brand hover:underline font-mono"
                      >
                        <ChevronRight className="h-3 w-3 shrink-0" />
                        {route}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </div>
    </LabShell>
  );
}
