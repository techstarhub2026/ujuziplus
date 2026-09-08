"use client";

import { useState, useTransition, useId } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MediaUploadField } from "@/components/ui/MediaUploadField";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { adminUpsertLabResource } from "@/lib/actions/lab-resources";
import { uploadMediaFile } from "@/lib/upload-client";
import { useAppStore } from "@/store/appStore";
import { Save, Plus, X, FileText, ImageIcon, ExternalLink } from "lucide-react";
import type { LabResourceType } from "@prisma/client";

const TYPES: LabResourceType[] = ["COMPONENT", "SENSOR", "BOARD", "TOOL", "GUIDE", "OTHER"];

type Props = {
  id?: string;
  initial?: {
    slug: string;
    title: string;
    description: string;
    content: string;
    type: LabResourceType;
    category: string;
    fileUrl: string;
    pdfUrls: string[];
    imageUrls: string[];
    thumbnailUrl: string;
    externalUrl: string;
    tags: string[];
  };
};

function FileList({ urls, onRemove, label }: { urls: string[]; onRemove: (u: string) => void; label: string }) {
  if (!urls.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {urls.map((u) => (
        <div key={u} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
          <FileText className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <span className="flex-1 truncate text-xs text-gray-600">{u.split("/").pop()?.split("?")[0]}</span>
          <button type="button" onClick={() => onRemove(u)} className="text-gray-400 hover:text-red-500">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

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

function BrokenImageThumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  const [broken, setBroken] = useState(false);
  return (
    <div className="relative rounded-lg overflow-hidden border border-gray-100">
      {broken ? (
        <div className="flex h-24 w-full flex-col items-center justify-center gap-1 bg-gray-50 px-2 text-center">
          <ImageIcon className="h-4 w-4 text-gray-300" />
          <span className="text-[10px] text-gray-400">Image failed to load</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="w-full h-24 object-cover" onError={() => setBroken(true)} />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 rounded-full bg-white/90 p-0.5 text-gray-600 hover:bg-white hover:text-red-600 shadow"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function ImageList({ urls, onRemove }: { urls: string[]; onRemove: (u: string) => void }) {
  if (!urls.length) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
      {urls.map((u) => (
        <BrokenImageThumb key={u} url={u} onRemove={() => onRemove(u)} />
      ))}
    </div>
  );
}

function UploadChipButton({
  accept, uploading, label, icon, onUpload,
}: {
  accept: string;
  uploading: boolean;
  label: string;
  icon: React.ReactNode;
  onUpload: (file: File) => void;
}) {
  const id = useId();
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-1.5 text-xs text-gray-500 cursor-pointer hover:border-brand hover:text-brand transition-colors w-fit"
    >
      {icon}
      {uploading ? "Uploading…" : label}
      <input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        disabled={uploading}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = ""; }}
      />
    </label>
  );
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
}

export function LabResourceEditorForm({ id, initial }: Props) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();
  const [uploadingImg, setUploadingImg] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [type, setType] = useState<LabResourceType>(initial?.type ?? "COMPONENT");
  const [category, setCategory] = useState(initial?.category ?? "");
  const [fileUrl, setFileUrl] = useState(initial?.fileUrl ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? "");
  const [externalUrl, setExternalUrl] = useState(initial?.externalUrl ?? "");
  const [pdfUrls, setPdfUrls] = useState<string[]>(initial?.pdfUrls ?? []);
  const [imageUrls, setImageUrls] = useState<string[]>(initial?.imageUrls ?? []);
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagInput, setTagInput] = useState("");

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  };

  const handleEditorImageUpload = async (file: File) => {
    const { url } = await uploadMediaFile(file, "image");
    return url;
  };

  const uploadAdditionalImage = async (file: File) => {
    setUploadingImg(true);
    try {
      const { url } = await uploadMediaFile(file, "image");
      setImageUrls((prev) => [...prev, url]);
    } catch { /* ignore */ }
    setUploadingImg(false);
  };

  const uploadPdf = async (file: File) => {
    setUploadingPdf(true);
    try {
      const { url } = await uploadMediaFile(file, "doc");
      setPdfUrls((prev) => [...prev, url]);
    } catch { /* ignore */ }
    setUploadingPdf(false);
  };

  const handleTitleChange = (v: string) => {
    setTitle(v);
    if (!id) setSlug(toSlug(v));
  };

  const handleSave = () => {
    if (!title.trim() || !slug.trim()) { showToast("Title and slug are required", "error"); return; }
    startTransition(async () => {
      const res = await adminUpsertLabResource({
        id,
        slug: slug.trim(),
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        type,
        category: category.trim(),
        fileUrl: fileUrl.trim(),
        pdfUrls,
        imageUrls,
        tags,
        thumbnailUrl: thumbnailUrl.trim() || null,
        externalUrl: externalUrl.trim(),
      });
      if (res.success) {
        showToast(id ? "Resource updated" : "Resource created", "success");
        if (!id && res.data) router.push(`/admin/lab-resources/${encodeURIComponent(res.data.slug)}/edit`);
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
        <Input label="Title *" value={title} onChange={(e) => handleTitleChange(e.target.value)} placeholder="e.g. DHT22 Temperature & Humidity Sensor" />
        <Input label="Slug *" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="dht22-temperature-sensor" hint="URL-friendly identifier. Auto-generated from title." />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium">Type *</span>
            <select className="mt-1 w-full rounded-lg border px-3 py-2" value={type} onChange={(e) => setType(e.target.value as LabResourceType)}>
              {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>)}
            </select>
          </label>
          <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Environmental, Motor, Display" />
        </div>
        <Input
          label="Short description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="One or two sentences shown on listing cards"
        />
      </Card>

      {/* Tags */}
      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Tags</h2>
        <p className="text-xs text-gray-500">
          Free-form chips shown alongside the type and category, e.g. &ldquo;actuator&rdquo;, &ldquo;Training-Kit-Box&rdquo;.
        </p>
        <div className="flex gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); addTag(); }
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

      {/* Rich content */}
      <Card className="p-5 space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Rich Content</h2>
        <p className="text-xs text-gray-500">
          Full article content. Use headings, bullet lists, images, code blocks, links, and more.
          Include specs, pinouts, wiring diagrams, sample code, etc.
        </p>
        <RichTextEditor
          value={content}
          onChange={setContent}
          placeholder="Write a detailed guide for this component… Add an H2 for each section: Specifications, Pinout, Wiring, Example Code, Tips."
          minHeight={320}
          onImageUpload={handleEditorImageUpload}
        />
      </Card>

      {/* Additional images & PDFs */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Additional Images & PDFs</h2>
        <p className="text-xs text-gray-500">Upload datasheets, wiring diagrams, and reference images. PDFs will be shown inline — no download required.</p>

        <div className="space-y-3">
          {/* Images */}
          <UploadChipButton
            accept="image/*"
            uploading={uploadingImg}
            label="Add image"
            icon={<ImageIcon className="h-3.5 w-3.5" />}
            onUpload={uploadAdditionalImage}
          />
          <ImageList urls={imageUrls} onRemove={(u) => setImageUrls(imageUrls.filter((x) => x !== u))} />
        </div>

        <div className="space-y-3">
          {/* PDFs */}
          <UploadChipButton
            accept="application/pdf"
            uploading={uploadingPdf}
            label="Add PDF / datasheet"
            icon={<FileText className="h-3.5 w-3.5" />}
            onUpload={uploadPdf}
          />
          <FileList
            urls={pdfUrls}
            onRemove={(u) => setPdfUrls(pdfUrls.filter((x) => x !== u))}
            label="Uploaded PDFs"
          />
        </div>
      </Card>

      {/* Links */}
      <Card className="p-5 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Links & Files</h2>
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-gray-400 shrink-0" />
          <Input
            label="External URL (datasheet, product page)"
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <p className="text-xs text-gray-400">Or upload a single primary file (older download-based approach):</p>
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
            <a href={`/lab-resources/${slug}`} target="_blank" rel="noopener noreferrer">Preview</a>
          </Button>
        )}
      </div>
    </div>
  );
}
