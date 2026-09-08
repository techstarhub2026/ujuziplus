import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import {
  BRAND_STYLE,
  BRAND_SCRIPT,
  recolorCss,
} from "@/lib/open-knowledge/branding";

/**
 * Serves the offline knowledge mirror under UjuziPlus branding.
 *
 * The mirror (`public/w3schools`, ~2 GB) is gitignored and kept verbatim so it
 * can be re-extracted from the source archive at any time. Rebranding therefore
 * happens here, on the way out, rather than by editing its ~33k HTML files:
 * HTML responses get our stylesheet and script appended, everything else
 * streams through untouched.
 *
 * GET /api/open-knowledge/html/default.html
 */

const MIRROR_ROOT = path.join(process.cwd(), "public", "w3schools");

const CONTENT_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".eot": "application/vnd.ms-fontobject",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/**
 * Resolves a request path to a file inside the mirror, or null if it escapes.
 * Decoding happens before the containment check so that encoded traversal
 * (`%2e%2e%2f`) cannot slip past it.
 */
function resolveMirrorFile(segments: string[]) {
  let decoded: string;
  try {
    decoded = segments.map((segment) => decodeURIComponent(segment)).join("/");
  } catch {
    return null;
  }

  if (decoded.includes("\0")) return null;

  const target = path.resolve(MIRROR_ROOT, decoded);
  const root = path.resolve(MIRROR_ROOT);
  if (target !== root && !target.startsWith(root + path.sep)) return null;

  return target;
}

export async function GET(
  _request: Request,
  { params }: { params: { path?: string[] } },
) {
  const filePath = resolveMirrorFile(params.path ?? []);
  if (!filePath) {
    return new NextResponse("Not found", { status: 404 });
  }

  let stats;
  try {
    stats = await stat(filePath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  if (stats.isDirectory()) {
    return NextResponse.redirect(
      new URL(
        `/api/open-knowledge/${(params.path ?? []).join("/")}/index.html`,
        _request.url,
      ),
    );
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  if (ext === ".html" || ext === ".htm") {
    const html = await readFile(filePath, "utf8");
    return new NextResponse(rebrand(html), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  // The upstream palette is baked into the mirror's stylesheets, so recolour
  // them here rather than trying to out-specify every rule from our own sheet.
  if (ext === ".css") {
    const css = await readFile(filePath, "utf8");
    return new NextResponse(recolorCss(css), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
      },
    });
  }

  const stream = Readable.toWeb(
    createReadStream(filePath),
  ) as unknown as ReadableStream;

  return new NextResponse(stream, {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stats.size),
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}

/** Applies our palette to the page's own styles, then appends the brand layer. */
function rebrand(html: string) {
  const recolored = recolorCss(html);
  const injection = `${BRAND_STYLE}${BRAND_SCRIPT}`;

  if (recolored.includes("</body>")) {
    return recolored.replace("</body>", `${injection}</body>`);
  }

  return recolored + injection;
}
