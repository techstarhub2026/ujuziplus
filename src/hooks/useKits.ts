import { useMemo } from "react";
import { useKitStore } from "@/store/kitStore";

/** Stable selectors — avoid calling store methods that return new arrays inside useKitStore(). */
export function usePublishedKits(limit?: number) {
  const kits = useKitStore((s) => s.kits);
  return useMemo(() => {
    const published = kits.filter((k) => k.status === "published");
    return limit ? published.slice(0, limit) : published;
  }, [kits, limit]);
}

export function useKitBySlug(slug: string) {
  const kits = useKitStore((s) => s.kits);
  return useMemo(() => kits.find((k) => k.slug === slug), [kits, slug]);
}
