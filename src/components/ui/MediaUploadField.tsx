"use client";

/**
 * MediaUploadField
 *
 * A single reusable component that handles all media types:
 *   kind="image"  — thumbnails, avatars, banners
 *   kind="video"  — lesson videos (supports upload OR URL paste)
 *   kind="doc"    — PDFs, Word docs, text files
 *   kind="audio"  — audio lessons
 *
 * Features:
 *  - Upload from device with a real progress bar (XHR, not fetch)
 *  - Paste a URL instead (YouTube, Vimeo, direct MP4, Google Drive, etc.)
 *  - Preview: image thumbnail / video player / file name chip
 *  - Drag & drop
 *  - Clear / replace
 */

import { useState, useRef, useId, useEffect } from "react";
import { Upload, Link2, X, FileText, Music, CheckCircle, ImageOff } from "lucide-react";
import { IMAGE_ACCEPT, uploadMediaFile, type UploadKind } from "@/lib/upload-client";

// ─── Types ────────────────────────────────────────────────────────────────────

type MediaKind = "image" | "video" | "doc" | "audio";

interface MediaUploadFieldProps {
  kind: MediaKind;
  label?: string;
  value: string;             // current URL (local or remote)
  onChange: (url: string) => void;
  hint?: string;
  required?: boolean;
  /** When true, only device upload — no paste-URL mode */
  localOnly?: boolean;
}

// ─── Config per kind ──────────────────────────────────────────────────────────

const KIND_CONFIG: Record<
  MediaKind,
  { accept: string; maxMb: number; urlPlaceholder: string; icon: React.ReactNode }
> = {
  image: {
    accept: IMAGE_ACCEPT,
    maxMb: 10,
    urlPlaceholder: "https://example.com/image.jpg",
    icon: <Upload className="h-8 w-8 text-gray-400" />,
  },
  video: {
    accept: "video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo,video/x-matroska",
    maxMb: 500,
    urlPlaceholder: "https://youtube.com/watch?v=…  or  https://example.com/video.mp4",
    icon: <Upload className="h-8 w-8 text-gray-400" />,
  },
  doc: {
    accept:
      "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown",
    maxMb: 50,
    urlPlaceholder: "https://example.com/document.pdf",
    icon: <FileText className="h-8 w-8 text-gray-400" />,
  },
  audio: {
    accept: "audio/mpeg,audio/mp4,audio/wav,audio/ogg,audio/webm",
    maxMb: 100,
    urlPlaceholder: "https://example.com/audio.mp3",
    icon: <Music className="h-8 w-8 text-gray-400" />,
  },
};

// ─── Helper — is a URL a known embed? ─────────────────────────────────────────

function isYouTube(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}
function isVimeo(url: string) {
  return /vimeo\.com/.test(url);
}
function youtubeId(url: string) {
  const m = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
  return m?.[1] ?? null;
}

// ─── Preview components ───────────────────────────────────────────────────────

