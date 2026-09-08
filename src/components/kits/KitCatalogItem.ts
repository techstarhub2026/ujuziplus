/** Published kit shape for catalog cards */
export type KitCatalogItem = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  difficulty: string;
  ageRange: string | null;
  price: number;
  isFree: boolean;
  componentCount: number;
  materialCount: number;
};

export function toKitCatalogItem(
  kit: {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    thumbnailUrl: string | null;
    category: string | null;
    difficulty: string;
    ageRange: string | null;
    price: unknown;
    isFree: boolean;
    _count: { components: number; materials: number };
  }
): KitCatalogItem {
  return {
    id: kit.id,
    slug: kit.slug,
    title: kit.title,
    subtitle: kit.subtitle,
    thumbnailUrl: kit.thumbnailUrl,
    category: kit.category,
    difficulty: kit.difficulty.toLowerCase(),
    ageRange: kit.ageRange,
    price: Number(kit.price ?? 0),
    isFree: kit.isFree,
    componentCount: kit._count.components,
    materialCount: kit._count.materials,
  };
}
