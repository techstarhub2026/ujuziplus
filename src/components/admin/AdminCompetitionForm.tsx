"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaUploadField } from "@/components/ui/MediaUploadField";
import { useAppStore } from "@/store/appStore";
import {
  createCompetition,
  updateCompetition,
  deleteCompetition,
  type CompetitionSaveInput,
} from "@/lib/actions/competitions";
import type { Competition, CompetitionStatus } from "@prisma/client";

const STATUSES: CompetitionStatus[] = [
  "UPCOMING",
  "REGISTRATION_OPEN",
  "IN_PROGRESS",
  "COMPLETED",
];

function toForm(c?: Competition | null): CompetitionSaveInput {
  if (!c) {
    return { title: "", thumbnailUrl: null, description: "", prize: "", status: "UPCOMING" };
  }
  return {
    title: c.title,
    thumbnailUrl: c.thumbnailUrl,
    description: c.description ?? "",
    startDate: c.startDate ? c.startDate.toISOString().slice(0, 10) : "",
    endDate: c.endDate ? c.endDate.toISOString().slice(0, 10) : "",
    prize: c.prize ?? "",
    status: c.status,
  };
}

export function AdminCompetitionForm({
  competitionId,
  initial,
}: {
  competitionId?: string;
  initial?: Competition | null;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [form, setForm] = useState<CompetitionSaveInput>(toForm(initial));
  const [isPending, startTransition] = useTransition();

  const patch = (p: Partial<CompetitionSaveInput>) => setForm((f) => ({ ...f, ...p }));

  return (
    <div className="max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/competitions">← Competitions</Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">
        {competitionId ? "Edit competition" : "New competition"}
      </h1>
      <Card className="space-y-4 p-6">
        <Input label="Title *" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
        <MediaUploadField
          kind="image"
          label="Thumbnail image"
          hint="Shown on the home page and competition listings. Recommended 16:10, at least 800×500px."
          value={form.thumbnailUrl ?? ""}
          onChange={(url) => patch({ thumbnailUrl: url })}
        />
        <Textarea
          label="Description"
          className="min-h-[100px]"
          value={form.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Start" type="date" value={form.startDate ?? ""} onChange={(e) => patch({ startDate: e.target.value })} />
          <Input label="End" type="date" value={form.endDate ?? ""} onChange={(e) => patch({ endDate: e.target.value })} />
          <Input label="Prize" value={form.prize ?? ""} onChange={(e) => patch({ prize: e.target.value })} className="sm:col-span-2" />
          <label className="text-sm sm:col-span-2">
            <span className="font-medium">Status</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.status}
              onChange={(e) => patch({ status: e.target.value as CompetitionStatus })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex gap-2 pt-2">
          <Button
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                if (competitionId) {
                  const res = await updateCompetition(competitionId, form);
                  if (res.success) {
                    showToast("Saved", "success");
                    router.refresh();
                  } else showToast(!res.success ? res.error : "Failed", "error");
                } else {
                  const res = await createCompetition(form);
                  if (res.success && res.data) {
                    showToast("Created", "success");
                    router.push(`/admin/competitions/${res.data.competitionId}/edit`);
                  } else showToast(!res.success ? res.error : "Failed", "error");
                }
              });
            }}
          >
            Save
          </Button>
          {competitionId && (
            <Button
              variant="outline"
              className="text-red-600 ml-auto"
              disabled={isPending}
              onClick={() => {
                if (!confirm("Delete?")) return;
                startTransition(async () => {
                  const res = await deleteCompetition(competitionId);
                  if (res.success) router.push("/admin/competitions");
                  else showToast(!res.success ? res.error : "Failed", "error");
                });
              }}
            >
              Delete
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
