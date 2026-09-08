import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminKits } from "@/lib/actions/kits";
import { formatCurrency } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "success" | "outline" | "warning"> = {
  PUBLISHED: "success",
  DRAFT: "warning",
  ARCHIVED: "outline",
};

export default async function AdminKitsPage() {
  const kits = await getAdminKits();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Learning Kits</h1>
          <p className="text-sm text-gray-500">{kits.length} kit{kits.length !== 1 ? "s" : ""}</p>
        </div>
        <Button asChild>
          <Link href="/admin/kits/new">
            <Plus className="h-4 w-4 mr-1" /> New kit
          </Link>
        </Button>
      </div>

      {kits.length === 0 ? (
        <Card className="py-14 text-center text-sm text-gray-400">
          No kits yet.{" "}
          <Link href="/admin/kits/new" className="text-brand underline">
            Create your first kit
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {kits.map((k) => (
            <Card key={k.id} className="flex gap-4 p-4">
              <div className="relative h-20 w-28 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                {k.thumbnailUrl ? (
                  <Image src={k.thumbnailUrl} alt="" fill className="object-cover" />
                ) : null}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold truncate">{k.title}</h3>
                  <Badge variant={STATUS_VARIANT[k.status] ?? "outline"} className="text-xs">
                    {k.status.toLowerCase()}
                  </Badge>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {k._count.components} components · {k._count.materials} materials
                </p>
                <p className="text-sm font-medium text-brand mt-1">
                  {k.isFree ? "Free" : formatCurrency(Number(k.price ?? 0))}
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link href={`/admin/kits/${k.id}/edit`}>Edit</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