function VideoPreview({ url }: { url: string }) {
  if (isYouTube(url)) {
    const id = youtubeId(url);
    if (!id) return <p className="text-xs text-gray-500 break-all">{url}</p>;
    return (
      <div className="aspect-video w-full rounded overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (isVimeo(url)) {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
    if (id) {
      return (
        <div className="aspect-video w-full rounded overflow-hidden">
          <iframe
            src={`https://player.vimeo.com/video/${id}`}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      );
    }
  }
  // Direct file URL
  return (
    <video
      src={url}
      controls
      className="w-full max-h-48 rounded bg-black"
    />
  );
}

function formatAcceptTypes(accept: string): string {
  return accept
    .split(",")
    .map((raw) => {
      const token = raw.trim();
      if (!token) return "";
      if (token.includes("/")) {
        const subtype = token.split("/")[1];
        return subtype ? subtype.replace("+xml", "").toUpperCase() : "";
      }
      if (token.startsWith(".")) return token.slice(1).toUpperCase();
      return token.toUpperCase();
    })
    .filter(Boolean)
    .join(" · ");
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MediaUploadField({
  kind,
  label,
  value,
  onChange,
  hint,
  required,
  localOnly = false,
}: MediaUploadFieldProps) {
  const cfg = KIND_CONFIG[kind] ?? KIND_CONFIG.image;
  const inputRef = useRef<HTMLInputElement>(null);
  const labelId = useId();

  // "upload" = upload from device, "url" = paste a link
  const [mode, setMode] = useState<"upload" | "url">(
    localOnly
      ? "upload"
      : value && (value.startsWith("http://") || value.startsWith("https://"))
        ? "url"
        : "upload"
  );
  const [urlInput, setUrlInput] = useState(
    value && (value.startsWith("http://") || value.startsWith("https://")) ? value : ""
  );
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState(""); // for doc/audio display
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    setImageBroken(false);
  }, [value]);

  function clear() {
    onChange("");
    setUrlInput("");
    setFileName("");
    setError("");
    setProgress(0);
  }

  // ── Upload via shared client (credentials + clear errors) ───────────────
  async function uploadFile(file: File) {
    setError("");
    setUploading(true);
    setProgress(0);

    try {
      const data = await uploadMediaFile(file, kind as UploadKind, setProgress);
      onChange(data.url);
      setFileName(file.name);
      setMode("upload");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = ""; // reset input
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleUrlCommit() {
    const url = urlInput.trim();
    if (!url) return;
    onChange(url);
    setError("");
  }

  // ── Render ───────────────────────────────────────────────────────────────

  const hasValue = !!value;

  return (
    <div className="space-y-2" role="group" aria-labelledby={label ? labelId : undefined}>
      {/* Label */}
      {label && (
        <span id={labelId} className="block text-sm font-medium">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </span>
      )}

      {/* Mode toggle (video and image only — docs/audio stay upload) */}
      {!localOnly && (kind === "video" || kind === "image") && (
        <div className="flex gap-1 rounded-lg border border-gray-200 p-0.5 w-fit">
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition ${
              mode === "upload"
                ? "bg-brand text-white shadow-sm"
                : "text-gray-600 hover:text-brand"
            }`}
            onClick={() => setMode("upload")}
          >
            <Upload className="h-3 w-3" />
            Upload from device
          </button>
          <button
            type="button"
            className={`flex items-center gap-1.5 rounded px-3 py-1 text-xs font-medium transition ${
              mode === "url"
                ? "bg-brand text-white shadow-sm"
                : "text-gray-600 hover:text-brand"
            }`}
            onClick={() => setMode("url")}
          >
            <Link2 className="h-3 w-3" />
            Paste URL / embed
          </button>
        </div>
      )}

      {/* ── Upload mode ── */}
      {mode === "upload" && (
        <>
          {!hasValue && !uploading && (
            <div
              className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center cursor-pointer hover:bg-gray-100 hover:border-brand transition"
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {cfg.icon}
              <p className="mt-2 text-sm text-gray-600">
                Click or drag & drop to upload
              </p>
              <p className="mt-0.5 text-xs text-gray-400">
                {formatAcceptTypes(cfg.accept)} · max {cfg.maxMb} MB
              </p>
            </div>
          )}

          {/* Progress bar */}
          {uploading && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-gray-600">Uploading…</span>
                <span className="text-sm font-medium text-brand">{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-brand transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Preview after upload */}
          {hasValue && !uploading && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              {kind === "image" && (
                imageBroken ? (
                  <div className="flex h-32 w-full flex-col items-center justify-center gap-1 bg-gray-50 text-center">
                    <ImageOff className="h-5 w-5 text-gray-300" />
                    <span className="text-xs text-gray-400">Image failed to load</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full max-h-48 object-cover"
                    onError={() => setImageBroken(true)}
                  />
                )
              )}
              {kind === "video" && <VideoPreview url={value} />}
              {(kind === "doc" || kind === "audio") && (
                <div className="flex items-center gap-3 bg-gray-50 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {fileName || value.split("/").pop()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {kind === "audio" ? "Audio uploaded" : "Document uploaded"}
                    </p>
                  </div>
                </div>
              )}
              {/* Replace / clear buttons */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  type="button"
                  title="Replace file"
                  onClick={() => inputRef.current?.click()}
                  className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-gray-700 shadow hover:bg-white"
                >
                  Replace
                </button>
                <button
                  type="button"
                  title="Remove"
                  onClick={clear}
                  className="rounded bg-white/90 p-1 text-gray-500 shadow hover:bg-white hover:text-red-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept={cfg.accept}
            aria-label={label || "Upload file"}
            className="hidden"
            onChange={handleFilePick}
          />
        </>
      )}

      {/* ── URL / embed mode ── */}
      {mode === "url" && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="url"
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
              placeholder={cfg.urlPlaceholder}
              aria-label={label ? `${label} URL` : "Media URL"}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleUrlCommit()}
            />
            <button
              type="button"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90"
              onClick={handleUrlCommit}
            >
              Use
            </button>
          </div>

          {/* Preview for URL */}
          {hasValue && (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              {kind === "image" && (
                imageBroken ? (
                  <div className="flex h-32 w-full flex-col items-center justify-center gap-1 bg-gray-50 text-center">
                    <ImageOff className="h-5 w-5 text-gray-300" />
                    <span className="text-xs text-gray-400">Image failed to load</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={value}
                    alt="Preview"
                    className="w-full max-h-48 object-cover"
                    onError={() => setImageBroken(true)}
                  />
                )
              )}
              {kind === "video" && <VideoPreview url={value} />}
              <button
                type="button"
                onClick={clear}
                className="absolute top-2 right-2 rounded bg-white/90 p-1 text-gray-500 shadow hover:bg-white hover:text-red-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Hint */}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
