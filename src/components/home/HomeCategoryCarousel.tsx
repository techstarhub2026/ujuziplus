import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HomeCarousel } from "@/components/home/HomeCarousel";

export function HomeCategoryCarousel({
  title,
  seeAllHref,
  showCategoryLink = true,
  children,
  itemWidth,
}: {
  title: string;
  seeAllHref?: string;
  /** Hide when section already has a single “See all” link */
  showCategoryLink?: boolean;
  children: React.ReactNode;
  itemWidth?: number;
}) {
  const linkVisible = showCategoryLink && seeAllHref;

  return (
    <div className="home-category-row">
      <div className="home-category-row__header">
        <h3 className="home-category-row__title">{title}</h3>
        {linkVisible && (
          <Link href={seeAllHref} className="home-category-link">
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <HomeCarousel itemWidth={itemWidth}>{children}</HomeCarousel>
    </div>
  );
}

export function groupCatalogItems<T>(
  items: T[],
  getLabel: (item: T) => string | null | undefined,
  fallbackLabel = "Featured"
): { label: string; items: T[] }[] {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const raw = getLabel(item)?.trim();
    const label = raw && raw.length > 0 ? raw : fallbackLabel;
    const bucket = groups.get(label) ?? [];
    bucket.push(item);
    groups.set(label, bucket);
  }

  return Array.from(groups.entries()).map(([label, groupedItems]) => ({
    label,
    items: groupedItems,
  }));
}
