"use client";

import { useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MediaUploadField } from "@/components/ui/MediaUploadField";
import {
  adminUpsertOpenKnowledgeResource,
} from "@/lib/actions/open-knowledge";
import { Save, Plus, X, ExternalLink } from "lucide-react";
import type { OpenKnowledgeCategory } from "@prisma/client";
import { useAppStore } from "@/store/appStore";

const CATEGORIES: OpenKnowledgeCategory[] = [
  "CODING_TUTORIALS",
  "AI_IOT_RESOURCES",
  "STEM_TEACHING_MATERIALS",
  "OPEN_SOURCE_PROJECTS",
  "INNOVATION_TOOLKITS",
  "ENTREPRENEURSHIP_GUIDES",
  "RESEARCH_PUBLICATIONS",
  "DIGITAL_LEARNING_MANUALS",
];

const CATEGORY_LABELS: Record<OpenKnowledgeCategory, string> = {
  CODING_TUTORIALS: "Coding tutorials",
  AI_IOT_RESOURCES: "AI & IoT resources",
  STEM_TEACHING_MATERIALS: "STEM teaching materials",
  OPEN_SOURCE_PROJECTS: "Open-source projects",
  INNOVATION_TOOLKITS: "Innovation toolkits",
  ENTREPRENEURSHIP_GUIDES: "Entrepreneurship guides",
  RESEARCH_PUBLICATIONS: "Research publications",
  DIGITAL_LEARNING_MANUALS: "Digital learning manuals",
};

type Props = {
  id?: string;
  initial?: {
    slug: string;
    title: string;
    description: string;
    category: OpenKnowledgeCategory;
    authorName: string;
    fileUrl: string;
    externalUrl: string;
    thumbnailUrl: string;
    tags: string[];
    isFeatured: boolean;
  };
};

function TagChips({ tags, onRemove }: { tags: string[]; onRemove: (t: string) => void }) {
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <span
          key={t}
          className="flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-600"
        >
          {t}
          <button type="button" onClick={() => onRemove(t)} className="text-gray-400 hover:text-red-500">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
    </div>
  );
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

export function OpenKnowledgeEditorForm({ id, initial }: Props) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const idPrefix = useId();
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [category, setCategory] = useState<OpenKnowledgeCategory>(initial?.category ?? "CODING_TUTORIALS");
  const [authorName, setAuthorName] = useState(initial?.authorName ?? "");
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!id) setSlug(toSlug(v));
  };

  const handleSave = () => {
    if (!title.trim() || !slug.trim()) {
      showToast("Title and slug are required", "error");
      return;
    }
    startTransition(async () => {
      const res = await adminUpsertOpenKnowledgeResource({
        id,
        slug: slug.trim(),
        title: title.trim(),
        description: description.trim(),
        category,
        authorName: authorName.trim(),
        fileUrl: fileUrl.trim(),
        externalUrl: externalUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || null,
        tags,
        isFeatured,
      });
      if (res.success) {
        showToast(id ? "Resource updated" : "Resource created", "success");
        if (!id && res.data) router.push(`/admin/open-knowledge/${encodeURIComponent(res.data.slug)}/edit`);
        else router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Basics */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Basics</h2>
        <Input
          label="Title *"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="e.g. freeCodeCamp: Full JavaScript Course"
        />
        <Input
          label="Slug *"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="freecodecamp-javascript-course"
          hint="URL-friendly identifier. Auto-generated from title."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium">Category *</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={category}
              onChange={(e) => setCategory(e.target.value as OpenKnowledgeCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <Input
            label="Author / source"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="e.g. freeCodeCamp, MIT OpenCourseWare"
          />
        </div>
        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="One or two sentences shown on listing cards"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            id={`${idPrefix}-featured`}
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300"
          />
          <span className="font-medium">Featured</span>
        </label>
      </Card>

      {/* Tags */}
      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Tags</h2>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Type a tag and press Enter"
            className="flex-1"
          />
          <Button type="button" variant="outline" onClick={addTag}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
        <TagChips tags={tags} onRemove={(t) => setTags(tags.filter((x) => x !== t))} />
      </Card>

      {/* Thumbnail */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Thumbnail</h2>
        <MediaUploadField
          kind="image"
          label="Cover / thumbnail image"
          hint="Shown on the resource listing card."
          value={thumbnailUrl}
          onChange={setThumbnailUrl}
        />
      </Card>

      {/* Links */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Links & Files</h2>
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
          <Input
            label="External URL"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://..."
            className="flex-1"
          />
        </div>
        <p className="text-xs text-gray-400">Or upload a file (PDF, doc) hosted on this platform:</p>
        <MediaUploadField kind="doc" label="Primary file (optional)" value={fileUrl} onChange={setFileUrl} />
      </Card>

      {/* Actions */}
      <div className="flex gap-3 pb-8">
        <Button disabled={isPending} onClick={handleSave}>
          <Save className="h-4 w-4 mr-1.5" />
          {isPending ? "Saving…" : id ? "Save changes" : "Create resource"}
        </Button>
        {id && (
          <Button asChild variant="ghost">
            <a
              href={externalUrl || fileUrl || `/open-knowledge/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Preview
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
