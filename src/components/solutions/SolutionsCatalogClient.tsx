"use client";

import { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { joinSolution } from "@/lib/actions/solutions";
import { useAppStore } from "@/store/appStore";
import { useRouter } from "next/navigation";
import { Clock, Users, CheckCircle2, FlaskConical, Search, Plus, Building2 } from "lucide-react";

const LEVEL_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  BEGINNER:     { bg: "bg-green-100",  text: "text-green-700",  dot: "bg-green-500"  },
  INTERMEDIATE: { bg: "bg-amber-100",  text: "text-amber-700",  dot: "bg-amber-500"  },
  ADVANCED:     { bg: "bg-red-100",    text: "text-red-700",    dot: "bg-red-500"    },
};

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
};

type SolutionItem = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  level: string;
  hours: number;
  thumbnailUrl: string | null;
  tags: unknown;
  _count: { joins: number };
  author: { fullName: string | null; username: string | null; avatarUrl: string | null } | null;
  organization: { name: string; slug: string; logoUrl: string | null } | null;
};

const FILTERS = ["All", "Joined", "Beginner", "Intermediate", "Advanced"] as const;

export function SolutionsCatalogClient({
  solutions,
  joinedSlugs,
  userId,
  isLoggedIn,
}: {
  solutions: SolutionItem[];
  joinedSlugs: string[];
  userId: string | null;
  isLoggedIn?: boolean;
}) {
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [joined, setJoined] = useState(new Set(joinedSlugs));
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();

  const filtered = useMemo(() => {
    return solutions.filter((s) => {
      const matchFilter =
        filter === "All" ||
        (filter === "Joined" && joined.has(s.slug)) ||
        s.level.toUpperCase() === filter.toUpperCase();
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        s.title.toLowerCase().includes(q) ||
        (s.subtitle ?? "").toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [filter, joined, solutions, search]);

  const handleJoin = (slug: string, title: string) => {
    if (!userId) {
      router.push(`/auth/login?callbackUrl=/solutions/${slug}`);
      return;
    }
    if (joined.has(slug)) {
      router.push(`/solutions/${slug}`);
      return;
    }
    startTransition(async () => {
      const res = await joinSolution(userId, slug);
      if (res.success) {
        setJoined((prev) => new Set([...Array.from(prev), slug]));
        showToast(`You joined "${title}"`, "success");
      } else showToast(res.error ?? "Failed", "error");
    });
  };

  return (
    <div className="learner-canvas mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <LearnerPageHero
        banner="solutions"
        title="Lab Solutions"
        subtitle="Hands-on IoT project guides — join a solution, follow the steps, and build something real."
      />

      {/* Hero action row */}
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-gray-500">Browse and join community IoT projects — or share your own.</p>
        <Link
          href={isLoggedIn ? "/solutions/new" : "/auth/login?callbackUrl=/solutions/new"}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" /> Share a project
        </Link>
      </div>

      {/* Search + filter bar */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search solutions…"
            aria-label="Search solutions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                filter === f
                  ? "bg-brand text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-3 text-xs text-gray-400">
        {filtered.length} solution{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          className="mt-12"
          icon={<FlaskConical className="h-8 w-8 text-brand" />}
          title="No solutions match your search"
          description="Try a different search term or clear your filters to see all solutions."
          actionLabel="Clear filters"
          onAction={() => { setFilter("All"); setSearch(""); }}
        />
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => {
            const isJoined = joined.has(s.slug);
            const lvl = LEVEL_STYLE[s.level] ?? LEVEL_STYLE.BEGINNER;
            const tags = Array.isArray(s.tags) ? (s.tags as string[]) : [];

            return (
              <Card key={s.slug} hover className="group flex flex-col overflow-hidden p-0">
                {/* Thumbnail */}
                <Link href={`/solutions/${s.slug}`}>
                  <div className="relative w-full overflow-hidden bg-navy/5" style={{ aspectRatio: "16/8" }}>
                    {s.thumbnailUrl ? (
                      <Image
                        src={s.thumbnailUrl}
                        alt={s.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        unoptimized={s.thumbnailUrl.startsWith("/content/")}
                      />
                    ) : (
                      /* Gradient placeholder */
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy/10 to-brand/10">
                        <FlaskConical className="h-10 w-10 text-brand/30" />
                      </div>
                    )}
                    {/* Level badge overlay */}
                    <span className={`absolute top-2.5 left-2.5 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm ${lvl.bg} ${lvl.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${lvl.dot}`} />
                      {LEVEL_LABEL[s.level] ?? s.level}
                    </span>
                    {isJoined && (
                      <span className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                        <CheckCircle2 className="h-3 w-3" /> Joined
                      </span>
                    )}
                  </div>
                </Link>

                {/* Body */}
                <div className="flex flex-1 flex-col px-4 py-3">
                  <Link href={`/solutions/${s.slug}`}>
                    <h3 className="font-display text-base font-semibold leading-snug group-hover:text-brand line-clamp-2">
                      {s.title}
                    </h3>
                  </Link>

                  {s.subtitle && (
                    <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">{s.subtitle}</p>
                  )}

                  {/* Meta row */}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {s.hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {s._count.joins} joined
                    </span>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-sm bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author / org */}
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] text-gray-400">
                    {s.organization ? (
                      <>
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{s.organization.name}</span>
                      </>
                    ) : s.author ? (
                      <>
                        {s.author.avatarUrl ? (
                          <Image
                            src={s.author.avatarUrl}
                            alt=""
                            width={16}
                            height={16}
                            className="rounded-full object-cover shrink-0"
                            unoptimized={s.author.avatarUrl.includes("dicebear.com")}
                          />
                        ) : (
                          <span className="h-4 w-4 rounded-full bg-brand/20 text-[9px] font-bold text-brand flex items-center justify-center shrink-0">
                            {(s.author.fullName ?? "?")[0]}
                          </span>
                        )}
                        <span className="truncate">{s.author.fullName ?? s.author.username}</span>
                      </>
                    ) : (
                      <span>UjuziLab</span>
                    )}
                  </div>

                  <div className="flex-1" />

                  {/* CTA */}
                  <div className="mt-3 flex gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => handleJoin(s.slug, s.title)}
                      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-opacity ${
                        isJoined
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-brand text-white hover:opacity-90"
                      }`}
                    >
                      {isJoined ? "Open lab →" : "Start solution"}
                    </button>
                    <Link
                      href={`/solutions/${s.slug}`}
                      className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:border-brand hover:text-brand transition-colors"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
