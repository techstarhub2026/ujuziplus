"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeatMeter } from "@/components/motion/SeatMeter";
import { MotionGrid } from "@/components/motion/RevealStagger";
import { formatCurrency, cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, Building2 } from "lucide-react";

const FORMAT_LABEL: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "In-person",
  HYBRID: "Hybrid",
};

type StatusFilter = "OPEN" | "FULL" | "CLOSED";

const STATUS_BADGE: Record<string, "success" | "error" | "muted" | "outline"> = {
  OPEN: "success",
  FULL: "error",
  CLOSED: "muted",
};

type Program = {
  id: string;
  slug: string;
  title: string;
  type: string;
  format: string;
  thumbnailUrl?: string | null;
  startDate: Date | null;
  endDate: Date | null;
  price: unknown;
  enrolledCount: number;
  seats: number;
  status?: string;
  organization?: { name: string; logoUrl: string | null } | null;
};

export function ProgramsList({
  programs,
  registered,
}: {
  programs: Program[];
  registered: string[];
}) {
  const categories = useMemo(
    () => Array.from(new Set(programs.map((p) => p.type))).sort(),
    [programs]
  );
  const [category, setCategory] = useState<string>("all");
  const [joinedOnly, setJoinedOnly] = useState(false);
  const [statuses, setStatuses] = useState<Set<StatusFilter>>(new Set<StatusFilter>(["OPEN"]));

  const toggleStatus = (s: StatusFilter) => {
    setStatuses((prev) => {
      const next = new Set(prev);
      next.has(s) ? next.delete(s) : next.add(s);
      return next;
    });
  };

  const filtered = programs.filter((p) => {
    if (category !== "all" && p.type !== category) return false;
    if (joinedOnly && !registered.includes(p.slug)) return false;
    const status = (p.status ?? "OPEN") as StatusFilter;
    if (statuses.size > 0 && !statuses.has(status)) return false;
    return true;
  });

  const groups = useMemo(() => {
    const map = new Map<string, Program[]>();
    for (const p of filtered) {
      const list = map.get(p.type) ?? [];
      list.push(p);
      map.set(p.type, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="mt-6">
      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-gray-100 bg-white p-4">
        <label className="text-sm">
          <span className="mr-2 font-medium text-gray-600">Category</span>
          <select
            className="rounded-lg border px-3 py-1.5 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={joinedOnly}
            onChange={(e) => setJoinedOnly(e.target.checked)}
            className="rounded border-gray-300"
          />
          Joined
        </label>

        <div className="flex items-center gap-3">
          {(["OPEN", "FULL", "CLOSED"] as StatusFilter[]).map((s) => (
            <label key={s} className="flex items-center gap-1.5 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={statuses.has(s)}
                onChange={() => toggleStatus(s)}
                className="rounded border-gray-300"
              />
              {s === "OPEN" ? "Open" : s === "FULL" ? "Full" : "Closed"}
            </label>
          ))}
        </div>
      </div>

      {groups.length === 0 ? (
        <Card className="py-16 text-center text-sm text-gray-400">No programs match these filters.</Card>
      ) : (
        <div className="space-y-10">
          {groups.map(([type, list]) => (
            <section key={type}>
              <h2 className="font-display text-lg font-semibold text-gray-900">{type}</h2>
              <hr className="mt-2 mb-4 border-gray-200" />
              <MotionGrid className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((p) => {
                  const isRegistered = registered.includes(p.slug);
                  const priceNum = Number(p.price);
                  const price = priceNum === 0 ? "Free" : formatCurrency(priceNum);
                  const seatsLeft = p.seats > 0 ? Math.max(0, p.seats - p.enrolledCount) : null;
                  const isFull = seatsLeft === 0;
                  const isLow = seatsLeft !== null && seatsLeft > 0 && seatsLeft <= 5;
                  const status = (p.status ?? "OPEN") as StatusFilter;
                  const isClosed = status === "CLOSED" || isFull;

                  return (
                    <Link key={p.id} href={`/programs/${p.slug}`}>
                      <Card hover className="group flex h-full flex-col overflow-hidden p-0">
                        <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: "16/7" }}>
                          {p.thumbnailUrl ? (
                            <Image
                              src={p.thumbnailUrl}
                              alt={p.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              unoptimized={p.thumbnailUrl.startsWith("/content/")}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-brand/10">
                              <span className="text-3xl font-black text-brand/25 select-none">{p.title.charAt(0)}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col px-4 py-3">
                          <h3 className="font-display text-base font-semibold leading-snug group-hover:text-brand line-clamp-2">
                            {p.title}
                          </h3>

                          {/* Org byline */}
                          {p.organization && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                              {p.organization.logoUrl ? (
                                <Image
                                  src={p.organization.logoUrl}
                                  alt=""
                                  width={16}
                                  height={16}
                                  className="rounded object-contain"
                                  unoptimized={p.organization.logoUrl.startsWith("/content/")}
                                />
                              ) : (
                                <Building2 className="h-3.5 w-3.5 text-gray-400" />
                              )}
                              <span className="truncate">{p.organization.name}</span>
                            </div>
                          )}

                          {/* Date + status */}
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <p className="text-xs text-gray-500">
                              {p.startDate ? new Date(p.startDate).toLocaleDateString("en-TZ") : "TBD"}
                            </p>
                            <Badge variant={STATUS_BADGE[status] ?? "outline"} size="sm">
                              {status === "OPEN" ? "Open" : status === "FULL" ? "Full" : "Closed"}
                            </Badge>
                          </div>

                          <p className="mt-1 text-xs text-gray-400">{FORMAT_LABEL[p.format] ?? p.format}</p>
                          <p className="mt-1.5 text-sm font-semibold text-brand">{price}</p>

                          {p.seats > 0 && (
                            <div className="mt-2">
                              <SeatMeter enrolled={p.enrolledCount} total={p.seats} />
                            </div>
                          )}

                          {isLow && (
                            <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-600">
                              <AlertTriangle className="h-3 w-3 shrink-0" />
                              Only {seatsLeft} {seatsLeft === 1 ? "seat" : "seats"} left
                            </p>
                          )}

                          <div className="flex-1" />

                          <div className="mt-3 flex items-center gap-2">
                            {isRegistered ? (
                              <div className="flex flex-1 items-center gap-1.5 rounded-md bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700">
                                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                                Joined
                              </div>
                            ) : (
                              <div
                                className={cn(
                                  "flex-1 rounded-md border px-3 py-1.5 text-center text-xs font-semibold transition",
                                  isClosed
                                    ? "border-gray-200 text-gray-400"
                                    : "border-brand text-brand group-hover:bg-brand group-hover:text-white"
                                )}
                              >
                                {isFull ? "Full" : isClosed ? "Closed" : "Join"}
                              </div>
                            )}
                            <span className="shrink-0 text-xs font-medium text-gray-400 group-hover:text-brand">
                              Learn More →
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </MotionGrid>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
