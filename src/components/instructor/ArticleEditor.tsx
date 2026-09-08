"use client";

/**
 * ArticleEditor — markdown-aware textarea with formatting toolbar.
 * Stores plain markdown. No extra dependencies required.
 */

import { useRef, useState } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Code,
  Minus,
  Link,
  Eye,
  EyeOff,
  Quote,
} from "lucide-react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minHeight?: number;
}

function estimateReadingTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  if (words === 0) return "";
  const minutes = Math.ceil(words / 200);
  return `~${minutes} min read · ${words} words`;
}

// Render markdown as basic HTML for the preview pane
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^######\s(.+)$/gm, "<h6>$1</h6>")
    .replace(/^#####\s(.+)$/gm, "<h5>$1</h5>")
    .replace(/^####\s(.+)$/gm, "<h4>$1</h4>")
    .replace(/^###\s(.+)$/gm, "<h3 class='text-base font-semibold mt-4 mb-1'>$1</h3>")
    .replace(/^##\s(.+)$/gm, "<h2 class='text-lg font-bold mt-5 mb-2'>$1</h2>")
    .replace(/^#\s(.+)$/gm, "<h1 class='text-xl font-bold mt-6 mb-2'>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code class='bg-gray-100 rounded px-1 text-sm font-mono'>$1</code>")
    .replace(/^>\s(.+)$/gm, "<blockquote class='border-l-4 border-gray-300 pl-3 text-gray-600 italic'>$1</blockquote>")
    .replace(/^---$/gm, "<hr class='my-4 border-gray-200' />")
    .replace(/^\*\s(.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")
    .replace(/^\d+\.\s(.+)$/gm, "<li class='ml-4 list-decimal'>$1</li>")
    .replace(/\[(.+?)\]\((.+?)\)/g, "<a href='$2' class='text-brand underline' target='_blank'>$1</a>")
    .replace(/\n{2,}/g, "</p><p class='mb-3'>")
    .replace(/\n/g, "<br />");
}

type ToolbarAction = {
  icon: React.ReactNode;
  title: string;
  prefix: string;
  suffix?: string;
  block?: boolean;
};

const TOOLBAR: ToolbarAction[] = [
  { icon: <Bold className="h-3.5 w-3.5" />, title: "Bold", prefix: "**", suffix: "**" },
  { icon: <Italic className="h-3.5 w-3.5" />, title: "Italic", prefix: "*", suffix: "*" },
  { icon: <Heading2 className="h-3.5 w-3.5" />, title: "Heading 2", prefix: "## ", block: true },
  { icon: <Heading3 className="h-3.5 w-3.5" />, title: "Heading 3", prefix: "### ", block: true },
  { icon: <Quote className="h-3.5 w-3.5" />, title: "Quote", prefix: "> ", block: true },
  { icon: <List className="h-3.5 w-3.5" />, title: "Bullet list", prefix: "* ", block: true },
  { icon: <ListOrdered className="h-3.5 w-3.5" />, title: "Numbered list", prefix: "1. ", block: true },
  { icon: <Code className="h-3.5 w-3.5" />, title: "Inline code", prefix: "`", suffix: "`" },
  { icon: <Minus className="h-3.5 w-3.5" />, title: "Divider", prefix: "\n---\n", block: true },
  { icon: <Link className="h-3.5 w-3.5" />, title: "Link", prefix: "[", suffix: "](url)" },
];

export function ArticleEditor({ value, onChange, placeholder, minHeight = 280 }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const [preview, setPreview] = useState(false);

  function applyFormat(action: ToolbarAction) {
    const ta = taRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const selected = value.slice(start, end);
    const prefix = action.prefix;
    const suffix = action.suffix ?? "";

    let newText: string;
    let newCursor: number;

    if (action.block) {
      // Insert at the beginning of the line
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      newText = value.slice(0, lineStart) + prefix + value.slice(lineStart);
      newCursor = start + prefix.length;
    } else if (selected) {
      newText = value.slice(0, start) + prefix + selected + suffix + value.slice(end);
      newCursor = start + prefix.length + selected.length + suffix.length;
    } else {
      newText = value.slice(0, start) + prefix + "text" + suffix + value.slice(end);
      newCursor = start + prefix.length;
    }

    onChange(newText);

    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(newCursor, newCursor);
    });
  }

  const readingTime = estimateReadingTime(value);

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 border-b border-gray-100 bg-gray-50 px-2 py-1.5">
        {TOOLBAR.map((action, i) => (
          <button
            key={i}
            type="button"
            title={action.title}
            onMouseDown={(e) => {
              e.preventDefault(); // prevent focus loss
              applyFormat(action);
            }}
            className="rounded p-1.5 text-gray-500 hover:bg-white hover:text-gray-900 transition"
          >
            {action.icon}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className="flex items-center gap-1 rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-white hover:text-gray-800 transition"
          >
            {preview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {preview ? "Edit" : "Preview"}
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      {preview ? (
        <div
          className="prose prose-sm max-w-none px-4 py-3 text-sm text-gray-800 leading-relaxed"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{
            __html: value
              ? `<p class="mb-3">${renderMarkdown(value)}</p>`
              : `<p class="text-gray-400 italic">${placeholder ?? "Nothing to preview yet."}</p>`,
          }}
        />
      ) : (
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "Write lesson content using markdown…\n\n## Heading\n\nParagraph text, **bold**, *italic*, `code`\n\n* Bullet list item"}
          className="w-full resize-none px-4 py-3 text-sm font-mono text-gray-800 focus:outline-none bg-white"
          style={{ minHeight }}
          spellCheck
        />
      )}

      {/* Footer */}
      {readingTime && (
        <div className="border-t border-gray-100 bg-gray-50 px-3 py-1 text-right text-xs text-gray-400">
          {readingTime}
        </div>
      )}
    </div>
  );
}
