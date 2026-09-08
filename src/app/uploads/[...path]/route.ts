/**
 * Serves files from public/uploads/** by reading the filesystem on every
 * request, instead of relying on Next.js's default static handling for
 * public/, which only recognizes files present at server boot time.
 * Without this, files written by POST /api/upload after the server has
 * started stay 404 until the next deploy/restart.
 */

import { existsSync } from "fs";
import { stat } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

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
  ".doc": "application/msword",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".ppt": "application/vnd.ms-powerpoint",
  ".pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ".zip": "application/zip",
  ".csv": "text/csv",
  ".txt": "text/plain",
  ".md": "text/markdown",
};

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const segments = params.path ?? [];

  // Reject path traversal / absolute segments before touching the filesystem.
  if (segments.length === 0 || segments.some((s) => s === ".." || s === "" || s.includes("/") || s.includes("\\"))) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const uploadsRoot = path.join(process.cwd(), "public", "uploads");
  const filePath = path.join(uploadsRoot, ...segments);

  // Ensure the resolved path stays inside the uploads root.
  if (!filePath.startsWith(uploadsRoot)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  if (!existsSync(filePath)) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const stats = await stat(filePath);
  if (!stats.isFile()) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream;

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stats.size),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
