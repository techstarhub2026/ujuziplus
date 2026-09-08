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
  createMentor,
  updateMentor,
  deleteMentor,
  type MentorSaveInput,
} from "@/lib/actions/mentors";
import { MENTOR_TRACKS, MENTOR_LANGUAGES, type LearningPathStep } from "@/lib/mentors/tracks";
import type { MentorStatus, MentorType } from "@prisma/client";

const STATUSES: MentorStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

const MENTOR_TYPES: { value: MentorType; label: string; color: string }[] = [
  { value: "GENERAL",    label: "General",    color: "bg-gray-100 text-gray-700" },
  { value: "ACADEMIC",   label: "Academic",   color: "bg-blue-100 text-blue-700" },
  { value: "INDUSTRY",   label: "Industry",   color: "bg-emerald-100 text-emerald-700" },
  { value: "INNOVATION", label: "Innovation", color: "bg-violet-100 text-violet-700" },
];

type MentorInitial = MentorSaveInput & { id?: string };

function toForm(initial?: MentorInitial | null): MentorSaveInput {
  if (!initial) {
    return {
      displayName: "",
      expertiseTags: [],
      tracks: [],
      languages: ["English"],
      yearsExperience: 3,
      learningPath: [],
      recommendedCourseIds: [],
      recommendedKitSlugs: [],
      isFeatured: false,
      isAcceptingRequests: true,
      studentsHelped: 0,
      sortOrder: 0,
      status: "DRAFT",
      mentorType: "GENERAL",
      agreedToCodeOfConduct: false,
    };
  }
  return { ...initial };
}

