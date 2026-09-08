"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { MentorCard } from "./MentorCard";
import { MotionGrid } from "@/components/motion/RevealStagger";
import { EmptyState } from "@/components/shared/EmptyState";
import { MENTOR_TRACKS } from "@/lib/mentors/tracks";
import type { SerializedMentor } from "@/lib/actions/mentors";
import { cn } from "@/lib/utils";

const TYPE_FILTERS = [
  { value: "", label: "All mentors" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "INDUSTRY", label: "Industry" },
  { value: "INNOVATION", label: "Innovation" },
] as const;

export function MentorsList({ mentors }: { mentors: SerializedMentor[] }) {
  const [typeFilter, setTypeFilter] = useState("");
  const [track, setTrack] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = mentors;
    if (typeFilter) {
      list = list.filter((m) => (m.mentorType ?? "GENERAL") === typeFilter);
    }
    if (track) {
      list = list.filter((m) =>
        m.tracks.some((t) => t.toLowerCase() === track.toLowerCase())
      );
    }
    if (showAvailableOnly) {
      list = list.filter((m) => m.isAcceptingRequests);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (m) =>
          m.displayName.toLowerCase().includes(q) ||
          m.hook?.toLowerCase().includes(q) ||
          m.company?.toLowerCase().includes(q) ||
          m.expertiseTags.some((t) => t.toLowerCase().includes(q)) ||
          m.tracks.some((t) => t.toLowerCase().includes(q))
      );
    }
    return list;
  }, [mentors, typeFilter, track, query, showAvailableOnly]);

  const tracksInUse = useMemo(() => {
    const set = new Set<string>();
    mentors.forEach((m) => m.tracks.forEach((t) => set.add(t)));
    return MENTOR_TRACKS.filter((t) => set.has(t));
  }, [mentors]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    mentors.forEach((m) => {
      const t = m.mentorType ?? "GENERAL";
      counts[t] = (counts[t] ?? 0) + 1;
    });
    return counts;
  }, [mentors]);

  const hasActiveFilters = !!typeFilter || !!track || !!query.trim() || showAvailableOnly;

  const clearFilters = () => {
    setTypeFilter("");
    setTrack(null);
    setQuery("");
    setShowAvailableOnly(false);
  };

  return (
    <div className="mentors-catalog">
      {/* Search + type tabs, one row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search by name, skill, company…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
            aria-label="Search mentors"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by mentor type">
          {TYPE_FILTERS.map((f) => {
            const count = f.value === "" ? mentors.length : (typeCounts[f.value] ?? 0);
            if (f.value !== "" && count === 0) return null;
            return (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={typeFilter === f.value}
                onClick={() => setTypeFilter(f.value)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                  typeFilter === f.value
                    ? "border-brand bg-brand text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-brand/50 hover:text-brand"
                )}
              >
                {f.label}
                <span className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                  typeFilter === f.value ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Track + availability, second row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setShowAvailableOnly((v) => !v)}
          className={cn(
            "mentors-filter-pill shrink-0",
            showAvailableOnly && "mentors-filter-pill--active"
          )}
        >
          Accepting requests
        </button>
        <span className="h-4 w-px shrink-0 bg-gray-200" aria-hidden />
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="Filter by track">
          <button
            type="button"
            role="tab"
            aria-selected={!track}
            className={cn("mentors-filter-pill", !track && "mentors-filter-pill--active")}
            onClick={() => setTrack(null)}
          >
            All tracks
          </button>
          {tracksInUse.map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={track === t}
              className={cn("mentors-filter-pill", track === t && "mentors-filter-pill--active")}
              onClick={() => setTrack(track === t ? null : t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Search className="h-8 w-8" />}
          title="No mentors match your filters"
          description="Try a different search term or clear your filters to see everyone."
          actionLabel={hasActiveFilters ? "Clear all filters" : undefined}
          onAction={hasActiveFilters ? clearFilters : undefined}
        />
      ) : (
        <>
          <p className="mb-4 mt-6 text-sm text-gray-500">
            Showing {filtered.length} of {mentors.length} mentors
          </p>
          <MotionGrid className="mentors-grid">
            {filtered.map((m) => (
              <MentorCard key={m.id} mentor={m} />
            ))}
          </MotionGrid>
        </>
      )}
    </div>
  );
}
