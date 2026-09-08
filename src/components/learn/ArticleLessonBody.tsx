"use client";

import { useEffect, useRef, useCallback } from "react";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { PDF_PREFIX } from "@/lib/constants";

/** Marks explored when the learner scrolls to the end of the article
 * (or immediately for PDF lessons, which render as a full-screen panel
 * with no page scrolling involved). */
export function ArticleLessonBody({
  body,
  onExplored,
}: {
  body: string;
  onExplored?: () => void;
}) {
  const isPdf = body.startsWith(PDF_PREFIX);
  const pdfUrl = isPdf ? body.slice(PDF_PREFIX.length) : "";
  const endRef = useRef<HTMLDivElement>(null);
  const fired = useRef(false);

  const fire = useCallback(() => {
    if (fired.current || !onExplored) return;
    fired.current = true;
    onExplored();
  }, [onExplored]);

  useEffect(() => {
    fired.current = false;
  }, [body]);

  useEffect(() => {
    if (isPdf) {
      fire();
      return;
    }

    const sentinel = endRef.current;
    if (!sentinel || !onExplored) return;

    const scrollRoot = sentinel.closest(".learn-scroll-root") as HTMLElement | null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) fire();
      },
      {
        root: scrollRoot,
        threshold: 0.25,
        rootMargin: "0px 0px 40px 0px",
      }
    );

    observer.observe(sentinel);

    const raf = requestAnimationFrame(() => {
      const rootRect = scrollRoot?.getBoundingClientRect();
      const endRect = sentinel.getBoundingClientRect();
      const fitsInView = scrollRoot
        ? endRect.bottom <= (rootRect?.bottom ?? window.innerHeight)
        : endRect.top < window.innerHeight;
      if (fitsInView) fire();
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [body, isPdf, fire, onExplored]);

  if (isPdf) {
    return <PdfViewer url={pdfUrl} fullBleed />;
  }

  return (
    <div className="max-w-2xl">
      <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">{body}</div>
      <div ref={endRef} className="h-px w-full" aria-hidden />
    </div>
  );
}
