"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Upload, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/appStore";

export function ImageUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [uploading, setUploading] = useState(false);
  const toast = useAppStore((s) => s.showToast);
  const labelId = useId();

  const uploadFile = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "image");
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        toast(data.error ?? "Upload failed", "error");
        return;
      }
      onChange(data.url);
      toast("Image uploaded", "success");
    } catch {
      toast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2" role="group" aria-labelledby={labelId}>
      <div className="flex items-center justify-between gap-2">
        <span id={labelId} className="text-sm font-medium">{label}</span>
        <div className="flex rounded-lg border p-0.5 text-xs">
          <button
            type="button"
            className={`rounded px-2 py-1 ${mode === "upload" ? "bg-brand text-white" : "text-gray-600"}`}
            onClick={() => setMode("upload")}
          >
            Upload
          </button>
          <button
            type="button"
            className={`rounded px-2 py-1 ${mode === "url" ? "bg-brand text-white" : "text-gray-600"}`}
            onClick={() => setMode("url")}
          >
            URL
          </button>
        </div>
      </div>

      {mode === "upload" ? (
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-brand"
          onClick={() => !uploading && inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && !uploading && inputRef.current?.click()}
          role="button"
          tabIndex={0}
        >
          {uploading ? (
            <Loader2 className="mb-2 h-8 w-8 text-brand animate-spin" />
          ) : (
            <Upload className="mb-2 h-8 w-8 text-gray-400" />
          )}
          <p className="text-sm text-gray-600">
            {uploading ? "Uploading…" : "Click to upload image"}
          </p>
          <p className="mt-1 text-xs text-gray-400">PNG, JPG, WebP up to 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            aria-label={label}
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) uploadFile(file);
            }}
          />
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            aria-label={`${label} URL`}
            placeholder="https://example.com/photo.jpg"
            value={value}
            onChange={(e) => onChange(e.target.value)}
          />
          <Button type="button" variant="outline" size="sm" className="mt-6 shrink-0" onClick={() => onChange(value)}>
            <Link2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      {value && (
        <div className="relative mt-2 h-32 w-full overflow-hidden rounded-lg border">
          <Image src={value} alt="Preview" fill className="object-cover" sizes="400px" />
        </div>
      )}

      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
