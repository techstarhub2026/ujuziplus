import { getPublishedKits, getPublishedKitCategories } from "@/lib/actions/kits";
import { KitsCatalogClient } from "@/components/kits/KitsCatalogClient";
import { getPageParticleSettings } from "@/components/home/PageParticleBackground";

export const dynamic = "force-dynamic";

export default async function KitsCatalogPage() {
  const [kits, categories, particleSettings] = await Promise.all([
    getPublishedKits(),
    getPublishedKitCategories(),
    getPageParticleSettings(),
  ]);

  return (
    <KitsCatalogClient
      kits={kits}
      categories={categories}
      particleSettings={particleSettings}
    />
  );
}