export function AdminMentorForm({
  mentorId,
  initial,
  linkableUsers,
  courses,
  kits,
}: {
  mentorId?: string;
  initial?: MentorInitial | null;
  linkableUsers: { id: string; fullName: string; email: string; role: string }[];
  courses: { id: string; title: string; slug: string }[];
  kits: { slug: string; title: string }[];
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [form, setForm] = useState<MentorSaveInput>(toForm(initial));
  const [tagInput, setTagInput] = useState("");
  const [pathDraft, setPathDraft] = useState<LearningPathStep>({ title: "", href: "", note: "" });
  const [isPending, startTransition] = useTransition();

  const patch = (p: Partial<MentorSaveInput>) => setForm((f) => ({ ...f, ...p }));

  const addTag = () => {
    const t = tagInput.trim();
    if (!t || form.expertiseTags.includes(t)) return;
    patch({ expertiseTags: [...form.expertiseTags, t] });
    setTagInput("");
  };

  const addPathStep = () => {
    if (!pathDraft.title.trim() || !pathDraft.href.trim()) return;
    patch({ learningPath: [...form.learningPath, { ...pathDraft }] });
    setPathDraft({ title: "", href: "", note: "" });
  };

  const save = () => {
    startTransition(async () => {
      if (mentorId) {
        const res = await updateMentor(mentorId, form);
        if (res.success) {
          showToast("Mentor saved", "success");
          router.refresh();
        } else showToast(!res.success ? res.error : "Failed", "error");
      } else {
        const res = await createMentor(form);
        if (res.success && res.data) {
          showToast("Mentor created", "success");
          router.push(`/admin/mentors/${res.data.mentorId}/edit`);
        } else showToast(!res.success ? res.error : "Failed", "error");
      }
    });
  };

  return (
    <div className="max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/mentors">← Mentors</Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">{mentorId ? "Edit mentor" : "New mentor"}</h1>

      <Card className="space-y-4 p-6">
        <Input
          label="Display name *"
          value={form.displayName}
          onChange={(e) => patch({ displayName: e.target.value })}
        />
        <label className="block text-sm">
          <span className="font-medium">Link to user account (optional)</span>
          <select
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={form.userId ?? ""}
            onChange={(e) => patch({ userId: e.target.value || null })}
          >
            <option value="">— Standalone profile —</option>
            {linkableUsers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.fullName} ({u.email})
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Title" value={form.title ?? ""} onChange={(e) => patch({ title: e.target.value })} placeholder="Robotics Engineer" />
          <Input label="Company" value={form.company ?? ""} onChange={(e) => patch({ company: e.target.value })} />
        </div>
        <MediaUploadField
          kind="image"
          label="Avatar"
          value={form.avatarUrl ?? ""}
          onChange={(url) => patch({ avatarUrl: url })}
        />
        <Input label="One-line hook" value={form.hook ?? ""} onChange={(e) => patch({ hook: e.target.value })} placeholder="Built 12 school robotics labs in Dar" />
        <Input label="Featured quote" value={form.quote ?? ""} onChange={(e) => patch({ quote: e.target.value })} />
        <Textarea
          label="Bio"
          className="min-h-[100px]"
          value={form.bio ?? ""}
          onChange={(e) => patch({ bio: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="City" value={form.city ?? ""} onChange={(e) => patch({ city: e.target.value })} />
          <Input label="Country" value={form.country ?? ""} onChange={(e) => patch({ country: e.target.value })} />
          <Input label="Years experience" type="number" value={String(form.yearsExperience)} onChange={(e) => patch({ yearsExperience: parseInt(e.target.value, 10) || 0 })} />
          <Input label="Students helped" type="number" value={String(form.studentsHelped)} onChange={(e) => patch({ studentsHelped: parseInt(e.target.value, 10) || 0 })} />
        </div>
        <Input label="Video intro URL" value={form.videoIntroUrl ?? ""} onChange={(e) => patch({ videoIntroUrl: e.target.value })} placeholder="YouTube or Vimeo link" />
        <Input label="Booking / meeting URL" value={form.bookingUrl ?? ""} onChange={(e) => patch({ bookingUrl: e.target.value })} />
        <Textarea
          label="Office hours note"
          className="min-h-[60px]"
          value={form.officeHoursNote ?? ""}
          onChange={(e) => patch({ officeHoursNote: e.target.value })}
        />

        <div>
          <p className="text-sm font-medium mb-2">Expertise tags</p>
          <div className="flex flex-wrap gap-2 mb-2">
            {form.expertiseTags.map((t) => (
              <button key={t} type="button" className="rounded-full bg-gray-100 px-3 py-1 text-xs" onClick={() => patch({ expertiseTags: form.expertiseTags.filter((x) => x !== t) })}>
                {t} ×
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} />
            <Button type="button" variant="outline" onClick={addTag}>Add</Button>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Tracks</p>
          <div className="flex flex-wrap gap-2">
            {MENTOR_TRACKS.map((t) => (
              <button
                key={t}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${form.tracks.includes(t) ? "bg-brand text-white border-brand" : "bg-white"}`}
                onClick={() =>
                  patch({
                    tracks: form.tracks.includes(t)
                      ? form.tracks.filter((x) => x !== t)
                      : [...form.tracks, t],
                  })
                }
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Languages</p>
          <div className="flex flex-wrap gap-2">
            {MENTOR_LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${form.languages.includes(l) ? "bg-navy text-white border-navy" : "bg-white"}`}
                onClick={() =>
                  patch({
                    languages: form.languages.includes(l)
                      ? form.languages.filter((x) => x !== l)
                      : [...form.languages, l],
                  })
                }
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Learning path steps</p>
          <ul className="space-y-2 mb-3">
            {form.learningPath.map((s, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm">
                <span>{s.title} → {s.href}</span>
                <Button type="button" size="sm" variant="ghost" className="text-red-500" onClick={() => patch({ learningPath: form.learningPath.filter((_, j) => j !== i) })}>Remove</Button>
              </li>
            ))}
          </ul>
          <div className="grid gap-2 sm:grid-cols-3">
            <Input placeholder="Step title" value={pathDraft.title} onChange={(e) => setPathDraft((p) => ({ ...p, title: e.target.value }))} />
            <Input placeholder="/courses/… or /kits/…" value={pathDraft.href} onChange={(e) => setPathDraft((p) => ({ ...p, href: e.target.value }))} />
            <Button type="button" variant="outline" onClick={addPathStep}>Add step</Button>
          </div>
        </div>

        <label className="block text-sm">
          <span className="font-medium">Recommended courses</span>
          <select
            multiple
            className="mt-1 w-full rounded-lg border px-3 py-2 min-h-[100px]"
            value={form.recommendedCourseIds}
            onChange={(e) =>
              patch({
                recommendedCourseIds: Array.from(e.target.selectedOptions, (o) => o.value),
              })
            }
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium">Recommended kits</span>
          <select
            multiple
            className="mt-1 w-full rounded-lg border px-3 py-2 min-h-[80px]"
            value={form.recommendedKitSlugs}
            onChange={(e) =>
              patch({
                recommendedKitSlugs: Array.from(e.target.selectedOptions, (o) => o.value),
              })
            }
          >
            {kits.map((k) => (
              <option key={k.slug} value={k.slug}>{k.title}</option>
            ))}
          </select>
        </label>

        {/* Mentor type */}
        <div>
          <p className="text-sm font-medium mb-2">Mentor type</p>
          <div className="flex flex-wrap gap-2">
            {MENTOR_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => patch({ mentorType: t.value })}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  form.mentorType === t.value
                    ? `${t.color} border-current`
                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-400">
            ACADEMIC = university/school educators · INDUSTRY = professional/corporate · INNOVATION = startups/entrepreneurs
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm">
            <span className="font-medium">Status</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.status} onChange={(e) => patch({ status: e.target.value as MentorStatus })}>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <Input label="Sort order" type="number" value={String(form.sortOrder)} onChange={(e) => patch({ sortOrder: parseInt(e.target.value, 10) || 0 })} />
          <div className="flex flex-col gap-2 pt-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => patch({ isFeatured: e.target.checked })} />
              Featured on home
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isAcceptingRequests} onChange={(e) => patch({ isAcceptingRequests: e.target.checked })} />
              Accepting requests
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.agreedToCodeOfConduct ?? false} onChange={(e) => patch({ agreedToCodeOfConduct: e.target.checked })} />
              Code of conduct agreed
            </label>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button disabled={isPending} onClick={save}>Save</Button>
          {mentorId && (
            <Button
              variant="outline"
              className="text-red-600 ml-auto"
              disabled={isPending}
              onClick={() => {
                if (!confirm("Delete this mentor?")) return;
                startTransition(async () => {
                  const res = await deleteMentor(mentorId);
                  if (res.success) router.push("/admin/mentors");
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
