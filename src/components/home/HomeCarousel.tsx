"use client";

import {
  useRef,
  useState,
  useEffect,
  useCallback,
  Children,
  isValidElement,
  type ReactNode,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type HomeCarouselProps = {
  children: ReactNode;
  itemWidth?: number;
  gap?: number;
  className?: string;
  /**
   * Accepted for source compatibility with older call sites. Auto-advancing
   * rails were removed deliberately — continuous motion under the reader's
   * eye is a vestibular trigger and none of the reference platforms
   * (Udemy, edX, Coursera) do it. The prop is ignored.
   * @deprecated
   */
  autoScroll?: boolean;
  /** @deprecated no longer used — see `autoScroll`. */
  speed?: number;
  /** Accessible name for the scrollable region. */
  ariaLabel?: string;
};

/**
 * A paged, snap-scrolling rail.
 *
 * Motion only ever happens in response to the reader: an arrow press, a
 * swipe, or keyboard paging. Each press advances by whole pages so cards
 * always come to rest on a card boundary rather than mid-card, and the
 * arrows disable themselves at each end instead of wrapping — so the row
 * has an honest beginning and end the reader can feel.
 */
export function HomeCarousel({
  children,
  itemWidth = 300,
  gap = 20,
  className,
  ariaLabel,
}: HomeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(true);
  const [overflows, setOverflows] = useState(false);

  const items = Children.toArray(children).filter(isValidElement);

  const sync = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setOverflows(max > 8);
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft >= max - 8);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    sync();
    el.addEventListener("scroll", sync, { passive: true });

    const observer = new ResizeObserver(sync);
    observer.observe(el);
    // Cards can settle after images load and change the scroll width.
    Array.from(el.children).forEach((child) => observer.observe(child));

    return () => {
      el.removeEventListener("scroll", sync);
      observer.disconnect();
    };
  }, [sync, items.length]);

  /** Advance by the largest whole number of cards that fits the viewport. */
  const page = useCallback(
    (dir: -1 | 1) => {
      const el = scrollRef.current;
      if (!el) return;
      const stride = itemWidth + gap;
      const perPage = Math.max(1, Math.floor(el.clientWidth / stride));
      el.scrollBy({ left: dir * perPage * stride, behavior: "smooth" });
    },
    [itemWidth, gap]
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        page(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        page(-1);
      }
    },
    [page]
  );

  return (
    <div
      className={cn(
        "rail",
        overflows && !atStart && "rail--fade-start",
        overflows && !atEnd && "rail--fade-end",
        className
      )}
    >
      {overflows && (
        <>
          <button
            type="button"
            onClick={() => page(-1)}
            className="rail__nav rail__nav--prev"
            aria-label="Previous"
            disabled={atStart}
            tabIndex={atStart ? -1 : 0}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => page(1)}
            className="rail__nav rail__nav--next"
            aria-label="Next"
            disabled={atEnd}
            tabIndex={atEnd ? -1 : 0}
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="rail__track"
        style={{ gap: `${gap}px` }}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
      >
        {items.map((child, i) => (
          <div
            key={child.key ?? i}
            className="rail__item"
            style={{ width: itemWidth, minWidth: itemWidth }}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
