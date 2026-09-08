/**
 * Universal media upload API
 * POST /api/upload
 * Body: FormData  —  field "file" (required), field "kind" (optional: "image"|"video"|"doc"|"audio")
 * Returns: { url: "https://<b2-public-url>/<kind>/filename.ext" }
 */

import sharp from "sharp";
import { NextRequest, NextResponse } from "next/server";
import { getUploadUserId } from "@/lib/upload-auth";
import { defaultExtension, resolveMimeType } from "@/lib/upload-mime";
import { uploadFile } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED: Record<string, { mimes: string[]; maxBytes: number }> = {
  image: {
    mimes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/bmp",
      "image/heic",
      "image/heif",
    ],
    maxBytes: 10 * 1024 * 1024,
  },
  video: {
    mimes: [
      "video/mp4",
      "video/webm",
      "video/ogg",
      "video/quicktime",
      "video/x-msvideo",
      "video/x-matroska",
    ],
    maxBytes: 500 * 1024 * 1024,
  },
  doc: {
    mimes: [
      // Documents
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/markdown",
      // Spreadsheets
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      // Presentations
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.apple.keynote",
      // Archives
      "application/zip",
      "application/x-zip-compressed",
      "application/x-tar",
      "application/gzip",
      "application/x-7z-compressed",
      "application/x-rar-compressed",
    ],
    maxBytes: 100 * 1024 * 1024,
  },
  audio: {
    mimes: ["audio/mpeg", "audio/mp4", "audio/wav", "audio/ogg", "audio/webm"],
    maxBytes: 100 * 1024 * 1024,
  },
};

function detectKind(mime: string): string {
  for (const [kind, cfg] of Object.entries(ALLOWED)) {
    if (cfg.mimes.includes(mime)) return kind;
  }
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime.startsWith("audio/")) return "audio";
  return "image";
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUploadUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Sign in to upload files." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const kindHint = (formData.get("kind") as string | null) ?? "";

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const kind = ALLOWED[kindHint] ? kindHint : detectKind(file.type);
    const cfg = ALLOWED[kind];

    if (!cfg) {
      return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
    }

    const resolvedMime = resolveMimeType(file, cfg.mimes);
    if (!resolvedMime || !cfg.mimes.includes(resolvedMime)) {
      return NextResponse.json(
        {
          error: `Unsupported ${kind} file. Use JPG, PNG, WebP, or GIF (max 10 MB).`,
        },
        { status: 400 }
      );
    }

    if (file.size > cfg.maxBytes) {
      const maxMb = Math.round(cfg.maxBytes / 1024 / 1024);
      return NextResponse.json(
        { error: `File too large. Maximum for ${kind} is ${maxMb} MB.` },
        { status: 400 }
      );
    }

    const originalExt = defaultExtension(kind, resolvedMime, file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${originalExt}`;
    const key = `${kind}/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    let url: string;
    if (kind === "image" && resolvedMime !== "image/svg+xml") {
      const outputBuffer = await sharp(buffer).rotate().jpeg({ quality: 85, mozjpeg: true }).toBuffer();
      url = await uploadFile(key, outputBuffer, "image/jpeg");
    } else {
      url = await uploadFile(key, buffer, resolvedMime);
    }

    return NextResponse.json({
      url,
      kind,
      name: file.name,
      size: file.size,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
