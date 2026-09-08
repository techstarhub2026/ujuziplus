"use client";

import { useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MediaUploadField } from "@/components/ui/MediaUploadField";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { useAppStore } from "@/store/appStore";
import {
  createSolutionDraft,
  updateSolutionDraft,
  submitSolutionForReview,
  deleteSolutionDraft,
  type SolutionDraftInput,
  type LabStepData,
} from "@/lib/actions/solutions";
import { uploadMediaFile } from "@/lib/upload-client";
import { Plus, Trash2, GripVertical, Send, Save, Eye, X, FileText, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import type { ContentDifficulty } from "@prisma/client";

const LEVELS: ContentDifficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const LEVEL_LABEL: Record<string, string> = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };

type OrgOption = { id: string; name: string };

type Props = {
  solutionId?: string;
  solutionSlug?: string;
  initialStatus?: string;
  initial?: Partial<SolutionDraftInput>;
  orgs?: OrgOption[];
  lockedOrgId?: string;
  publishDirectly?: boolean;
  onPublish?: (input: SolutionDraftInput & { id?: string }) => Promise<{ success: boolean; error?: string; data?: { slug: string } }>;
};

function newStep(): LabStepData {
  return { id: crypto.randomUUID(), title: "", content: "", imageUrls: [], pdfUrls: [] };
}

function parseSteps(raw: unknown): LabStepData[] {
  if (!Array.isArray(raw) || raw.length === 0) return [newStep()];
  // Support both old string[] format and new LabStepData[]
  return raw.map((s: unknown) => {
    if (typeof s === "string") return { id: crypto.randomUUID(), title: "", content: s, imageUrls: [], pdfUrls: [] };
    if (s && typeof s === "object" && "content" in s) return s as LabStepData;
    return newStep();
  });
}

// ── Compact multi-upload for images/PDFs inside a step ──────────────────────

function FileChips({ urls, onRemove, label }: { urls: string[]; onRemove: (url: string) => void; label: string }) {
  if (!urls.length) return null;
  return (
    <div className="mt-2">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {urls.map((u) => (
          <span key={u} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
            <span className="truncate max-w-[120px]">{u.split("/").pop()?.split("?")[0]}</span>
            <button type="button" onClick={() => onRemove(u)} className="hover:text-red-500"><X className="h-3 w-3" /></button>
          </span>
        ))}
      </div>
    </div>
  );
}

