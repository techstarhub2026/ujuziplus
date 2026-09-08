import Link from "next/link";
import { getPublishedKits } from "@/lib/actions/kits";
import { KitCard } from "@/components/kits/KitCard";
import { Button } from "@/components/ui/button";

/** Server-rendered featured kits for pages that can import async components */
export async function FeaturedKitsSection({ limit = 3 }: { limit?: number }) {
  const kits = await getPublishedKits();
  const featured = kits.slice(0, limit);

  if (featured.length === 0) return null;

  return (
    <section className="py-12">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Learning kits</h2>
          <p className="text-sm text-gray-500">Hands-on STEM hardware from our catalog</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/kits">View all kits</Link>
        </Button>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((k) => (
          <KitCard key={k.id} kit={k} />
        ))}
      </div>
    </section>
  );
}
