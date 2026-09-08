import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { requireOrgStaff } from "@/lib/org-access";

export default async function OrgCompetitionsPage({ params }: { params: { slug: string } }) {
  await requireOrgStaff(params.slug);

  const org = await db.organization.findUnique({
    where: { slug: params.slug },
    include: { members: { select: { userId: true } } },
  });
  const memberIds = org?.members.map((m) => m.userId) ?? [];

  const competitions = await db.competition.findMany({ orderBy: { startDate: "desc" } });

  const registrations =
    memberIds.length > 0
      ? await db.competitionRegistration.findMany({
          where: { userId: { in: memberIds } },
          select: { competitionId: true },
        })
      : [];

  const regCountByComp = registrations.reduce<Record<string, number>>((acc, r) => {
    acc[r.competitionId] = (acc[r.competitionId] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Competitions</h1>
        <p className="text-sm text-gray-500">Platform competitions and org participation</p>
      </div>
      <div className="space-y-3">
        {competitions.map((c) => {
          const memberRegs = regCountByComp[c.id] ?? 0;
          return (
            <Card key={c.id} className="flex flex-wrap justify-between items-center gap-4 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{c.title}</h3>
                  <Badge variant="outline">{c.status.toLowerCase().replace("_", " ")}</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {c.prize ?? "Prizes TBA"} · {memberRegs} org member
                  {memberRegs !== 1 ? "s" : ""} registered
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={`/competitions/${c.slug}`}>View</Link>
              </Button>
            </Card>
          );
        })}
        {competitions.length === 0 && (
          <Card className="p-8 text-center text-gray-500 text-sm">No competitions listed.</Card>
        )}
      </div>
    </div>
  );
}
