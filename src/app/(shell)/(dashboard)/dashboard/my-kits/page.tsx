import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getUserPurchasedKits } from "@/lib/actions/kits";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { Package, BookOpen } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getAuthSession } from "@/lib/auth-server";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop";

export default async function MyKitsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/dashboard/my-kits");

  const purchases = await getUserPurchasedKits(session.user.id);

  return (
    <div>
      <PageHeader
        title="My Kits"
        description="Learning kits you own — materials and BOM are on each kit page"
      />
      <div className="mb-6 flex justify-end">
        <Button asChild variant="outline" size="sm">
          <Link href="/kits">Browse kit store</Link>
        </Button>
      </div>

      {purchases.length === 0 ? (
        <Card className="py-16 text-center">
          <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h2 className="font-semibold mb-1">No kits yet</h2>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-5">
            Purchase a kit from the store or claim a free kit to see it here.
          </p>
          <Button asChild>
            <Link href="/kits">Explore kits</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {purchases.map((p) => {
            const kit = p.kit;
            const thumb = kit.thumbnailUrl || PLACEHOLDER;
            return (
              <Card key={p.id} className="flex gap-4 p-4 overflow-hidden">
                <div className="relative h-24 w-32 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image src={thumb} alt={kit.title} fill className="object-cover" sizes="128px" />
                </div>
                <div className="flex flex-1 flex-col min-w-0">
                  <Badge variant="outline" className="w-fit text-[10px] mb-1">
                    Owned
                  </Badge>
                  <Link href={`/kits/${kit.slug}`} className="font-semibold hover:text-brand line-clamp-2">
                    {kit.title}
                  </Link>
                  {kit.subtitle && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{kit.subtitle}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Package className="h-3 w-3" />
                      {kit._count.components} parts
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {kit._count.materials} guides
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-auto pt-2">
                    Acquired {new Date(p.purchasedAt).toLocaleDateString("en-TZ")}
                    {kit.isFree ? " · Free" : ` · ${formatCurrency(Number(kit.price ?? 0))}`}
                  </p>
                  <Button asChild size="sm" className="mt-2 w-fit">
                    <Link href={`/kits/${kit.slug}`}>Open kit</Link>
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
