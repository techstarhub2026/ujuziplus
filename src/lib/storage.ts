import { createReadStream } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Uploaded media, stored on a disk volume mounted into the container.
 *
 * This used to call Backblaze B2 over S3, which meant uploads failed outright
 * in any deployment that had no B2 credentials configured — as production did,
 * so every image upload across courses, projects, the forum and avatars threw
 * "B2 storage is not configured". A mounted volume needs no account, no keys
 * and no network round trip, and matches how the store service already keeps
 * its own uploads.
 *
 * MEDIA_ROOT points at the volume mount (/data/uploads in production). Files
 * are served back through /api/files/[...path].
 */

const MEDIA_ROOT = process.env.MEDIA_ROOT
  ? path.resolve(process.env.MEDIA_ROOT)
  : path.join(process.cwd(), "public", "uploads");

/**
 * Resolves a storage key to an absolute path, refusing anything that escapes
 * the media root — a key is attacker-controlled in the sense that it derives
 * from a filename, so "../" must never walk out of the volume.
 */
function resolveKey(key: string): string | null {
  const full = path.resolve(MEDIA_ROOT, key);
  const root = MEDIA_ROOT.endsWith(path.sep) ? MEDIA_ROOT : MEDIA_ROOT + path.sep;
  if (full !== MEDIA_ROOT && !full.startsWith(root)) return null;
  return full;
}

export async function uploadFile(key: string, body: Buffer, _contentType: string): Promise<string> {
  const full = resolveKey(key);
  if (!full) throw new Error("Invalid storage key.");

  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, body);

  return `/api/files/${key}`;
}

/**
 * Where a stored file lives on disk, or null if the key escapes the media root
 * or nothing is stored there. Callers stream this rather than redirecting to a
 * signed URL, since the volume is local rather than a remote bucket.
 */
export async function getLocalFilePath(key: string): Promise<string | null> {
  const full = resolveKey(key);
  if (!full) return null;

  try {
    const info = await stat(full);
    if (!info.isFile()) return null;
    return full;
  } catch {
    return null;
  }
}

export function createFileStream(fullPath: string) {
  return createReadStream(fullPath);
}
