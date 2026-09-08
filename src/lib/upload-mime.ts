/** Resolve MIME type when the browser sends an empty or non-standard type (common on Windows). */

const EXT_TO_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  bmp: "image/bmp",
  heic: "image/heic",
  heif: "image/heif",
};

const MIME_ALIASES: Record<string, string> = {
  "image/jpg": "image/jpeg",
  "image/pjpeg": "image/jpeg",
  "image/x-png": "image/png",
};

export function extensionFromFilename(name: string): string {
  const parts = name.split(".");
  if (parts.length < 2) return "";
  return (parts.pop() ?? "").toLowerCase();
}

export function resolveMimeType(file: File, allowedMimes: string[]): string | null {
  const normalized = file.type ? MIME_ALIASES[file.type] ?? file.type : "";
  if (normalized && allowedMimes.includes(normalized)) return normalized;

  const ext = extensionFromFilename(file.name);
  const fromExt = ext ? EXT_TO_MIME[ext] : undefined;
  if (fromExt && allowedMimes.includes(fromExt)) return fromExt;

  // HEIC often blocked in allow list but still sniffed for clearer errors
  if (fromExt === "image/heic" || fromExt === "image/heif") return fromExt;

  return normalized || fromExt || null;
}

export function defaultExtension(kind: string, mime: string, filename: string): string {
  const fromName = extensionFromFilename(filename);
  if (fromName) return fromName;

  if (mime.includes("jpeg")) return "jpg";
  if (mime.includes("png")) return "png";
  if (mime.includes("webp")) return "webp";
  if (mime.includes("gif")) return "gif";
  if (mime.includes("svg")) return "svg";
  if (kind === "video") return "mp4";
  return "bin";
}
