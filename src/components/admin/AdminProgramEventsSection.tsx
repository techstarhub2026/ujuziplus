"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import {
  createProgramEvent,
  updateProgramEvent,
  deleteProgramEvent,
  type ProgramEventInput,
} from "@/lib/actions/program-events";
import { useAppStore } from "@/store/appStore";
import type { ProgramEventType } from "@prisma/client";

const TYPES: { value: ProgramEventType; label: string }[] = [
  { value: "WORKSHOP", label: "In-person Workshop" },
  { value: "ONLINE_SESSION", label: "Online session" },
  { value: "OTHER", label: "Other" },
];

type EventRow = {
  id: string;
  title: string;
  type: ProgramEventType;
  startAt: Date;
  endAt: Date | null;
  location: string | null;
  agenda: string | null;
};

const EMPTY: ProgramEventInput = {
  title: "",
  type: "WORKSHOP",
  startAt: "",
  endAt: "",
  location: "",
  agenda: "",
};

function toDatetimeLocal(d: Date | null) {
  if (!d) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const date = new Date(d);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AdminProgramEventsSection({
  programId,
  events,
}: {
  programId: string;
  events: EventRow[];
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ProgramEventInput>(EMPTY);

  const patch = (p: Partial<ProgramEventInput>) => setForm((f) => ({ ...f, ...p }));

  const startCreate = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const startEdit = (e: EventRow) => {
    setEditingId(e.id);
    setForm({
      title: e.title,
      type: e.type,
      startAt: toDatetimeLocal(e.startAt),
      endAt: toDatetimeLocal(e.endAt),
      location: e.location ?? "",
      agenda: e.agenda ?? "",
    });
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY);
  };

  const save = () => {
    startTransition(async () => {
      const res = editingId
        ? await updateProgramEvent(editingId, form)
        : await createProgramEvent(programId, form);
      if (res.success) {
        showToast(editingId ? "Event updated" : "Event added", "success");
        cancel();
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  const remove = (id: string, title: string) => {
    if (!confirm(`Delete event "${title}"? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await deleteProgramEvent(id);
      if (res.success) {
        showToast("Event deleted", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  return (
    <Card className="max-w-2xl space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Events</h2>
        {!showForm && (
          <Button size="sm" variant="outline" onClick={startCreate}>Add event</Button>
        )}
      </div>

      {events.length === 0 && !showForm ? (
        <p className="py-4 text-center text-sm text-gray-400">No events scheduled yet.</p>
      ) : (
        <ul className="space-y-2">
          {events.map((e) => (
            <li key={e.id} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{e.title}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {TYPES.find((t) => t.value === e.type)?.label} ·{" "}
                    {new Date(e.startAt).toLocaleString("en-TZ", { dateStyle: "medium", timeStyle: "short" })}
                    {e.location ? ` · ${e.location}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => startEdit(e)} className="text-gray-400 hover:text-brand">
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => remove(e.id, e.title)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showForm && (
        <div className="space-y-3 rounded-lg border border-dashed border-gray-200 p-4">
          <Input label="Title *" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-medium">Type</span>
              <select
                className="mt-1 w-full rounded-lg border px-3 py-2"
                value={form.type}
                onChange={(e) => patch({ type: e.target.value as ProgramEventType })}
              >
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </label>
            <Input label="Location" value={form.location} onChange={(e) => patch({ location: e.target.value })} />
            <Input
              label="Start date/time *"
              type="datetime-local"
              value={form.startAt}
              onChange={(e) => patch({ startAt: e.target.value })}
            />
            <Input
              label="End date/time"
              type="datetime-local"
              value={form.endAt}
              onChange={(e) => patch({ endAt: e.target.value })}
            />
          </div>
          <Textarea
            label="Agenda"
            value={form.agenda}
            onChange={(e) => patch({ agenda: e.target.value })}
            placeholder="What will happen at this session…"
          />
          <div className="flex gap-2">
            <Button size="sm" disabled={isPending} onClick={save}>
              {isPending ? "Saving…" : editingId ? "Save changes" : "Add event"}
            </Button>
            <Button size="sm" variant="ghost" onClick={cancel}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
