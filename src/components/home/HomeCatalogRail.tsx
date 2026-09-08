import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeCarousel } from "@/components/home/HomeCarousel";

export function HomeCatalogRail({
  title,
  description,
  seeAllHref,
  seeAllLabel = "Show all",
  children,
  itemWidth = 272,
  layout = "carousel",
}: {
  title: string;
  description?: string;
  seeAllHref?: string;
  seeAllLabel?: string;
  children: React.ReactNode;
  itemWidth?: number;
  /** "grid" wraps all cards in a responsive grid instead of a scrollable rail. */
  layout?: "carousel" | "grid";
  /** @deprecated auto-advancing rails were removed; rows only move on demand. */
  autoScroll?: boolean;
  /**
   * @deprecated Headers and rows are always left-aligned now. Mirroring the
   * header and right-hugging the cards on alternate sections cost the reader
   * a fresh scan on every row for no gain — every reference platform keeps
   * one consistent reading axis down the page.
   */
  align?: "left" | "right";
}) {
  return (
    <section className="home-rail">
      <div className="home-rail__header">
        <div className="home-rail__copy">
          <h2 className="home-rail__title">{title}</h2>
          {description && <p className="home-rail__desc">{description}</p>}
        </div>
        {seeAllHref && (
          <Link href={seeAllHref} className="home-rail__link">
            {seeAllLabel}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        )}
      </div>

      {layout === "grid" ? (
        <div className="home-rail-grid">{children}</div>
      ) : (
        <HomeCarousel itemWidth={itemWidth} gap={20} ariaLabel={title}>
          {children}
        </HomeCarousel>
      )}
    </section>
  );
}
