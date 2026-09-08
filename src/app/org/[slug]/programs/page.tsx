import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import { requireOrgStaff } from "@/lib/org-access";
import { getOrgPrograms } from "@/lib/actions/programs";
import { formatCurrency } from "@/lib/utils";
import { Plus, Users, CalendarDays } from "lucide-react";

export default async function OrgProgramsPage({ params }: { params: { slug: string } }) {
  const ctx = await requireOrgStaff(params.slug);

  const org = await db.organization.findUnique({
    where: { slug: params.slug },
    include: { members: { select: { userId: true } } },
  });
  if (!org) notFound();

  const memberIds = org.members.map((m) => m.userId);

  const [orgPrograms, memberRegistrations] = await Promise.all([
    getOrgPrograms(org.id),
    memberIds.length > 0
      ? db.programRegistration.findMany({
          where: { userId: { in: memberIds } },
          select: { programId: true, userId: true },
        })
      : Promise.resolve([]),
  ]);

  const regCountByProgram = memberRegistrations.reduce<Record<string, number>>((acc, r) => {
    acc[r.programId] = (acc[r.programId] ?? 0) + 1;
    return acc;
  }, {});

  const isOrgAdmin = ctx.isOrgAdmin || ctx.isPlatformStaff;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Programs</h1>
          <p className="text-sm text-gray-500">
            Programs created and managed by {org.name}
          </p>
        </div>
        {isOrgAdmin && (
          <Button asChild>
            <Link href={`/org/${params.slug}/programs/new`}>
              <Plus className="h-4 w-4 mr-1" />
              Create program
            </Link>
          </Button>
        )}
      </div>

      {orgPrograms.length === 0 ? (
        <Card className="py-16 text-center space-y-3">
          <p className="text-gray-400 text-sm">No programs yet for {org.name}.</p>
          {isOrgAdmin && (
            <Button asChild size="sm">
              <Link href={`/org/${params.slug}/programs/new`}>Create your first program</Link>
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {orgPrograms.map((p) => {
            const memberRegs = regCountByProgram[p.id] ?? 0;
            const price = Number(p.price);
            return (
              <Card key={p.id} className="p-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{p.title}</h3>
                      <Badge variant="outline">{p.type}</Badge>
                      <Badge variant={p.status === "OPEN" ? "success" : p.status === "FULL" ? "error" : "outline"}>
                        {p.status.toLowerCase()}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {p.enrolledCount}/{p.seats} enrolled · {p._count.registrations} registrations
                      </span>
                      {p.startDate && (
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(p.startDate).toLocaleDateString("en-TZ")}
                        </span>
                      )}
                      <span className="font-medium text-brand">
                        {price === 0 ? "Free" : formatCurrency(price)}
                      </span>
                      <span className="text-blue-600">
                        {memberRegs} org member{memberRegs !== 1 ? "s" : ""} registered
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/programs/${p.slug}`}>View public page</Link>
                    </Button>
                    {isOrgAdmin && (
                      <Button asChild size="sm">
                        <Link href={`/org/${params.slug}/programs/${p.id}/edit`}>Edit</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
