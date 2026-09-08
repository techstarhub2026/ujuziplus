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
  createOrgProgram,
  updateOrgProgram,
  type ProgramSaveInput,
} from "@/lib/actions/programs";
import type { ProgramFormat, ProgramStatus } from "@prisma/client";

const FORMATS: ProgramFormat[] = ["ONLINE", "IN_PERSON", "HYBRID"];
const STATUSES: ProgramStatus[] = ["DRAFT", "OPEN", "CLOSED"];

type InitialProgram = Omit<ProgramSaveInput, "organizationId"> & { id?: string };

function toForm(p?: InitialProgram | null): Omit<ProgramSaveInput, "organizationId"> {
  if (!p) {
    return {
      title: "",
      type: "Program",
      thumbnailUrl: null,
      posterUrl: null,
      description: "",
      format: "HYBRID",
      seats: 30,
      price: 0,
      status: "DRAFT",
    };
  }
  return {
    title: p.title,
    type: p.type,
    thumbnailUrl: p.thumbnailUrl ?? null,
    posterUrl: p.posterUrl ?? null,
    description: p.description ?? "",
    startDate: p.startDate ?? "",
    endDate: p.endDate ?? "",
    format: p.format,
    seats: p.seats,
    price: p.price,
    status: p.status,
  };
}

export function OrgProgramForm({
  orgId,
  orgSlug,
  programId,
  initial,
}: {
  orgId: string;
  orgSlug: string;
  programId?: string;
  initial?: InitialProgram | null;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [form, setForm] = useState(toForm(initial));
  const [isPending, startTransition] = useTransition();

  const patch = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));

  const save = () => {
    startTransition(async () => {
      if (programId) {
        const res = await updateOrgProgram(programId, orgId, form);
        if (res.success) {
          showToast("Program saved", "success");
          router.refresh();
        } else showToast(!res.success ? res.error : "Failed", "error");
      } else {
        const res = await createOrgProgram(orgId, form);
        if (res.success && res.data) {
          showToast("Program created", "success");
          router.push(`/org/${orgSlug}/programs/${res.data.programId}/edit`);
        } else showToast(!res.success ? res.error : "Failed", "error");
      }
    });
  };

  return (
    <div className="max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href={`/org/${orgSlug}/programs`}>← Programs</Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">
        {programId ? "Edit program" : "Create new program"}
      </h1>

      <Card className="space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Title *"
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            className="sm:col-span-2"
          />
          <Input
            label="Type"
            value={form.type}
            onChange={(e) => patch({ type: e.target.value })}
            placeholder="Bootcamp, Workshop, Residency…"
          />
          <label className="text-sm">
            <span className="font-medium">Status</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.status}
              onChange={(e) => patch({ status: e.target.value as ProgramStatus })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
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
            hint="Large banner on the program detail page. Recommended 16:9, min 1200×675px."
            value={form.posterUrl ?? ""}
            onChange={(url) => patch({ posterUrl: url })}
          />
        </div>

        {/* Description */}
        <Textarea
          label="Description"
          className="min-h-[140px]"
          value={form.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="Describe the program, goals, who it is for, and what participants will gain…"
        />

        {/* Dates + logistics */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start date"
            type="date"
            value={form.startDate ?? ""}
            onChange={(e) => patch({ startDate: e.target.value })}
          />
          <Input
            label="End date"
            type="date"
            value={form.endDate ?? ""}
            onChange={(e) => patch({ endDate: e.target.value })}
          />
          <label className="text-sm">
            <span className="font-medium">Format</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.format}
              onChange={(e) => patch({ format: e.target.value as ProgramFormat })}
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>{f.replace("_", " ")}</option>
              ))}
            </select>
          </label>
          <Input
            label="Seats"
            type="number"
            min="1"
            value={String(form.seats)}
            onChange={(e) => patch({ seats: parseInt(e.target.value, 10) || 1 })}
          />
          <Input
            label="Price (TZS) — 0 = Free"
            type="number"
            min="0"
            value={String(form.price)}
            onChange={(e) => patch({ price: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <p className="text-xs text-gray-400">
          Set status to <strong>Open</strong> when you are ready for registrations.
          Your program will appear publicly once published.
        </p>

        <Button disabled={isPending} onClick={save}>
          {isPending ? "Saving…" : programId ? "Save changes" : "Create program"}
        </Button>
      </Card>
    </div>
  );
}
