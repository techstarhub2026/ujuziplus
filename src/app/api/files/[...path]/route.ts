/**
 * Serves files from private B2 storage by redirecting to a short-lived signed
 * URL generated on each request. The bucket stays private (Backblaze requires
 * a card on file to enable public buckets), so this route is the only way
 * uploaded files are ever reachable.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSignedFileUrl } from "@/lib/storage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const segments = params.path ?? [];

  if (segments.length === 0 || segments.some((s) => s === ".." || s === "")) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const key = segments.join("/");

  try {
    const signedUrl = await getSignedFileUrl(key);
    return NextResponse.redirect(signedUrl, { status: 302 });
  } catch (err) {
    console.error("File serve error:", err);
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }
}
