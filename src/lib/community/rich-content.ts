/** Lightweight markdown-ish renderer for community posts (no extra deps). */

const URL_RE = /(https?:\/\/[^\s<]+[^\s<.,;:!?)\]"'])/g;
const IMG_RE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const LINK_RE = /^\[([^\]]+)\]\(([^)]+)\)$/;
const HEADING_RE = /^(#{1,3})\s+(.+)$/;

export function excerptFromBody(body: string, maxLen = 180): string {
  const plain = body
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(URL_RE, "")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, maxLen).trim()}…`;
}

export function extractFirstImage(body: string): string | null {
  for (const line of body.split("\n")) {
    const m = line.trim().match(IMG_RE);
    if (m?.[2]) return m[2];
  }
  return null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inlineFormat(text: string): string {
  let out = escapeHtml(text);
  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/`([^`]+)`/g, '<code class="rich-inline-code">$1</code>');
  out = out.replace(
    URL_RE,
    (url) =>
      `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="rich-link">${escapeHtml(url)}</a>`
  );
  return out;
}

export type RichBlock =
  | { type: "paragraph"; html: string }
  | { type: "heading"; level: number; html: string }
  | { type: "image"; alt: string; src: string }
  | { type: "link-card"; label: string; href: string };

export function parseRichContent(body: string): RichBlock[] {
  const blocks: RichBlock[] = [];
  const lines = body.split("\n");
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length === 0) return;
    const text = paragraph.join(" ").trim();
    if (text) blocks.push({ type: "paragraph", html: inlineFormat(text) });
    paragraph = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    const img = line.match(IMG_RE);
    if (img) {
      flushParagraph();
      blocks.push({ type: "image", alt: img[1], src: img[2] });
      continue;
    }

    const link = line.match(LINK_RE);
    if (link && link[2].startsWith("http")) {
      flushParagraph();
      blocks.push({ type: "link-card", label: link[1], href: link[2] });
      continue;
    }

    const heading = line.match(HEADING_RE);
    if (heading) {
      flushParagraph();
      blocks.push({
        type: "heading",
        level: heading[1].length,
        html: inlineFormat(heading[2]),
      });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}

export function insertAtCursor(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  insert: string
): { next: string; cursor: number } {
  const next = value.slice(0, selectionStart) + insert + value.slice(selectionEnd);
  return { next, cursor: selectionStart + insert.length };
}

export function wrapSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  before: string,
  after: string
): { next: string; cursorStart: number; cursorEnd: number } {
  const selected = value.slice(selectionStart, selectionEnd);
  const next =
    value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
  return {
    next,
    cursorStart: selectionStart + before.length,
    cursorEnd: selectionStart + before.length + selected.length,
  };
}
