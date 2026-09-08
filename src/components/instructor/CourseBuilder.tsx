"use client";

/**
 * CourseBuilder — multi-step course creation form.
 * VIDEO and AUDIO are preserved in DB but hidden from the UI (re-enable later).
 * Active content types: Article, Quiz, Assignment.
 * Article PDF mode: articleBody is stored as "pdf::<url>" when a PDF is uploaded instead of written.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Loader2, Plus, Trash2, Pencil, Check, X,
  ChevronDown, ChevronUp, ArrowUp, ArrowDown,
  FileText, Headphones, HelpCircle, ClipboardList,
  Paperclip, ExternalLink, FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ArticleEditor } from "@/components/instructor/ArticleEditor";
import { MediaUploadField } from "@/components/ui/MediaUploadField";
import { QuizBuilder } from "@/components/instructor/QuizBuilder";
import { AssignmentBuilder } from "@/components/instructor/AssignmentBuilder";
import { CertificateTemplateUploader } from "@/components/instructor/CertificateTemplateUploader";
import {
  saveBasicInfo, addModule, updateModuleTitle, deleteModule, reorderModule,
  addLesson, updateLesson, deleteLesson, reorderLesson,
  saveRequirements, savePricing, saveSEO, submitForReview,
} from "@/lib/actions/courses";
import { uploadMediaFile } from "@/lib/upload-client";
import { cn } from "@/lib/utils";
import { PDF_PREFIX } from "@/lib/constants";

export type PublishedKitOption = { id: string; slug: string; title: string };

// ─── Types ────────────────────────────────────────────────────────────────────

type Attachment = { name: string; url: string; size: number };

type LessonRow = {
  id: string;
  title: string;
  type: string;
  videoUrl?: string | null;
  audioUrl?: string | null;
  articleBody?: string | null;
  attachments?: Attachment[] | null;
  isFreePreview: boolean;
  orderIndex: number;
};

type ModuleRow = {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonRow[];
};

type CourseData = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnailUrl?: string | null;
  category?: string | null;
  level: string;
  language: string;
  modules: ModuleRow[];
  whatYouLearn?: string[] | null;
  prerequisites?: string | null;
  targetAudience?: string | null;
  linkedKitSlugs?: string[] | null;
  isFree: boolean;
  price?: string | number | null;
  discountPrice?: string | number | null;
  metaTitle?: string | null;
  metaDesc?: string | null;
  enableCert: boolean;
  status: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = ["Basic Info", "Curriculum", "Requirements", "Pricing", "SEO & Cert", "Review"];

// VIDEO and AUDIO are intentionally omitted — kept in DB, hidden from UI until re-enabled
const LESSON_TYPES = [
  { value: "ARTICLE",    label: "Article",    icon: <FileText className="h-3.5 w-3.5" />,     hint: "Text content or upload a PDF as the lesson" },
  { value: "QUIZ",       label: "Quiz",       icon: <HelpCircle className="h-3.5 w-3.5" />,   hint: "Multiple-choice knowledge check" },
  { value: "ASSIGNMENT", label: "Assignment", icon: <ClipboardList className="h-3.5 w-3.5" />, hint: "Student submission with rubric grading" },
] as const;

const LESSON_TYPE_ICON: Record<string, React.ReactNode> = {
  ARTICLE:    <FileText className="h-3.5 w-3.5" />,
  AUDIO:      <Headphones className="h-3.5 w-3.5" />,
  QUIZ:       <HelpCircle className="h-3.5 w-3.5" />,
  ASSIGNMENT: <ClipboardList className="h-3.5 w-3.5" />,
  VIDEO:      <FileText className="h-3.5 w-3.5" />,
};

const LESSON_TYPE_LABEL: Record<string, string> = {
  ARTICLE: "Article", AUDIO: "Audio (legacy)", QUIZ: "Quiz", ASSIGNMENT: "Assignment", VIDEO: "Video (legacy)",
};


const CATEGORIES = [
  "Robotics", "Electronics", "IoT & Sensors", "Programming", "Artificial Intelligence",
  "3D Design & Printing", "Mechanical Engineering", "Physics", "Mathematics", "Chemistry",
  "Biology & Life Sciences", "Environmental Science", "Astronomy", "Computer Science",
  "Cybersecurity", "Data Science", "Entrepreneurship & STEM", "Other",
];

const STATUS_VARIANT: Record<string, "warning" | "accent" | "success" | "error" | "default"> = {
  DRAFT: "warning", PENDING_REVIEW: "accent", PUBLISHED: "success",
  REJECTED: "error", ARCHIVED: "default",
};

const ATTACHMENT_ACCEPT = [
  ".pdf", ".doc", ".docx", ".txt", ".md",
  ".xls", ".xlsx", ".csv",
  ".ppt", ".pptx",
  ".zip", ".tar.gz", ".7z",
  ".mp3", ".wav",
].join(",");

// ─── Attachments mini-uploader ────────────────────────────────────────────────

function AttachmentsField({
  value,
  onChange,
}: {
  value: Attachment[];
  onChange: (a: Attachment[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    setError("");
    const results: Attachment[] = [];
    for (const file of files) {
      try {
        const res = await uploadMediaFile(file, "doc");
        results.push({ name: file.name, url: res.url, size: file.size });
      } catch (err: unknown) {
        setError(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : "unknown error"}`);
      }
    }
    onChange([...value, ...results]);
    setUploading(false);
    e.target.value = "";
  }

  function remove(url: string) {
    onChange(value.filter((a) => a.url !== url));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <Paperclip className="inline h-3.5 w-3.5 mr-1 text-gray-400" />
        Downloadable resources
      </label>

      {value.length > 0 && (
        <ul className="space-y-1.5">
          {value.map((a) => (
            <li key={a.url} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm">
              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="flex-1 truncate font-medium text-brand hover:underline">
                {a.name}
              </a>
              <span className="shrink-0 text-xs text-gray-400">{formatSize(a.size)}</span>
              <button type="button" onClick={() => remove(a.url)} className="shrink-0 text-gray-400 hover:text-red-500">
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <label className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg border-2 border-dashed border-gray-200 px-4 py-2.5 text-sm text-gray-500 transition hover:border-brand/40 hover:text-brand",
        uploading && "opacity-50 cursor-not-allowed"
      )}>
        <input type="file" multiple accept={ATTACHMENT_ACCEPT} className="sr-only" onChange={handleFiles} disabled={uploading} />
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        {uploading ? "Uploading…" : "Attach files (PDF, Word, Excel, PPT, ZIP, MP3…)"}
      </label>

      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

// ─── Lesson form (inline) ─────────────────────────────────────────────────────

function LessonForm({
  moduleId, courseId, instructorId, initial, onSaved, onCancel,
}: {
  moduleId: string; courseId: string; instructorId: string;
  initial?: LessonRow; onSaved: (lesson: LessonRow) => void; onCancel: () => void;
}) {
  const initialBody = initial?.articleBody ?? "";
  const isPdfInitial = initialBody.startsWith(PDF_PREFIX);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState(initial?.type ?? "ARTICLE");
  const [articleMode, setArticleMode] = useState<"write" | "pdf">(isPdfInitial ? "pdf" : "write");
  const [articleBody, setArticleBody] = useState(isPdfInitial ? "" : initialBody);
  const [articlePdfUrl, setArticlePdfUrl] = useState(isPdfInitial ? initialBody.slice(PDF_PREFIX.length) : "");
  const [pdfUploading, setPdfUploading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>(initial?.attachments ?? []);
  const [isFreePreview, setIsFreePreview] = useState(initial?.isFreePreview ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedLessonId, setSavedLessonId] = useState<string | null>(initial?.id ?? null);

  // Resolve the stored articleBody value based on current mode
  function resolvedArticleBody() {
    if (type === "ARTICLE" && articleMode === "pdf") {
      return articlePdfUrl ? `${PDF_PREFIX}${articlePdfUrl}` : "";
    }
    return articleBody;
  }

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfUploading(true);
    setError("");
    try {
      const res = await uploadMediaFile(file, "doc");
      setArticlePdfUrl(res.url);
    } catch (err: unknown) {
      setError(`PDF upload failed: ${err instanceof Error ? err.message : "unknown error"}`);
    }
    setPdfUploading(false);
    e.target.value = "";
  }

  async function handleSave() {
    if (!title.trim()) { setError("Lesson title is required."); return; }
    if (type === "ARTICLE" && articleMode === "pdf" && !articlePdfUrl) {
      setError("Please upload a PDF or switch to the write mode."); return;
    }
    setSaving(true);
    setError("");

    const payload = {
      title, type,
      articleBody: resolvedArticleBody(),
      attachments,
      isFreePreview,
    };
    let res;
    if (initial?.id) {
      res = await updateLesson(initial.id, moduleId, courseId, instructorId, payload);
    } else {
      res = await addLesson(moduleId, courseId, instructorId, payload);
    }
    setSaving(false);
    if (!res.success) { setError(res.error); return; }

    const body = resolvedArticleBody();
    const saved = (res.data as LessonRow | undefined)
      ?? ({ ...initial!, title, type, articleBody: body, attachments, isFreePreview } as LessonRow);
    setSavedLessonId(saved.id);

    if (type !== "QUIZ" && type !== "ASSIGNMENT") onSaved(saved);
  }

  const isQuizOrAssignment = type === "QUIZ" || type === "ASSIGNMENT";

  return (
    <div className="space-y-4 rounded-xl border border-brand/20 bg-orange-50/60 p-4">
      {/* Title + Type */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Lesson title *"
          value={title}
          placeholder="e.g. Introduction to sensors"
          onChange={(e) => setTitle(e.target.value)}
        />
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Lesson type</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {LESSON_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                title={t.hint}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border-2 px-3 py-2 text-sm font-medium transition",
                  type === t.value
                    ? "border-brand bg-brand/5 text-brand"
                    : "border-gray-200 text-gray-600 hover:border-gray-300"
                )}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Article — write or PDF toggle */}
      {type === "ARTICLE" && (
        <div className="space-y-3">
          {/* Mode toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white p-1 w-fit">
            <button
              type="button"
              onClick={() => setArticleMode("write")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                articleMode === "write" ? "bg-brand text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <FileText className="h-3.5 w-3.5" />Write content
            </button>
            <button
              type="button"
              onClick={() => setArticleMode("pdf")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                articleMode === "pdf" ? "bg-brand text-white shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <FileUp className="h-3.5 w-3.5" />Upload PDF
            </button>
          </div>

          {articleMode === "write" ? (
            <ArticleEditor
              value={articleBody}
              onChange={setArticleBody}
              placeholder="Write your lesson here. Use the toolbar for headings, bold, lists, code blocks, and more."
              minHeight={220}
            />
          ) : (
            <div className="space-y-2">
              {articlePdfUrl ? (
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3">
                  <FileUp className="h-5 w-5 shrink-0 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <a href={articlePdfUrl} target="_blank" rel="noopener noreferrer"
                      className="block truncate text-sm font-medium text-green-800 hover:underline">
                      {articlePdfUrl.split("/").pop()}
                    </a>
                    <p className="text-xs text-green-600 mt-0.5">PDF uploaded — students will view this as the lesson</p>
                  </div>
                  <button type="button" onClick={() => setArticlePdfUrl("")}
                    className="shrink-0 text-green-600 hover:text-red-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className={cn(
                  "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 px-6 py-8 text-center text-sm text-gray-500 transition hover:border-brand/40 hover:text-brand",
                  pdfUploading && "opacity-50 cursor-not-allowed"
                )}>
                  <input type="file" accept=".pdf,application/pdf" className="sr-only"
                    onChange={handlePdfUpload} disabled={pdfUploading} />
                  {pdfUploading
                    ? <Loader2 className="h-8 w-8 animate-spin text-brand" />
                    : <FileUp className="h-8 w-8 text-gray-300" />}
                  <span className="font-medium">
                    {pdfUploading ? "Uploading PDF…" : "Click to upload a PDF"}
                  </span>
                  {!pdfUploading && <span className="text-xs text-gray-400">PDF — max 100 MB</span>}
                </label>
              )}
            </div>
          )}
        </div>
      )}

      {/* Assignment instructions */}
      {type === "ASSIGNMENT" && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Assignment instructions</label>
          <ArticleEditor
            value={articleBody}
            onChange={setArticleBody}
            placeholder="Describe what students need to do, the expected output, and any constraints."
            minHeight={160}
          />
        </div>
      )}

      {/* Attachments — available for Article and Assignment */}
      {(type === "ARTICLE" || type === "ASSIGNMENT") && (
        <AttachmentsField value={attachments} onChange={setAttachments} />
      )}

      {/* Free preview toggle */}
      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isFreePreview}
          onChange={(e) => setIsFreePreview(e.target.checked)}
          className="rounded border-gray-300 text-brand focus:ring-brand"
        />
        <span className="font-medium">Free preview</span>
        <span className="text-gray-500">— visible without enrolment</span>
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Save / cancel */}
      {(!savedLessonId || !isQuizOrAssignment) && (
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <Check className="h-3.5 w-3.5 mr-1" />}
            {saving ? "Saving…" : initial?.id
              ? "Save lesson"
              : isQuizOrAssignment ? `Save & configure ${type.toLowerCase()}` : "Add lesson"}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel} disabled={saving}>
            <X className="h-3.5 w-3.5 mr-1" />Cancel
          </Button>
        </div>
      )}

      {/* Quiz builder — inline after save */}
      {type === "QUIZ" && savedLessonId && (
        <div className="mt-2 space-y-3">
          <QuizBuilder lessonId={savedLessonId} lessonTitle={title} />
          <Button size="sm" variant="outline" onClick={() =>
            onSaved({ id: savedLessonId, title, type, articleBody: resolvedArticleBody(), attachments, isFreePreview, orderIndex: initial?.orderIndex ?? 0 })
          }>
            <Check className="h-3.5 w-3.5 mr-1" />Done with quiz
          </Button>
        </div>
      )}

      {/* Assignment builder — inline after save */}
      {type === "ASSIGNMENT" && savedLessonId && (
        <div className="mt-2 space-y-3">
          <AssignmentBuilder lessonId={savedLessonId} lessonTitle={title} instructorId={instructorId} />
          <Button size="sm" variant="outline" onClick={() =>
            onSaved({ id: savedLessonId, title, type, articleBody: resolvedArticleBody(), attachments, isFreePreview, orderIndex: initial?.orderIndex ?? 0 })
          }>
            <Check className="h-3.5 w-3.5 mr-1" />Done with assignment
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Step 1 — Basic Info ──────────────────────────────────────────────────────

function StepBasicInfo({ courseId, instructorId, data, onChange, onSaved }: {
  courseId: string; instructorId: string; data: CourseData;
  onChange: (p: Partial<CourseData>) => void; onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const descLen = (data.description ?? "").length;

  async function handleSave() {
    if (!data.title?.trim() || data.title === "Untitled course") {
      setError("Please enter a course title."); return;
    }
    setSaving(true); setError("");
    const res = await saveBasicInfo(courseId, instructorId, {
      title: data.title, subtitle: data.subtitle ?? "", description: data.description ?? "",
      category: data.category ?? "", level: data.level, language: data.language,
      thumbnailUrl: data.thumbnailUrl ?? "",
    });
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    onSaved();
  }

  return (
    <Card className="space-y-5">
      <Input
        label="Course title *"
        value={data.title === "Untitled course" ? "" : data.title}
        placeholder="e.g. Arduino Robotics for Beginners"
        onChange={(e) => onChange({ title: e.target.value || "Untitled course" })}
      />
      <Input
        label="Subtitle"
        value={data.subtitle ?? ""}
        placeholder="One-line hook that sells the course"
        onChange={(e) => onChange({ subtitle: e.target.value })}
      />

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <Label htmlFor="course-description">Description *</Label>
          <span className={cn("text-xs", descLen < 50 ? "text-amber-500" : "text-gray-400")}>
            {descLen} chars {descLen < 50 ? "— aim for 50+" : ""}
          </span>
        </div>
        <Textarea
          id="course-description"
          className="h-28 resize-none"
          value={data.description ?? ""}
          placeholder="What will students build or achieve? Who is this for? What makes this course special?"
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Category — free-text with predefined suggestions */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Category</label>
          <input
            list="course-categories"
            className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand/40 focus:outline-none"
            value={data.category ?? ""}
            placeholder="Select or type a category…"
            onChange={(e) => onChange({ category: e.target.value })}
          />
          <datalist id="course-categories">
            {CATEGORIES.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">Level</label>
          <select
            className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand/40 focus:outline-none"
            value={data.level}
            onChange={(e) => onChange({ level: e.target.value })}
          >
            <option value="BEGINNER">Beginner — no prior knowledge needed</option>
            <option value="INTERMEDIATE">Intermediate — some background helpful</option>
            <option value="ADVANCED">Advanced — experience required</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Language</label>
        <select
          className="w-full rounded-xl border border-gray-200 p-2.5 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand/40 focus:outline-none"
          value={data.language}
          onChange={(e) => onChange({ language: e.target.value })}
        >
          <option>English</option>
          <option>Swahili</option>
          <option>English &amp; Swahili</option>
          <option>French</option>
        </select>
      </div>

      <MediaUploadField
        kind="image"
        label="Course thumbnail *"
        value={data.thumbnailUrl ?? ""}
        onChange={(url) => onChange({ thumbnailUrl: url })}
        hint="JPEG · PNG · WebP · max 10 MB — 1280×720 px recommended"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save & continue →"}
      </Button>
    </Card>
  );
}

// ─── Step 2 — Curriculum ──────────────────────────────────────────────────────

function StepCurriculum({ courseId, instructorId, modules, onModulesChange }: {
  courseId: string; instructorId: string;
  modules: ModuleRow[]; onModulesChange: (m: ModuleRow[]) => void;
}) {
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [addingModule, setAddingModule] = useState(false);
  const [savingModule, setSavingModule] = useState(false);
  const [moduleError, setModuleError] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingModuleTitle, setEditingModuleTitle] = useState("");
  const [addingLessonTo, setAddingLessonTo] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ moduleId: string; lesson: LessonRow } | null>(null);

  function toggleExpand(id: string) {
    setExpanded((p) => { const n = new Set(Array.from(p)); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  async function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    setSavingModule(true); setModuleError("");
    const res = await addModule(courseId, instructorId, newModuleTitle.trim());
    setSavingModule(false);
    if (!res.success) { setModuleError(res.error); return; }
    const newMod = res.data as ModuleRow;
    onModulesChange([...modules, newMod]);
    setNewModuleTitle(""); setAddingModule(false);
    setExpanded((p) => new Set([...Array.from(p), newMod.id]));
  }

  async function handleDeleteModule(moduleId: string) {
    if (!confirm("Delete this module and all its lessons?")) return;
    const res = await deleteModule(moduleId, courseId, instructorId);
    if (!res.success) { alert(res.error); return; }
    onModulesChange(modules.filter((m) => m.id !== moduleId));
  }

  async function handleSaveModuleTitle(moduleId: string) {
    if (!editingModuleTitle.trim()) return;
    const res = await updateModuleTitle(moduleId, courseId, instructorId, editingModuleTitle.trim());
    if (!res.success) { alert(res.error); return; }
    onModulesChange(modules.map((m) => m.id === moduleId ? { ...m, title: editingModuleTitle.trim() } : m));
    setEditingModuleId(null);
  }

  async function handleReorderModule(moduleId: string, direction: "up" | "down") {
    const res = await reorderModule(moduleId, courseId, instructorId, direction);
    if (!res.success) return;
    const sorted = [...modules].sort((a, b) => a.orderIndex - b.orderIndex);
    const idx = sorted.findIndex((m) => m.id === moduleId);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    const tmp = sorted[idx].orderIndex;
    sorted[idx] = { ...sorted[idx], orderIndex: sorted[swapIdx].orderIndex };
    sorted[swapIdx] = { ...sorted[swapIdx], orderIndex: tmp };
    onModulesChange(sorted.sort((a, b) => a.orderIndex - b.orderIndex));
  }

  async function handleReorderLesson(moduleId: string, lessonId: string, direction: "up" | "down") {
    const res = await reorderLesson(lessonId, moduleId, courseId, instructorId, direction);
    if (!res.success) return;
    onModulesChange(modules.map((m) => {
      if (m.id !== moduleId) return m;
      const sorted = [...m.lessons].sort((a, b) => a.orderIndex - b.orderIndex);
      const idx = sorted.findIndex((l) => l.id === lessonId);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return m;
      const tmp = sorted[idx].orderIndex;
      sorted[idx] = { ...sorted[idx], orderIndex: sorted[swapIdx].orderIndex };
      sorted[swapIdx] = { ...sorted[swapIdx], orderIndex: tmp };
      return { ...m, lessons: sorted.sort((a, b) => a.orderIndex - b.orderIndex) };
    }));
  }

  async function handleDeleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    const res = await deleteLesson(lessonId, moduleId, courseId, instructorId);
    if (!res.success) { alert(res.error); return; }
    onModulesChange(modules.map((m) =>
      m.id === moduleId ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) } : m
    ));
  }

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold">Curriculum</h2>
          {totalLessons > 0 && (
            <p className="text-xs text-gray-500 mt-0.5">{modules.length} module{modules.length !== 1 ? "s" : ""} · {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}</p>
          )}
        </div>
        <Button size="sm" onClick={() => { setAddingModule(true); setNewModuleTitle(""); }}>
          <Plus className="h-3.5 w-3.5 mr-1" />Add module
        </Button>
      </div>

      {modules.length === 0 && !addingModule && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
          <FileText className="mx-auto mb-2 h-7 w-7 text-gray-300" />
          No modules yet — click <strong>Add module</strong> to start building your curriculum.
        </div>
      )}

      <div className="space-y-3">
        {modules.map((mod, modIdx) => (
          <div key={mod.id} className="rounded-xl border overflow-hidden">
            {/* Module header */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2.5">
              <button type="button" className="text-gray-400 hover:text-brand shrink-0" onClick={() => toggleExpand(mod.id)}>
                {expanded.has(mod.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {editingModuleId === mod.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    className="flex-1 rounded-lg border border-gray-300 px-2 py-1 text-sm focus:ring-2 focus:ring-brand/20 focus:outline-none"
                    value={editingModuleTitle}
                    onChange={(e) => setEditingModuleTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSaveModuleTitle(mod.id)}
                    autoFocus
                  />
                  <button type="button" className="text-green-600 hover:text-green-700" onClick={() => handleSaveModuleTitle(mod.id)}>
                    <Check className="h-4 w-4" />
                  </button>
                  <button type="button" className="text-gray-400" onClick={() => setEditingModuleId(null)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <span
                  className="flex-1 font-semibold text-sm cursor-pointer"
                  onDoubleClick={() => { setEditingModuleId(mod.id); setEditingModuleTitle(mod.title); }}
                >
                  Section {modIdx + 1}: {mod.title}
                </span>
              )}

              <span className="text-xs text-gray-400 mr-1 shrink-0">
                {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
              </span>

              {/* Reorder */}
              <button type="button" disabled={modIdx === 0} onClick={() => handleReorderModule(mod.id, "up")}
                className="rounded p-1 text-gray-400 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed">
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button type="button" disabled={modIdx === modules.length - 1} onClick={() => handleReorderModule(mod.id, "down")}
                className="rounded p-1 text-gray-400 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed">
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="rounded p-1 text-gray-400 hover:text-brand"
                onClick={() => { setEditingModuleId(mod.id); setEditingModuleTitle(mod.title); setExpanded((p) => new Set([...Array.from(p), mod.id])); }}>
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button type="button" className="rounded p-1 text-gray-400 hover:text-red-500"
                onClick={() => handleDeleteModule(mod.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Lessons list */}
            {expanded.has(mod.id) && (
              <div className="px-4 pb-3 pt-1">
                {mod.lessons.length > 0 && (
                  <ul className="divide-y">
                    {mod.lessons.map((lesson, lessonIdx) => (
                      <li key={lesson.id} className="flex items-center justify-between py-2.5 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="shrink-0 text-xs font-mono text-gray-400 w-6 text-right">{lessonIdx + 1}.</span>
                          <span className={cn(
                            "flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium",
                            lesson.type === "QUIZ" ? "bg-purple-50 text-purple-700" :
                            lesson.type === "ASSIGNMENT" ? "bg-amber-50 text-amber-700" :
                            lesson.type === "AUDIO" ? "bg-sky-50 text-sky-700" :
                            "bg-gray-100 text-gray-600"
                          )}>
                            {LESSON_TYPE_ICON[lesson.type]}
                            {LESSON_TYPE_LABEL[lesson.type]}
                          </span>
                          <span className="truncate font-medium">{lesson.title}</span>
                          {lesson.isFreePreview && (
                            <span className="shrink-0 text-xs font-semibold text-green-600">Free</span>
                          )}
                          {(lesson.attachments?.length ?? 0) > 0 && (
                            <span className="shrink-0 text-xs text-gray-400">
                              <Paperclip className="inline h-3 w-3 mr-0.5" />{lesson.attachments!.length}
                            </span>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5 ml-2">
                          <button type="button" disabled={lessonIdx === 0} onClick={() => handleReorderLesson(mod.id, lesson.id, "up")}
                            className="rounded p-1 text-gray-300 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed">
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button type="button" disabled={lessonIdx === mod.lessons.length - 1} onClick={() => handleReorderLesson(mod.id, lesson.id, "down")}
                            className="rounded p-1 text-gray-300 hover:text-brand disabled:opacity-30 disabled:cursor-not-allowed">
                            <ArrowDown className="h-3 w-3" />
                          </button>
                          <button type="button" className="rounded p-1 text-gray-400 hover:text-brand"
                            onClick={() => { setEditingLesson({ moduleId: mod.id, lesson }); setAddingLessonTo(null); }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" className="rounded p-1 text-gray-400 hover:text-red-500"
                            onClick={() => handleDeleteLesson(mod.id, lesson.id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Editing existing lesson */}
                {editingLesson?.moduleId === mod.id && (
                  <div className="mt-3">
                    <LessonForm
                      moduleId={mod.id} courseId={courseId} instructorId={instructorId}
                      initial={editingLesson.lesson}
                      onSaved={(updated) => {
                        onModulesChange(modules.map((m) =>
                          m.id === mod.id ? { ...m, lessons: m.lessons.map((l) => l.id === updated.id ? updated : l) } : m
                        ));
                        setEditingLesson(null);
                      }}
                      onCancel={() => setEditingLesson(null)}
                    />
                  </div>
                )}

                {/* Adding new lesson */}
                {addingLessonTo === mod.id ? (
                  <div className="mt-3">
                    <LessonForm
                      moduleId={mod.id} courseId={courseId} instructorId={instructorId}
                      onSaved={(newLesson) => {
                        onModulesChange(modules.map((m) =>
                          m.id === mod.id ? { ...m, lessons: [...m.lessons, newLesson] } : m
                        ));
                        setAddingLessonTo(null);
                      }}
                      onCancel={() => setAddingLessonTo(null)}
                    />
                  </div>
                ) : (
                  editingLesson?.moduleId !== mod.id && (
                    <button type="button"
                      className="mt-3 flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
                      onClick={() => { setAddingLessonTo(mod.id); setEditingLesson(null); }}>
                      <Plus className="h-3.5 w-3.5" />Add lesson
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* New module input */}
      {addingModule && (
        <div className="mt-3 flex items-center gap-2">
          <input
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:outline-none"
            placeholder="Module title, e.g. Getting Started"
            value={newModuleTitle}
            autoFocus
            onChange={(e) => setNewModuleTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
          />
          <Button size="sm" onClick={handleAddModule} disabled={savingModule || !newModuleTitle.trim()}>
            {savingModule ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setAddingModule(false)}>Cancel</Button>
        </div>
      )}
      {moduleError && <p className="mt-2 text-sm text-red-600">{moduleError}</p>}
    </Card>
  );
}

// ─── Step 3 — Requirements ────────────────────────────────────────────────────

function StepRequirements({ courseId, instructorId, data, publishedKits, onChange, onSaved }: {
  courseId: string; instructorId: string; data: CourseData;
  publishedKits: PublishedKitOption[];
  onChange: (p: Partial<CourseData>) => void; onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const objectives: string[] = Array.isArray(data.whatYouLearn) ? data.whatYouLearn : [];
  const kitSlugs: string[] = Array.isArray(data.linkedKitSlugs) ? data.linkedKitSlugs : [];

  async function handleSave() {
    setSaving(true); setError("");
    const res = await saveRequirements(courseId, instructorId, {
      whatYouLearn: objectives.filter(Boolean),
      prerequisites: data.prerequisites ?? "",
      targetAudience: data.targetAudience ?? "",
      linkedKitSlugs: kitSlugs,
    });
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    onSaved();
  }

  return (
    <Card className="space-y-5">
      {/* Learning outcomes */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">What students will learn *</label>
            <p className="text-xs text-gray-500 mt-0.5">Up to 8 bullet points. Be specific and outcome-focused.</p>
          </div>
          {objectives.length < 8 && (
            <button type="button" className="text-xs font-medium text-brand hover:underline"
              onClick={() => onChange({ whatYouLearn: [...objectives, ""] })}>
              + Add
            </button>
          )}
        </div>
        <div className="space-y-2">
          {(objectives.length > 0 ? objectives : [""]).map((obj, i) => (
            <div key={i} className="flex gap-2 items-center">
              <span className="shrink-0 w-5 text-center text-xs font-semibold text-brand">{i + 1}.</span>
              <input
                className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:outline-none"
                placeholder={`e.g. Build a ${["line-following robot", "soil moisture sensor", "traffic light circuit", "LED matrix display"][i] ?? "project from scratch"}`}
                value={obj}
                onChange={(e) => {
                  const next = [...objectives]; next[i] = e.target.value;
                  onChange({ whatYouLearn: next });
                }}
              />
              {objectives.length > 1 && (
                <button type="button" className="text-gray-400 hover:text-red-500"
                  onClick={() => onChange({ whatYouLearn: objectives.filter((_, j) => j !== i) })}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Textarea
        label="Prerequisites"
        className="h-20 resize-none"
        placeholder="e.g. Basic programming knowledge, curiosity about electronics, no prior robotics experience needed"
        value={data.prerequisites ?? ""}
        onChange={(e) => onChange({ prerequisites: e.target.value })}
      />

      <Input
        label="Target audience"
        value={data.targetAudience ?? ""}
        placeholder="e.g. High school students aged 14–18, STEM enthusiasts, hobbyists"
        onChange={(e) => onChange({ targetAudience: e.target.value })}
      />

      {publishedKits.length > 0 && (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Linked learning kits</label>
          <p className="mb-2 text-xs text-gray-500">Shown on the course page and in the learn player sidebar as recommended materials.</p>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border border-gray-200 p-3">
            {publishedKits.map((kit) => (
              <label key={kit.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-gray-50">
                <input type="checkbox"
                  checked={kitSlugs.includes(kit.slug)}
                  onChange={(e) => onChange({ linkedKitSlugs: e.target.checked ? [...kitSlugs, kit.slug] : kitSlugs.filter((s) => s !== kit.slug) })}
                  className="rounded border-gray-300 text-brand focus:ring-brand"
                />
                <span className="text-sm font-medium">{kit.title}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save & continue →"}
      </Button>
    </Card>
  );
}

// ─── Step 4 — Pricing ─────────────────────────────────────────────────────────

function StepPricing({ courseId, instructorId, data, onChange, onSaved }: {
  courseId: string; instructorId: string; data: CourseData;
  onChange: (p: Partial<CourseData>) => void; onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true); setError("");
    const res = await savePricing(courseId, instructorId, {
      isFree: data.isFree,
      price: String(data.price ?? ""),
      discountPrice: String(data.discountPrice ?? ""),
    });
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    onSaved();
  }

  return (
    <Card className="space-y-5">
      <div>
        <label className="mb-3 block text-sm font-medium text-gray-700">Pricing model</label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            { value: true, label: "Free", desc: "Open to all students, no payment required" },
            { value: false, label: "Paid", desc: "Students purchase access to unlock content" },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => onChange({ isFree: opt.value })}
              className={cn(
                "rounded-xl border-2 p-4 text-left transition",
                data.isFree === opt.value
                  ? "border-brand bg-brand/5"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <p className={cn("font-semibold text-sm", data.isFree === opt.value ? "text-brand" : "text-gray-800")}>
                {opt.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {!data.isFree && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Input
              label="Price (TZS) *"
              type="number" min="0"
              value={String(data.price ?? "")}
              placeholder="e.g. 45000"
              onChange={(e) => onChange({ price: e.target.value })}
            />
          </div>
          <div>
            <Input
              label="Sale price (TZS)"
              type="number" min="0"
              value={String(data.discountPrice ?? "")}
              placeholder="Leave blank if no discount"
              onChange={(e) => onChange({ discountPrice: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">Shows a strikethrough on the original price.</p>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save & continue →"}
      </Button>
    </Card>
  );
}

// ─── Step 5 — SEO & Certificate ───────────────────────────────────────────────

function StepSEO({ courseId, instructorId, data, onChange, onSaved }: {
  courseId: string; instructorId: string; data: CourseData;
  onChange: (p: Partial<CourseData>) => void; onSaved: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const metaLen = (data.metaDesc ?? "").length;

  async function handleSave() {
    setSaving(true); setError("");
    const res = await saveSEO(courseId, instructorId, {
      metaTitle: data.metaTitle ?? "",
      metaDesc: data.metaDesc ?? "",
      enableCert: data.enableCert,
    });
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    onSaved();
  }

  return (
    <Card className="space-y-5">
      <Input
        label="SEO title"
        value={data.metaTitle ?? ""}
        placeholder="Defaults to course title if left blank"
        onChange={(e) => onChange({ metaTitle: e.target.value })}
      />

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <Label htmlFor="course-seo-description">SEO description</Label>
          <span className={cn("text-xs", metaLen > 160 ? "text-red-500" : metaLen > 120 ? "text-green-600" : "text-gray-400")}>
            {metaLen}/160
          </span>
        </div>
        <Textarea
          id="course-seo-description"
          className="h-20 resize-none"
          value={data.metaDesc ?? ""}
          placeholder="150–160 characters shown in Google search results. Describe the course and its value concisely."
          onChange={(e) => onChange({ metaDesc: e.target.value })}
        />
      </div>

      <div className="rounded-xl border border-gray-200 p-4 space-y-3">
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={data.enableCert}
            onChange={(e) => onChange({ enableCert: e.target.checked })}
            className="rounded border-gray-300 text-brand focus:ring-brand"
          />
          <div>
            <span className="font-medium">Issue completion certificate</span>
            <p className="text-xs text-gray-500 mt-0.5">Students receive a certificate after completing all lessons.</p>
          </div>
        </label>

        {data.enableCert && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-3">
              Optionally upload a branded PDF template with form fields. A default design is used if none is uploaded.
            </p>
            <CertificateTemplateUploader courseId={courseId} />
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={handleSave} disabled={saving}>
        {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</> : "Save & continue →"}
      </Button>
    </Card>
  );
}

// ─── Step 6 — Review & Submit ─────────────────────────────────────────────────

function StepReview({ courseId, instructorId, data }: {
  courseId: string; instructorId: string; data: CourseData;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const objectives = Array.isArray(data.whatYouLearn) ? data.whatYouLearn.filter(Boolean) : [];
  const totalLessons = data.modules.reduce((s, m) => s + m.lessons.length, 0);

  const checks = [
    { label: "Course title", ok: !!data.title && data.title !== "Untitled course" },
    { label: "Description", ok: !!data.description },
    { label: "Thumbnail image", ok: !!data.thumbnailUrl },
    { label: "Category selected", ok: !!data.category },
    { label: "At least 1 module", ok: data.modules.length > 0 },
    { label: "At least 1 lesson", ok: totalLessons > 0 },
    { label: "Pricing configured", ok: data.isFree || !!data.price },
    { label: "Learning objectives (min 1)", ok: objectives.length > 0 },
  ];
  const allGood = checks.every((c) => c.ok);
  const doneCount = checks.filter((c) => c.ok).length;

  async function handleSubmit() {
    setSubmitting(true); setError("");
    const res = await submitForReview(courseId, instructorId);
    setSubmitting(false);
    if (!res.success) { setError(res.error); return; }
    router.push("/instructor/courses?submitted=1");
  }

  return (
    <Card>
      {/* Summary */}
      <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-4 text-sm sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Course</p>
          <p className="font-semibold">{data.title}</p>
          <p className="text-xs text-gray-500 mt-0.5">{data.category} · {data.level} · {data.language}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Curriculum</p>
          <p className="font-semibold">{data.modules.length} modules · {totalLessons} lessons</p>
          <p className="text-xs text-gray-500 mt-0.5">{data.isFree ? "Free course" : `TZS ${Number(data.price ?? 0).toLocaleString()}`}</p>
        </div>
      </div>

      {/* Checklist */}
      <h3 className="mb-3 text-sm font-semibold">
        Completion checklist
        <span className={cn("ml-2 rounded-full px-2 py-0.5 text-xs font-bold", allGood ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700")}>
          {doneCount}/{checks.length}
        </span>
      </h3>
      <ul className="mb-5 space-y-2">
        {checks.map((c) => (
          <li key={c.label} className={cn("flex items-center gap-2 text-sm", c.ok ? "text-green-700" : "text-amber-700")}>
            {c.ok
              ? <Check className="h-4 w-4 shrink-0 text-green-500" />
              : <X className="h-4 w-4 shrink-0 text-amber-400" />}
            {c.label}
          </li>
        ))}
      </ul>

      {!allGood && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Complete the highlighted items above before submitting. Your progress is saved automatically.
        </div>
      )}

      {data.status === "REJECTED" && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
          <strong>Rejection feedback:</strong> Address the issues, then re-submit for review.
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting || !allGood}>
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</> : "Submit for review →"}
      </Button>
      <p className="mt-3 text-xs text-gray-500">
        A moderator will review your course within 48 hours and notify you when it&apos;s approved or if changes are needed.
      </p>
    </Card>
  );
}

// ─── Main CourseBuilder ───────────────────────────────────────────────────────

export function CourseBuilder({
  courseId, instructorId, mode = "create", initialData, publishedKits = [],
}: {
  courseId: string; instructorId: string; mode?: "create" | "edit";
  initialData: CourseData; publishedKits?: PublishedKitOption[];
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<CourseData>(initialData);

  function patch(p: Partial<CourseData>) { setData((prev) => ({ ...prev, ...p })); }
  function handleSaved() { if (step < STEPS.length - 1) setStep(step + 1); }

  // Step completion indicators
  const stepDone = [
    !!data.title && data.title !== "Untitled course" && !!data.description && !!data.thumbnailUrl,
    data.modules.length > 0 && data.modules.some((m) => m.lessons.length > 0),
    (Array.isArray(data.whatYouLearn) ? data.whatYouLearn.filter(Boolean) : []).length > 0,
    data.isFree || !!data.price,
    true,
    false,
  ];

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Breadcrumbs
            className="mb-2"
            items={[
              { label: "My courses", href: "/instructor/courses" },
              { label: mode === "edit" ? "Edit course" : "Create course" },
            ]}
          />
          <h1 className="font-display text-2xl font-bold">
            {mode === "edit" ? "Edit course" : "Create course"}
          </h1>
          {data.title !== "Untitled course" && (
            <p className="text-sm text-gray-500 mt-0.5 truncate max-w-xs">{data.title}</p>
          )}
        </div>
        <Badge variant={STATUS_VARIANT[data.status] ?? "default"}>
          {data.status === "PENDING_REVIEW" ? "Under Review"
            : data.status.charAt(0) + data.status.slice(1).toLowerCase().replace("_", " ")}
        </Badge>
      </div>

      {/* Step tabs */}
      <div className="mb-8 flex gap-1.5 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => setStep(i)}
            className={cn(
              "relative shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition",
              step === i
                ? "bg-brand text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:border-brand/50 hover:text-brand"
            )}
          >
            {stepDone[i] && i !== step && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500">
                <Check className="h-2 w-2 text-white" />
              </span>
            )}
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 0 && <StepBasicInfo courseId={courseId} instructorId={instructorId} data={data} onChange={patch} onSaved={handleSaved} />}
          {step === 1 && <StepCurriculum courseId={courseId} instructorId={instructorId} modules={data.modules} onModulesChange={(mods) => patch({ modules: mods })} />}
          {step === 2 && <StepRequirements courseId={courseId} instructorId={instructorId} data={data} publishedKits={publishedKits} onChange={patch} onSaved={handleSaved} />}
          {step === 3 && <StepPricing courseId={courseId} instructorId={instructorId} data={data} onChange={patch} onSaved={handleSaved} />}
          {step === 4 && <StepSEO courseId={courseId} instructorId={instructorId} data={data} onChange={patch} onSaved={handleSaved} />}
          {step === 5 && <StepReview courseId={courseId} instructorId={instructorId} data={data} />}
        </div>

        {/* Sidebar */}
        <Card className="h-fit space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Quick actions</h3>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link href={`/instructor/courses/${courseId}/preview`} target="_blank">
                  <ExternalLink className="h-3.5 w-3.5 mr-2" />Preview as student ↗
                </Link>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Progress</h3>
            <div className="space-y-1.5">
              {STEPS.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStep(i)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition",
                    step === i ? "bg-brand/10 text-brand font-semibold" : "text-gray-500 hover:bg-gray-50"
                  )}
                >
                  <span className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                    stepDone[i] ? "bg-green-500 text-white" : step === i ? "bg-brand text-white" : "bg-gray-200 text-gray-500"
                  )}>
                    {stepDone[i] ? <Check className="h-3 w-3" /> : i + 1}
                  </span>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-600">Content types available</p>
            <p>📄 Article — write or upload a PDF</p>
            <p>❓ Quiz — multiple-choice test</p>
            <p>📋 Assignment — student submission</p>
          </div>
        </Card>
      </div>

      {/* Bottom nav */}
      <div className="mt-6 flex justify-between">
        <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>← Previous</Button>
        {step < STEPS.length - 1 && (
          <Button variant="ghost" onClick={() => setStep(step + 1)}>Skip →</Button>
        )}
      </div>
    </div>
  );
}
