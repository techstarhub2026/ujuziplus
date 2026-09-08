import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminPrograms } from "@/lib/actions/programs";
import { formatCurrency } from "@/lib/utils";

export default async function AdminProgramsPage() {
  const programs = await getAdminPrograms();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Programs & Bootcamps</h1>
          <p className="text-sm text-gray-500">{programs.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/programs/new"><Plus className="h-4 w-4 mr-1" /> New</Link>
        </Button>
      </div>
      <div className="space-y-3">
        {programs.map((p) => (
          <Card key={p.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{p.title}</h3>
                <Badge variant="outline">{p.status}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {p.type} · {p.enrolledCount}/{p.seats} seats · {formatCurrency(Number(p.price))}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/programs/${p.id}/edit`}>Edit</Link>
            </Button>
          </Card>
        ))}
        {programs.length === 0 && (
          <Card className="py-12 text-center text-sm text-gray-400">No programs yet.</Card>
        )}
      </div>
    </div>
  );
}