function StepMediaRow({
  imageUrls,
  pdfUrls,
  onImagesChange,
  onPdfsChange,
}: {
  imageUrls: string[];
  pdfUrls: string[];
  onImagesChange: (urls: string[]) => void;
  onPdfsChange: (urls: string[]) => void;
}) {
  const [uploading, setUploading] = useState<"image" | "pdf" | null>(null);
  const imgId = useId();
  const pdfId = useId();

  const upload = async (file: File, kind: "image" | "pdf") => {
    setUploading(kind);
    try {
      const { url } = await uploadMediaFile(file, kind === "image" ? "image" : "doc");
      if (kind === "image") onImagesChange([...imageUrls, url]);
      else onPdfsChange([...pdfUrls, url]);
    } catch { /* ignore */ }
    setUploading(null);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {/* Image upload */}
      <label
        htmlFor={imgId}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 cursor-pointer hover:border-brand hover:text-brand transition-colors"
      >
        <ImageIcon className="h-3.5 w-3.5" />
        {uploading === "image" ? "Uploading…" : "Add image"}
        <input
          id={imgId}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={!!uploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "image"); e.target.value = ""; }}
        />
      </label>

      {/* PDF upload */}
      <label
        htmlFor={pdfId}
        className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 cursor-pointer hover:border-brand hover:text-brand transition-colors"
      >
        <FileText className="h-3.5 w-3.5" />
        {uploading === "pdf" ? "Uploading…" : "Add PDF"}
        <input
          id={pdfId}
          type="file"
          accept="application/pdf"
          className="hidden"
          disabled={!!uploading}
          onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, "pdf"); e.target.value = ""; }}
        />
      </label>

      <FileChips urls={imageUrls} onRemove={(u) => onImagesChange(imageUrls.filter((x) => x !== u))} label="Images" />
      <FileChips urls={pdfUrls} onRemove={(u) => onPdfsChange(pdfUrls.filter((x) => x !== u))} label="PDFs" />
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export function SolutionEditorForm({
  solutionId,
  solutionSlug,
  initialStatus,
  initial,
  orgs,
  lockedOrgId,
  publishDirectly,
  onPublish,
}: Props) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [level, setLevel] = useState<ContentDifficulty>(initial?.level ?? "BEGINNER");
  const [hours, setHours] = useState(String(initial?.hours ?? "1"));
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [components, setComponents] = useState<string[]>(initial?.components ?? [""]);
  const [labSteps, setLabSteps] = useState<LabStepData[]>(parseSteps(initial?.labSteps));
  const [codeTemplate, setCodeTemplate] = useState(initial?.codeTemplate ?? "");
  const [relatedKitSlugs, setRelatedKitSlugs] = useState<string[]>(initial?.relatedKitSlugs ?? []);
  const [orgId, setOrgId] = useState(lockedOrgId ?? initial?.orgId ?? "");
  const [kitInput, setKitInput] = useState("");
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([0]));

  // Upload handler for Tiptap image insertion
  const handleEditorImageUpload = async (file: File): Promise<string> => {
    const { url } = await uploadMediaFile(file, "image");
    return url;
  };

  const updateStep = (idx: number, patch: Partial<LabStepData>) => {
    setLabSteps((prev) => prev.map((s, i) => i === idx ? { ...s, ...patch } : s));
  };

  const toggleStep = (idx: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const buildInput = (): SolutionDraftInput => ({
    title: title.trim(),
    subtitle: subtitle.trim() || undefined,
    description: description.trim(),
    level,
    hours: parseInt(hours, 10) || 1,
    thumbnailUrl: thumbnailUrl || null,
    tags,
    components: components.filter(Boolean),
    relatedKitSlugs,
    labSteps: labSteps.filter((s) => (s.content ?? "").trim() || s.title.trim()),
    codeTemplate: codeTemplate.trim() || undefined,
    orgId: orgId || null,
  });

  const handleSaveDraft = () => {
    startTransition(async () => {
      const input = buildInput();
      const res = solutionId ? await updateSolutionDraft(solutionId, input) : await createSolutionDraft(input);
      if (res.success) {
        showToast("Draft saved", "success");
        if (!solutionId && res.data && "slug" in res.data) {
          router.push(`/solutions/${res.data.slug}/edit`);
        } else {
          router.refresh();
        }
      } else showToast(!res.success ? res.error : "Failed", "error");
    });
  };

  const handleSubmitForReview = () => {
    if (!solutionId) { showToast("Save your draft first", "error"); return; }
    startTransition(async () => {
      const res = await submitSolutionForReview(solutionId);
      if (res.success) {
        showToast("Submitted for review! We'll notify you once it's approved.", "success");
        router.refresh();
      } else showToast(!res.success ? res.error : "Failed", "error");
    });
  };

  const handleDelete = () => {
    if (!solutionId) return;
    if (!confirm("Delete this draft permanently? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteSolutionDraft(solutionId);
      if (res.success) {
        showToast("Draft deleted", "success");
        router.push("/dashboard/solutions");
      } else showToast(!res.success ? res.error : "Failed", "error");
    });
  };

  const handlePublishDirectly = () => {
    if (!onPublish) return;
    startTransition(async () => {
      const input = buildInput();
      const res = await onPublish({ ...input, id: solutionId });
      if (res.success && res.data) {
        showToast("Published!", "success");
        router.push(`/solutions/${res.data.slug}`);
      } else showToast(res?.error ?? "Failed", "error");
    });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const addKit = () => {
    const k = kitInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (k && !relatedKitSlugs.includes(k)) setRelatedKitSlugs([...relatedKitSlugs, k]);
    setKitInput("");
  };

  const isSubmittable =
    solutionId &&
    initialStatus !== "PENDING_REVIEW" &&
    initialStatus !== "PUBLISHED" &&
    title.trim() &&
    description.trim() &&
    labSteps.some((s) => (s.content ?? "").trim() || s.title.trim());

  const isDeletable =
    solutionId &&
    !publishDirectly &&
    initialStatus !== "PENDING_REVIEW" &&
    initialStatus !== "PUBLISHED";

  return (
    <div className="max-w-3xl space-y-6">

      {/* Status banners */}
      {initialStatus === "PENDING_REVIEW" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <strong>Under review</strong> — our team is checking your submission. You&apos;ll be notified once it&apos;s approved or if changes are needed.
        </div>
      )}
      {initialStatus === "REJECTED" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <strong>Changes requested</strong> — please update your submission and resubmit.
        </div>
      )}

      {/* ── Basics ── */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Basics</h2>
        <Input
          label="Project title *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Smart Irrigation Controller with Soil Moisture Sensing"
        />
        <Input
          label="Tagline"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="One-line description shown in search results"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium">Difficulty *</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={level} onChange={(e) => setLevel(e.target.value as ContentDifficulty)}>
              {LEVELS.map((l) => <option key={l} value={l}>{LEVEL_LABEL[l]}</option>)}
            </select>
          </label>
          <Input label="Estimated hours *" type="number" min="1" max="100" value={hours} onChange={(e) => setHours(e.target.value)} />
        </div>
        {!lockedOrgId && orgs && orgs.length > 0 && (
          <label className="text-sm block">
            <span className="font-medium">Organisation (optional)</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={orgId} onChange={(e) => setOrgId(e.target.value)}>
              <option value="">No organisation — personal project</option>
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </label>
        )}
      </Card>

      {/* ── Cover image + tags ── */}
      <Card className="p-5 space-y-4">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Media & Tags</h2>
        <MediaUploadField
          kind="image"
          label="Cover image"
          hint="Shown on listing cards. Recommended 16:9, min 1200×675 px."
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
        />
        <div>
          <span className="text-sm font-medium">Tags</span>
          <div className="mt-1 flex flex-wrap gap-1.5 mb-2">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                {t}
                <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-red-500">×</button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
              placeholder="Add a tag (e.g. arduino, iot, sensor)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
            />
            <Button size="sm" variant="outline" onClick={addTag}>Add</Button>
          </div>
        </div>
      </Card>

      {/* ── Overview / Story — RICH EDITOR ── */}
      <Card className="p-5 space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Story / Overview *</h2>
        <p className="text-xs text-gray-500">Explain what this project does, what problem it solves, who it&apos;s for, and what learners will build. Use headings, lists, images, and links to make it easy to read.</p>
        <RichTextEditor
          value={description}
          onChange={setDescription}
          placeholder="Describe your project… Use H2 for sections, bullet lists for highlights, and images to show your build."
          minHeight={250}
          onImageUpload={handleEditorImageUpload}
        />
      </Card>

      {/* ── Lab Steps ── */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Lab Steps *</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Each step is a task the builder completes. Use rich text, images, and PDFs per step.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              const next = [...labSteps, newStep()];
              setLabSteps(next);
              setExpandedSteps((prev) => new Set(Array.from(prev).concat(next.length - 1)));
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" /> Add step
          </Button>
        </div>

        <div className="space-y-3">
          {labSteps.map((step, i) => {
            const isOpen = expandedSteps.has(i);
            return (
              <div key={step.id} className="rounded-xl border border-gray-200 overflow-hidden">
                {/* Step header */}
                <div
                  className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleStep(i)}
                >
                  <GripVertical className="h-4 w-4 text-gray-300 shrink-0" />
                  <div className="w-6 h-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <input
                    type="text"
                    placeholder={`Step ${i + 1} title…`}
                    value={step.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateStep(i, { title: e.target.value })}
                    className="flex-1 bg-transparent text-sm font-medium text-gray-700 placeholder-gray-400 focus:outline-none min-w-0"
                  />
                  <div className="flex items-center gap-1 shrink-0">
                    {(step.imageUrls?.length || step.pdfUrls?.length) ? (
                      <span className="text-[10px] text-gray-400 mr-1">
                        {step.imageUrls?.length ? `${step.imageUrls.length} img` : ""}{" "}
                        {step.pdfUrls?.length ? `${step.pdfUrls.length} pdf` : ""}
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setLabSteps(labSteps.filter((_, j) => j !== i)); }}
                      className="text-gray-300 hover:text-red-400 transition-colors p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>

                {/* Step body */}
                {isOpen && (
                  <div className="px-4 pb-4 pt-3 space-y-3">
                    <RichTextEditor
                      value={step.content}
                      onChange={(html) => updateStep(i, { content: html })}
                      placeholder={`Describe step ${i + 1}… Use headings, bullet points, code blocks, and images to guide the builder.`}
                      minHeight={160}
                      onImageUpload={handleEditorImageUpload}
                    />
                    <StepMediaRow
                      imageUrls={step.imageUrls ?? []}
                      pdfUrls={step.pdfUrls ?? []}
                      onImagesChange={(urls) => updateStep(i, { imageUrls: urls })}
                      onPdfsChange={(urls) => updateStep(i, { pdfUrls: urls })}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Components / Materials ── */}
      <Card className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Components / Materials</h2>
            <p className="text-xs text-gray-500 mt-0.5">List everything needed to build this project.</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setComponents([...components, ""])}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Add
          </Button>
        </div>
        <div className="space-y-2">
          {components.map((c, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
                placeholder="e.g. Arduino Uno R3 × 1"
                value={c}
                onChange={(e) => { const n = [...components]; n[i] = e.target.value; setComponents(n); }}
              />
              <button type="button" onClick={() => setComponents(components.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Starter Code ── */}
      <Card className="p-5 space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Starter Code (optional)</h2>
        <p className="text-xs text-gray-500">Paste your Arduino/C++ code. It will be shown with a copy button in the lab view.</p>
        <textarea
          className="w-full rounded-xl border bg-gray-900 text-green-300 font-mono px-4 py-3 text-sm min-h-[200px] focus:outline-none focus:ring-2 focus:ring-brand/40"
          value={codeTemplate}
          onChange={(e) => setCodeTemplate(e.target.value)}
          placeholder={"// Your starter code here\nvoid setup() {\n  // ...\n}\nvoid loop() {\n  // ...\n}"}
          spellCheck={false}
        />
      </Card>

      {/* ── Related Kits ── */}
      <Card className="p-5 space-y-3">
        <h2 className="font-semibold text-sm uppercase tracking-wide text-gray-400">Related Kits (optional)</h2>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {relatedKitSlugs.map((slug) => (
            <span key={slug} className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
              {slug}
              <button type="button" onClick={() => setRelatedKitSlugs(relatedKitSlugs.filter((s) => s !== slug))} className="hover:text-red-500">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
            placeholder="Kit slug (e.g. starter-kit)"
            value={kitInput}
            onChange={(e) => setKitInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKit())}
          />
          <Button size="sm" variant="outline" onClick={addKit}>Link kit</Button>
        </div>
      </Card>

      {/* ── Actions ── */}
      <div className="flex flex-wrap gap-3 pb-8">
        <Button variant="outline" disabled={isPending} onClick={handleSaveDraft}>
          <Save className="h-4 w-4 mr-1.5" />
          {isPending ? "Saving…" : solutionId ? "Save changes" : "Save draft"}
        </Button>

        {solutionSlug && (
          <Button asChild variant="ghost">
            <a href={`/solutions/${solutionSlug}`} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-1.5" /> Preview
            </a>
          </Button>
        )}

        {publishDirectly && onPublish ? (
          <Button disabled={isPending} onClick={handlePublishDirectly}>Publish now</Button>
        ) : (
          isSubmittable && (
            <Button disabled={isPending} onClick={handleSubmitForReview}>
              <Send className="h-4 w-4 mr-1.5" /> Submit for review
            </Button>
          )
        )}

        {isDeletable && (
          <Button
            variant="ghost"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            disabled={isPending}
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-1.5" /> Delete draft
          </Button>
        )}
      </div>
    </div>
  );
}
