"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Typewriter + neon-orange flicker reveal for home screen section titles.
 * Replays every time the heading scrolls into view; respects reduced-motion.
 */
export function SciFiHeading({
  text,
  as: Tag = "span",
  className,
}: {
  text: string;
  as?: "span" | "h2" | "h3";
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [typed, setTyped] = useState("");
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (!entry.isIntersecting) setTyped("");
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    let i = 0;
    const stepMs = Math.max(55, Math.min(110, 1800 / text.length));
    const interval = setInterval(() => {
      i += 1;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, stepMs);
    return () => clearInterval(interval);
  }, [inView, reduceMotion, text]);

  if (reduceMotion) {
    return (
      <Tag ref={ref as any} className={cn("scifi-heading", className)}>
        {text}
      </Tag>
    );
  }

  const done = typed.length >= text.length;

  return (
    <Tag
      ref={ref as any}
      className={cn("scifi-heading", done && "scifi-heading--done", className)}
      data-text={text}
    >
      <span aria-hidden="true">{typed}</span>
      <span className="scifi-heading__cursor" aria-hidden="true" />
      <span className="sr-only">{text}</span>
    </Tag>
  );
}
