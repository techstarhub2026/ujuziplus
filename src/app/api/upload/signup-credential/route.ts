/**
 * Certification PDF upload for the instructor signup step-2 page.
 * Authenticated by a short-lived signup credential token (the user isn't
 * signed in yet — their account is still PENDING approval) instead of a
 * normal session cookie.
 *
 * POST /api/upload/signup-credential
 * Body: FormData — "file" (required, PDF only), "token" (required)
 * Returns: { url: "https://<b2-public-url>/doc/filename.pdf" }
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { defaultExtension, resolveMimeType } from "@/lib/upload-mime";
import { uploadFile } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED_MIMES = ["application/pdf"];
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const token = (formData.get("token") as string | null) ?? "";
    const file = formData.get("file") as File | null;

    if (!token) {
      return NextResponse.json({ error: "Missing upload session." }, { status: 401 });
    }

    const record = await db.signupCredentialToken.findUnique({ where: { token } });
    if (!record || record.usedAt || record.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This session has expired. Please sign up again." },
        { status: 401 }
      );
    }

    if (!file || file.size === 0) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const resolvedMime = resolveMimeType(file, ALLOWED_MIMES);
    if (!resolvedMime || !ALLOWED_MIMES.includes(resolvedMime)) {
      return NextResponse.json({ error: "Only PDF files are supported." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `File too large. Maximum is ${Math.round(MAX_BYTES / 1024 / 1024)} MB.` },
        { status: 400 }
      );
    }

    const ext = defaultExtension("doc", resolvedMime, file.name);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const key = `doc/${filename}`;

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadFile(key, buffer, resolvedMime);

    return NextResponse.json({
      url,
      name: file.name,
      size: file.size,
    });
  } catch (err) {
    console.error("Signup credential upload error:", err);
    return NextResponse.json({ error: "Upload failed. Please try again." }, { status: 500 });
  }
}
