"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  addMentorOfficeHour,
  deleteMentorOfficeHour,
  addMentorGroupSession,
  deleteMentorGroupSession,
  createCohort,
  deleteCohort,
  getAdminCohorts,
} from "@/lib/actions/mentors";
import { DAY_LABELS } from "@/lib/mentors/tracks";
import { useAppStore } from "@/store/appStore";

type OfficeHour = {
  id: string;
  title: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
};

type GroupSession = {
  id: string;
  title: string;
  scheduledAt: Date;
  maxAttendees: number;
};

type Cohort = {
  id: string;
  title: string;
  track: string;
  startsAt: string;
  endsAt: string | null;
  maxMembers: number;
  memberCount: number;
};

export function AdminMentorExtras({
  mentorId,
  officeHours: initialHours,
  groupSessions: initialSessions,
  cohorts: initialCohorts = [],
}: {
  mentorId: string;
  officeHours: OfficeHour[];
  groupSessions: GroupSession[];
  cohorts?: Cohort[];
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();
  const [ohTitle, setOhTitle] = useState("Weekly office hours");
  const [ohDay, setOhDay] = useState(1);
  const [ohStart, setOhStart] = useState("14:00");
  const [ohEnd, setOhEnd] = useState("16:00");
  const [gsTitle, setGsTitle] = useState("");
  const [gsAt, setGsAt] = useState("");
  const [gsMax, setGsMax] = useState("20");
  const [cohortTitle, setCohortTitle] = useState("");
  const [cohortTrack, setCohortTrack] = useState("Robotics");
  const [cohortStart, setCohortStart] = useState("");
  const [cohortEnd, setCohortEnd] = useState("");
  const [cohortMax, setCohortMax] = useState("20");

  const addOh = () => {
    startTransition(async () => {
      const res = await addMentorOfficeHour(mentorId, {
        title: ohTitle,
        dayOfWeek: ohDay,
        startTime: ohStart,
        endTime: ohEnd,
        isActive: true,
      });
      if (res.success) {
        showToast("Office hours added", "success");
        router.refresh();
      } else showToast(!res.success ? res.error : "Failed", "error");
    });
  };

  const addGs = () => {
    startTransition(async () => {
      const res = await addMentorGroupSession(mentorId, {
        title: gsTitle,
        scheduledAt: gsAt,
        durationMins: 60,
        maxAttendees: parseInt(gsMax, 10) || 20,
        isActive: true,
      });
      if (res.success) {
        showToast("Group session added", "success");
        router.refresh();
      } else showToast(!res.success ? res.error : "Failed", "error");
    });
  };

  const addCohort = () => {
    if (!cohortTitle || !cohortTrack || !cohortStart) return;
    startTransition(async () => {
      const res = await createCohort(mentorId, {
        title: cohortTitle,
        track: cohortTrack,
        startsAt: cohortStart,
        endsAt: cohortEnd || undefined,
        maxMembers: parseInt(cohortMax, 10) || 20,
      });
      if (res.success) {
        showToast("Cohort created", "success");
        setCohortTitle("");
        setCohortStart("");
        setCohortEnd("");
        router.refresh();
      } else showToast(!res.success ? res.error : "Failed", "error");
    });
  };

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2 max-w-3xl">
      <Card className="p-6 space-y-3">
        <h2 className="font-semibold">Recurring office hours</h2>
        <ul className="space-y-2 text-sm">
          {initialHours.map((h) => (
            <li key={h.id} className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span>
                {h.title} — {DAY_LABELS[h.dayOfWeek]} {h.startTime}–{h.endTime}
              </span>
              <button
                type="button"
                className="text-red-500 text-xs"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteMentorOfficeHour(h.id);
                    router.refresh();
                  })
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <Input label="Title" value={ohTitle} onChange={(e) => setOhTitle(e.target.value)} />
        <label className="text-sm block">
          Day
          <select className="mt-1 w-full rounded-lg border px-3 py-2" value={ohDay} onChange={(e) => setOhDay(parseInt(e.target.value, 10))}>
            {DAY_LABELS.map((d, i) => (
              <option key={d} value={i}>{d}</option>
            ))}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <Input label="Start" type="time" value={ohStart} onChange={(e) => setOhStart(e.target.value)} />
          <Input label="End" type="time" value={ohEnd} onChange={(e) => setOhEnd(e.target.value)} />
        </div>
        <Button size="sm" disabled={isPending} onClick={addOh}>Add office hours</Button>
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="font-semibold">Group sessions</h2>
        <ul className="space-y-2 text-sm">
          {initialSessions.map((s) => (
            <li key={s.id} className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
              <span>
                {s.title} — {new Date(s.scheduledAt).toLocaleString("en-TZ")}
              </span>
              <button
                type="button"
                className="text-red-500 text-xs"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await deleteMentorGroupSession(s.id);
                    router.refresh();
                  })
                }
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <Input label="Session title" value={gsTitle} onChange={(e) => setGsTitle(e.target.value)} />
        <Input label="Scheduled at" type="datetime-local" value={gsAt} onChange={(e) => setGsAt(e.target.value)} />
        <Input label="Max attendees" type="number" value={gsMax} onChange={(e) => setGsMax(e.target.value)} />
        <Button size="sm" disabled={isPending || !gsTitle || !gsAt} onClick={addGs}>
          Add group session
        </Button>
      </Card>

      <Card className="p-6 space-y-3 lg:col-span-2">
        <h2 className="font-semibold">Mentorship cohorts</h2>
        <p className="text-xs text-gray-400">Group learners by track into structured cohorts that attend regular sessions together.</p>
        <ul className="space-y-2 text-sm">
          {initialCohorts.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 gap-2">
              <div>
                <span className="font-medium">{c.title}</span>
                <span className="text-xs text-gray-400 ml-2">
                  {c.track} · starts {new Date(c.startsAt).toLocaleDateString("en-TZ")}
                  {c.endsAt ? ` → ${new Date(c.endsAt).toLocaleDateString("en-TZ")}` : ""}
                  {" · "}{c.memberCount}/{c.maxMembers} members
                </span>
              </div>
              <button
                type="button"
                className="shrink-0 text-red-500 text-xs"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    if (!confirm(`Delete cohort "${c.title}"? All members will be removed.`)) return;
                    await deleteCohort(c.id);
                    router.refresh();
                  })
                }
              >
                Delete
              </button>
            </li>
          ))}
          {initialCohorts.length === 0 && (
            <li className="text-gray-400 text-sm">No cohorts yet.</li>
          )}
        </ul>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Input label="Cohort title" value={cohortTitle} onChange={(e) => setCohortTitle(e.target.value)} placeholder="AI Cohort Jan 2026" />
          <Input label="Track" value={cohortTrack} onChange={(e) => setCohortTrack(e.target.value)} placeholder="Robotics, AI…" />
          <Input label="Starts at" type="date" value={cohortStart} onChange={(e) => setCohortStart(e.target.value)} />
          <Input label="Ends at (optional)" type="date" value={cohortEnd} onChange={(e) => setCohortEnd(e.target.value)} />
          <Input label="Max members" type="number" value={cohortMax} onChange={(e) => setCohortMax(e.target.value)} />
          <div className="flex items-end">
            <Button size="sm" disabled={isPending || !cohortTitle || !cohortTrack || !cohortStart} onClick={addCohort}>
              Create cohort
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
