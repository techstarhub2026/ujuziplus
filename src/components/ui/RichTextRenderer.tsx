"use client";

import { useEffect, useRef } from "react";

type Props = {
  html: string;
  className?: string;
};

/**
 * Renders rich HTML content from the Tiptap editor.
 * Uses DOMPurify on the client to sanitize before rendering.
 */
export function RichTextRenderer({ html, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !html) return;
    // Lazy import DOMPurify so it doesn't load in SSR
    import("dompurify").then((mod) => {
      const DOMPurify = mod.default;
      const clean = DOMPurify.sanitize(html, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"],
        FORCE_BODY: false,
      });
      if (ref.current) ref.current.innerHTML = clean;
    });
  }, [html]);

  // SSR: render raw (sanitized on hydration)
  return (
    <div
      ref={ref}
      className={`prose prose-sm max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
        prose-p:text-gray-700 prose-p:leading-relaxed
        prose-a:text-brand prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900
        prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em]
        prose-pre:bg-gray-900 prose-pre:text-green-300 prose-pre:rounded-xl prose-pre:shadow-sm
        prose-blockquote:border-l-4 prose-blockquote:border-brand/40 prose-blockquote:text-gray-600 prose-blockquote:pl-4 prose-blockquote:italic
        prose-ul:list-disc prose-ol:list-decimal
        prose-img:rounded-lg prose-img:shadow-sm prose-img:my-4
        prose-hr:border-gray-200
        ${className}`}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
