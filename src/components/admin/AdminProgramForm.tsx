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
  createProgram,
  updateProgram,
  deleteProgram,
  type ProgramSaveInput,
} from "@/lib/actions/programs";
import type { ProgramFormat, ProgramStatus } from "@prisma/client";

const FORMATS: ProgramFormat[] = ["ONLINE", "IN_PERSON", "HYBRID"];
const STATUSES: ProgramStatus[] = ["DRAFT", "OPEN", "FULL", "CLOSED", "ARCHIVED"];

type OrgOption = { id: string; name: string };

type InitialProgram = {
  id?: string;
  title: string;
  type: string;
  thumbnailUrl?: string | null;
  posterUrl?: string | null;
  description?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  format: ProgramFormat;
  seats: number;
  price: unknown;
  status: ProgramStatus;
  organizationId?: string | null;
};

function toForm(p?: InitialProgram | null): ProgramSaveInput {
  if (!p) {
    return {
      title: "",
      type: "Bootcamp",
      thumbnailUrl: null,
      posterUrl: null,
      description: "",
      format: "HYBRID",
      seats: 30,
      price: 0,
      status: "OPEN",
      organizationId: null,
    };
  }
  return {
    title: p.title,
    type: p.type,
    thumbnailUrl: p.thumbnailUrl ?? null,
    posterUrl: p.posterUrl ?? null,
    description: p.description ?? "",
    startDate: p.startDate ? p.startDate.toISOString().slice(0, 10) : "",
    endDate: p.endDate ? p.endDate.toISOString().slice(0, 10) : "",
    format: p.format,
    seats: p.seats,
    price: Number(p.price),
    status: p.status,
    organizationId: p.organizationId ?? null,
  };
}

export function AdminProgramForm({
  programId,
  initial,
  orgs = [],
}: {
  programId?: string;
  initial?: InitialProgram | null;
  orgs?: OrgOption[];
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [form, setForm] = useState<ProgramSaveInput>(toForm(initial));
  const [isPending, startTransition] = useTransition();

  const patch = (p: Partial<ProgramSaveInput>) => setForm((f) => ({ ...f, ...p }));

  const save = () => {
    startTransition(async () => {
      if (programId) {
        const res = await updateProgram(programId, form);
        if (res.success) {
          showToast("Program saved", "success");
          router.refresh();
        } else showToast(!res.success ? res.error : "Failed", "error");
      } else {
        const res = await createProgram(form);
        if (res.success && res.data) {
          showToast("Program created", "success");
          router.push(`/admin/programs/${res.data.programId}/edit`);
        } else showToast(!res.success ? res.error : "Failed", "error");
      }
    });
  };

  return (
    <div className="max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/programs">← Programs</Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">{programId ? "Edit program" : "New program"}</h1>

      <Card className="space-y-5 p-6">
        {/* Basic info */}
        <Input label="Title *" value={form.title} onChange={(e) => patch({ title: e.target.value })} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Type" value={form.type} onChange={(e) => patch({ type: e.target.value })} placeholder="Bootcamp, Residency…" />

          {/* Organisation selector */}
          <label className="text-sm">
            <span className="font-medium">Organisation (optional)</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.organizationId ?? ""}
              onChange={(e) => patch({ organizationId: e.target.value || null })}
            >
              <option value="">— Platform program (no org) —</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>{o.name}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Media */}
        <div className="space-y-4 rounded-lg border border-dashed border-gray-200 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Media</p>
          <MediaUploadField
            kind="image"
            label="Thumbnail"
            hint="Shown on listing cards. Recommended 16:10, min 800×500px."
            value={form.thumbnailUrl ?? ""}
            onChange={(url) => patch({ thumbnailUrl: url })}
          />
          <MediaUploadField
            kind="image"
            label="Poster / Advertisement image"
            hint="Large banner shown on the program detail page. Recommended 16:9, min 1200×675px."
            value={form.posterUrl ?? ""}
            onChange={(url) => patch({ posterUrl: url })}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          className="min-h-[120px]"
          value={form.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="Describe the program, what participants will learn, who it is for…"
        />

        {/* Dates + logistics */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Start date" type="date" value={form.startDate ?? ""} onChange={(e) => patch({ startDate: e.target.value })} />
          <Input label="End date" type="date" value={form.endDate ?? ""} onChange={(e) => patch({ endDate: e.target.value })} />

          <label className="text-sm">
            <span className="font-medium">Format</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.format} onChange={(e) => patch({ format: e.target.value as ProgramFormat })}>
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f.replace("_", " ")}</option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="font-medium">Status</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.status} onChange={(e) => patch({ status: e.target.value as ProgramStatus })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          <Input label="Seats" type="number" min="1" value={String(form.seats)} onChange={(e) => patch({ seats: parseInt(e.target.value, 10) || 1 })} />
          <Input
            label="Price (TZS) — 0 = Free"
            type="number"
            min="0"
            value={String(form.price)}
            onChange={(e) => patch({ price: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button disabled={isPending} onClick={save}>{isPending ? "Saving…" : "Save program"}</Button>
          {programId && (
            <Button
              variant="outline"
              className="text-red-600 ml-auto"
              disabled={isPending}
              onClick={() => {
                if (!confirm("Delete this program? This cannot be undone.")) return;
                startTransition(async () => {
                  const res = await deleteProgram(programId);
                  if (res.success) router.push("/admin/programs");
                  else showToast(!res.success ? res.error : "Failed", "error");
                });
              }}
            >
              Delete program
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
