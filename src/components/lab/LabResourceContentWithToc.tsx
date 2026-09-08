"use client";

import { useEffect, useRef, useState } from "react";
import { List } from "lucide-react";
import { cn } from "@/lib/utils";

type TocEntry = { id: string; label: string };

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

const PROSE_CLASSES = `prose prose-sm max-w-none
  prose-headings:font-bold prose-headings:text-gray-900 prose-headings:scroll-mt-24
  prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg
  prose-p:text-gray-700 prose-p:leading-relaxed
  prose-a:text-brand prose-a:no-underline hover:prose-a:underline
  prose-strong:text-gray-900
  prose-code:bg-gray-100 prose-code:text-red-600 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em]
  prose-pre:bg-gray-900 prose-pre:text-green-300 prose-pre:rounded-xl prose-pre:shadow-sm
  prose-blockquote:border-l-4 prose-blockquote:border-brand/40 prose-blockquote:text-gray-600 prose-blockquote:pl-4 prose-blockquote:italic
  prose-ul:list-disc prose-ol:list-decimal
  prose-img:rounded-lg prose-img:shadow-sm prose-img:my-4
  prose-hr:border-gray-200`;

export function LabResourceContentWithToc({ html }: { html: string }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [toc, setToc] = useState<TocEntry[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (!contentRef.current || !html) return;
    let cancelled = false;

    import("dompurify").then((mod) => {
      if (cancelled || !contentRef.current) return;
      const DOMPurify = mod.default;
      const clean = DOMPurify.sanitize(html, {
        ADD_TAGS: ["iframe"],
        ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling", "target"],
        FORCE_BODY: false,
      });
      contentRef.current.innerHTML = clean;

      // Build TOC from headings now that content is in the DOM
      const headings = Array.from(contentRef.current.querySelectorAll("h1, h2")) as HTMLElement[];
      const seen = new Set<string>();
      const entries: TocEntry[] = headings.map((el) => {
        let id = el.id || slugify(el.textContent ?? "");
        let unique = id;
        let n = 2;
        while (seen.has(unique)) {
          unique = `${id}-${n++}`;
        }
        seen.add(unique);
        el.id = unique;
        return { id: unique, label: el.textContent ?? "" };
      });
      setToc(entries);
    });

    return () => {
      cancelled = true;
    };
  }, [html]);

  useEffect(() => {
    if (toc.length === 0) return;
    const elements = toc
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => !!el);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [toc]);

  const scrollToTop = () => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveId(null);
  };

  const scrollToHeading = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      {/* TOC */}
      {toc.length > 0 && (
        <nav className="order-2 h-fit lg:sticky lg:top-24 lg:order-1">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
            <List className="h-3.5 w-3.5" />
            On this page
          </p>
          <ul className="space-y-0.5 border-l border-gray-200">
            <li>
              <button
                type="button"
                onClick={scrollToTop}
                className={cn(
                  "block w-full border-l-2 px-3 py-1.5 text-left text-sm transition -ml-px",
                  activeId === null
                    ? "border-brand font-medium text-brand"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                )}
              >
                Overview
              </button>
            </li>
            {toc.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => scrollToHeading(entry.id)}
                  className={cn(
                    "block w-full truncate border-l-2 px-3 py-1.5 text-left text-sm transition -ml-px",
                    activeId === entry.id
                      ? "border-brand font-medium text-brand"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  )}
                >
                  {entry.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Content */}
      <div className={cn("order-1 lg:order-2", toc.length === 0 && "lg:col-span-2")}>
        <div ref={contentRef} className={PROSE_CLASSES} suppressHydrationWarning />
      </div>
    </div>
  );
}
