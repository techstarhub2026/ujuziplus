"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressBar } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Info, ListChecks, CalendarClock, ChevronRight, MapPin, Clock } from "lucide-react";
import type { ProgramEventType } from "@prisma/client";

type Tab = "info" | "units" | "events";

type UnitStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

type Unit = {
  id: string;
  orderIndex: number;
  course: { id: string; title: string; slug: string; thumbnailUrl: string | null };
  completed: number;
  total: number;
  status: UnitStatus;
};

type EventRow = {
  id: string;
  title: string;
  type: ProgramEventType;
  startAt: Date;
  endAt: Date | null;
  location: string | null;
  agenda: string | null;
};

const UNIT_STATUS_BADGE: Record<UnitStatus, "muted" | "warning" | "success"> = {
  NOT_STARTED: "muted",
  IN_PROGRESS: "warning",
  COMPLETED: "success",
};

const UNIT_STATUS_LABEL: Record<UnitStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
};

const EVENT_TYPE_LABEL: Record<ProgramEventType, string> = {
  WORKSHOP: "In-person Workshop",
  ONLINE_SESSION: "Online session",
  OTHER: "Other",
};

function formatDateTime(d: Date) {
  return new Date(d).toLocaleString("en-TZ", { dateStyle: "medium", timeStyle: "short" });
}

export function ProgramDetailTabs({
  description,
  detailsTable,
  units,
  events,
}: {
  description: string | null;
  detailsTable: { label: string; value: string }[];
  units: Unit[];
  events: EventRow[];
}) {
  const [tab, setTab] = useState<Tab>("info");

  const totalCompleted = units.reduce((s, u) => s + u.completed, 0);
  const totalTopics = units.reduce((s, u) => s + u.total, 0);
  const overallPct = totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0;

  const now = Date.now();
  const nextEvent = events.find((e) => new Date(e.startAt).getTime() > now);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "info", label: "Info", icon: <Info className="h-4 w-4" /> },
    { id: "units", label: "Program Units", icon: <ListChecks className="h-4 w-4" /> },
    { id: "events", label: "Events", icon: <CalendarClock className="h-4 w-4" /> },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      {/* Tab nav */}
      <nav className="h-fit lg:sticky lg:top-24">
        <ul className="space-y-1">
          {tabs.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition",
                  tab === t.id ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {t.icon}
                {t.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Panels */}
      <div>
        {tab === "info" && (
          <div className="space-y-6">
            {description && (
              <Card className="p-6">
                <h2 className="mb-3 text-lg font-semibold">About this program</h2>
                <p className="whitespace-pre-wrap leading-relaxed text-gray-600">{description}</p>
              </Card>
            )}
            <Card className="overflow-hidden p-0">
              <h2 className="px-6 pt-5 text-lg font-semibold">Program Details</h2>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {detailsTable.map((row) => (
                    <tr key={row.label} className="border-t border-gray-100">
                      <td className="px-6 py-3 text-gray-500">{row.label}</td>
                      <td className="px-6 py-3 font-medium">{row.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="h-2" />
            </Card>
          </div>
        )}

        {tab === "units" && (
          <div className="space-y-4">
            {units.length === 0 ? (
              <Card className="py-12 text-center text-sm text-gray-400">
                No curriculum has been published for this program yet.
              </Card>
            ) : (
              <>
                {totalTopics > 0 && (
                  <Card className="p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">Total Progress</span>
                      <span className="text-gray-500">{totalCompleted} / {totalTopics} topics</span>
                    </div>
                    <ProgressBar value={overallPct} showLabel />
                  </Card>
                )}
                <ol className="space-y-2">
                  {units.map((unit) => (
                    <li key={unit.id}>
                      <Link
                        href={`/learn/${unit.course.slug}`}
                        className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3.5 transition hover:bg-brand/5"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium">
                            Unit {unit.orderIndex}: {unit.course.title}
                          </p>
                          <div className="mt-1 flex items-center gap-2">
                            <Badge variant={UNIT_STATUS_BADGE[unit.status]} size="sm">
                              {UNIT_STATUS_LABEL[unit.status]}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {unit.completed} of {unit.total} topics completed
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                      </Link>
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        )}

        {tab === "events" && (
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card className="py-12 text-center text-sm text-gray-400">
                No events scheduled yet.
              </Card>
            ) : (
              <>
                {nextEvent && (
                  <Card className="border-brand/30 bg-brand/5 p-5">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-brand">Next Event</p>
                    <p className="font-semibold">{nextEvent.title}</p>
                    <p className="mt-1 text-sm text-gray-600">{formatDateTime(nextEvent.startAt)}</p>
                    {nextEvent.location && (
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" /> {nextEvent.location}
                      </p>
                    )}
                  </Card>
                )}

                <h2 className="text-lg font-semibold">Program Events</h2>
                <ul className="space-y-3">
                  {events.map((e) => (
                    <li key={e.id}>
                      <Card className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <Badge variant="outline" size="sm">{EVENT_TYPE_LABEL[e.type]}</Badge>
                            <p className="mt-1.5 font-medium">{e.title}</p>
                          </div>
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                            {formatDateTime(e.startAt)}
                            {e.endAt ? ` – ${formatDateTime(e.endAt)}` : ""}
                          </p>
                          {e.location && (
                            <p className="flex items-center gap-1.5">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                              {e.location}
                            </p>
                          )}
                          {e.agenda && <p className="pt-1 text-gray-500 whitespace-pre-wrap">{e.agenda}</p>}
                        </div>
                      </Card>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
