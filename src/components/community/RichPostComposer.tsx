"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Link2,
  ImageIcon,
  Heading2,
  Eye,
  PenLine,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MediaUploadField } from "@/components/ui/MediaUploadField";
import { createDiscussion } from "@/lib/actions/discussions";
import {
  excerptFromBody,
  insertAtCursor,
  wrapSelection,
} from "@/lib/community/rich-content";
import { RichContentRenderer } from "@/components/community/RichContentRenderer";
import { InsertLinkDialog } from "@/components/community/InsertLinkDialog";
import { CHANNELS } from "@/lib/discussions/channels";
import { IMAGE_ACCEPT, uploadMediaFile } from "@/lib/upload-client";

type Tab = "write" | "preview";

export function RichPostComposer({
  userId,
  defaultChannel = "general",
  courseId,
  variant = "full",
  onSuccess,
}: {
  userId: string;
  defaultChannel?: string;
  courseId?: string;
  variant?: "full" | "compact";
  onSuccess?: (id: string) => void;
}) {
  const router = useRouter();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const [channel, setChannel] = useState(defaultChannel);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [tab, setTab] = useState<Tab>("write");
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkDefaultLabel, setLinkDefaultLabel] = useState("");
  const [error, setError] = useState("");

  function applyTransform(fn: () => { next: string; cursor?: number; cursorStart?: number; cursorEnd?: number }) {
    const el = bodyRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const result = fn();
    setBody(result.next);
    requestAnimationFrame(() => {
      el.focus();
      const cStart = result.cursorStart ?? result.cursor ?? start;
      const cEnd = result.cursorEnd ?? result.cursor ?? start;
      el.setSelectionRange(cStart, cEnd);
    });
  }

  function handleBold() {
    const el = bodyRef.current;
    if (!el) return;
    applyTransform(() =>
      wrapSelection(body, el.selectionStart, el.selectionEnd, "**", "**")
    );
  }

  function handleHeading() {
    const el = bodyRef.current;
    if (!el) return;
    const lineStart = body.lastIndexOf("\n", el.selectionStart - 1) + 1;
    const before = body.slice(0, lineStart);
    const after = body.slice(lineStart);
    const next = before + "## " + after;
    setBody(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(lineStart + 3, lineStart + 3);
    });
  }

  function openLinkDialog() {
    const el = bodyRef.current;
    if (el) {
      selectionRef.current = { start: el.selectionStart, end: el.selectionEnd };
      const selected = body.slice(el.selectionStart, el.selectionEnd).trim();
      setLinkDefaultLabel(selected);
    } else {
      selectionRef.current = { start: body.length, end: body.length };
      setLinkDefaultLabel("");
    }
    setLinkDialogOpen(true);
  }

  function insertLink(label: string, url: string) {
    const { start, end } = selectionRef.current;
    const insert = `[${label}](${url})`;
    const next = body.slice(0, start) + insert + body.slice(end);
    setBody(next);
    requestAnimationFrame(() => {
      const el = bodyRef.current;
      if (!el) return;
      el.focus();
      const cursor = start + insert.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  function insertImageMarkdown(url: string) {
    const el = bodyRef.current;
    if (!el) return;
    const insert = `\n![](${url})\n`;
    applyTransform(() => insertAtCursor(body, el.selectionStart, el.selectionEnd, insert));
    if (!coverImageUrl) setCoverImageUrl(url);
  }

  async function handleImageFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");
    setImageUploading(true);
    setImageProgress(0);

    try {
      const { url } = await uploadMediaFile(file, "image", setImageProgress);
      insertImageMarkdown(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setImageUploading(false);
      setImageProgress(0);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await createDiscussion(userId, {
      title,
      body,
      channel,
      courseId,
      coverImageUrl: coverImageUrl || undefined,
      excerpt: excerptFromBody(body),
    });
    setSaving(false);
    if (!res.success) {
      setError(res.error);
      return;
    }
    if (onSuccess) {
      onSuccess(res.data.id);
      return;
    }
    router.push(`/dashboard/community/${channel}/${res.data.id}`);
    router.refresh();
  }

  const isFull = variant === "full";

  return (
    <>
    <form onSubmit={handleSubmit} className="rich-composer">
      <input
        ref={imageInputRef}
        type="file"
        accept={IMAGE_ACCEPT}
        className="hidden"
        onChange={handleImageFilePick}
      />

      {isFull && (
        <div className="rich-composer__channel-row">
          <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Channel
          </label>
          <select
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            className="rich-composer__channel-select"
          >
            {CHANNELS.map((ch) => (
              <option key={ch.slug} value={ch.slug}>
                {ch.label} — {ch.tagline}
              </option>
            ))}
          </select>
        </div>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={isFull ? "Story title or discussion headline" : "Title / question"}
        maxLength={200}
        className="rich-composer__title"
        required
      />

      {isFull && (
        <MediaUploadField
          kind="image"
          label="Cover image (optional)"
          value={coverImageUrl}
          onChange={setCoverImageUrl}
          localOnly
          hint="Upload from your device — JPG, PNG, or WebP up to 10 MB."
        />
      )}

      <div className="rich-composer__toolbar">
        <div className="rich-composer__tools">
          <button type="button" onClick={handleBold} className="rich-composer__tool" title="Bold">
            <Bold className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleHeading} className="rich-composer__tool" title="Heading">
            <Heading2 className="h-4 w-4" />
          </button>
          <button type="button" onClick={openLinkDialog} className="rich-composer__tool" title="Insert link">
            <Link2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={imageUploading}
            className="rich-composer__tool disabled:opacity-50"
            title="Upload image from device"
          >
            {imageUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="rich-composer__tabs">
          <button
            type="button"
            onClick={() => setTab("write")}
            className={`rich-composer__tab ${tab === "write" ? "rich-composer__tab--active" : ""}`}
          >
            <PenLine className="h-3.5 w-3.5" />
            Write
          </button>
          <button
            type="button"
            onClick={() => setTab("preview")}
            className={`rich-composer__tab ${tab === "preview" ? "rich-composer__tab--active" : ""}`}
          >
            <Eye className="h-3.5 w-3.5" />
            Preview
          </button>
        </div>
      </div>

      {imageUploading && (
        <div className="rich-composer__upload-progress">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Uploading image from your device…</span>
            <span className="font-semibold text-brand">{imageProgress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-brand transition-all duration-200"
              style={{ width: `${imageProgress}%` }}
            />
          </div>
        </div>
      )}

      {tab === "write" ? (
        <textarea
          ref={bodyRef}
          rows={isFull ? 14 : 5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            isFull
              ? "Share your story…\n\nUse **bold**, ## headings, and the image button to upload photos from your device.\nPaste article or GitHub links — they render as cards."
              : "Describe your question or topic… Use the image button to attach photos from your device."
          }
          className="rich-composer__body"
          required
        />
      ) : (
        <div className="rich-composer__preview">
          {body.trim() ? (
            <RichContentRenderer body={body} />
          ) : (
            <p className="text-sm text-gray-400">Nothing to preview yet.</p>
          )}
        </div>
      )}

      {isFull && (
        <p className="rich-composer__hint">
          <Sparkles className="inline h-3.5 w-3.5 text-brand" /> Upload photos from your phone or
          computer — no external image links required.
        </p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving || imageUploading}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish"}
        </Button>
        {isFull && (
          <span className="self-center text-xs text-gray-400">
            {body.length > 0 ? `${excerptFromBody(body, 9999).length} chars preview excerpt` : ""}
          </span>
        )}
      </div>
    </form>

    <InsertLinkDialog
      open={linkDialogOpen}
      onClose={() => setLinkDialogOpen(false)}
      onInsert={insertLink}
      defaultLabel={linkDefaultLabel}
    />
    </>
  );
}
