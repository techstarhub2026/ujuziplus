/**
 * Serves uploaded files from the mounted media volume.
 *
 * This used to redirect to a short-lived signed URL from a private B2 bucket.
 * Storage is a local volume now, so the file is streamed straight back and the
 * round trip through a presigner disappears with it.
 */

import { NextRequest, NextResponse } from "next/server";
import { Readable } from "node:stream";
import path from "node:path";
import { createFileStream, getLocalFilePath } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".bmp": "image/bmp",
  ".heic": "image/heic",
  ".heif": "image/heif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".ogg": "video/ogg",
  ".mov": "video/quicktime",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
  ".zip": "application/zip",
  ".txt": "text/plain; charset=utf-8",
  ".csv": "text/csv; charset=utf-8",
};

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const segments = params.path ?? [];

  if (segments.length === 0 || segments.some((s) => s === ".." || s === "")) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const key = segments.join("/");
  const full = await getLocalFilePath(key);
  if (!full) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const type = CONTENT_TYPES[path.extname(full).toLowerCase()] ?? "application/octet-stream";
  const stream = Readable.toWeb(createFileStream(full)) as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      "content-type": type,
      // Uploaded files are immutable once written — the key changes when the
      // file does — so they can be cached hard.
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
