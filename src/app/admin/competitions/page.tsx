import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminCompetitions } from "@/lib/actions/competitions";

export default async function AdminCompetitionsPage() {
  const list = await getAdminCompetitions();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Competitions</h1>
          <p className="text-sm text-gray-500">{list.length} total</p>
        </div>
        <Button asChild>
          <Link href="/admin/competitions/new"><Plus className="h-4 w-4 mr-1" /> New</Link>
        </Button>
      </div>
      <div className="space-y-3">
        {list.map((c) => (
          <Card key={c.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{c.title}</h3>
                <Badge variant="outline">{c.status.replace(/_/g, " ")}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {c.prize ?? "No prize set"} · {c._count.registrations} teams
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/competitions/${c.id}/edit`}>Edit</Link>
            </Button>
          </Card>
        ))}
        {list.length === 0 && (
          <Card className="py-12 text-center text-sm text-gray-400">No competitions yet.</Card>
        )}
      </div>
    </div>
  );
}
