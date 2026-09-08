import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCompetitions, getUserCompetitionRegistrations } from "@/lib/actions/competitions";
import { CompetitionRegisterButton } from "@/components/competitions/CompetitionRegisterButton";
import { getAuthSession } from "@/lib/auth-server";

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline" | "accent"> = {
  REGISTRATION_OPEN: "success",
  UPCOMING: "warning",
  IN_PROGRESS: "accent",
  COMPLETED: "outline",
};

export default async function DashboardCompetitionsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const [competitions, regs] = await Promise.all([
    getCompetitions(),
    getUserCompetitionRegistrations(session.user.id),
  ]);
  const registeredSlugs = new Set(regs.map((r) => r.competition.slug));

  return (
    <div>
      <PageHeader
        variant="hero"
        banner="competitions"
        title="Competitions"
        description="Hackathons and innovation challenges"
      />
      {competitions.length === 0 ? (
        <Card className="py-12 text-center text-sm text-gray-400">
          No competitions listed yet.
        </Card>
      ) : (
        <div className="space-y-4">
          {competitions.map((c) => {
            const myReg = regs.find((r) => r.competition.slug === c.slug);
            return (
            <Card key={c.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <Badge variant={STATUS_VARIANT[c.status] ?? "outline"}>
                  {c.status.replace("_", " ").toLowerCase()}
                </Badge>
                <h3 className="mt-2 font-semibold">{c.title}</h3>
                <p className="text-sm text-gray-500">
                  {c.prize ?? "Prizes TBA"} · {c.teamsCount} teams registered
                </p>
                {myReg && (
                  <p className="text-xs text-green-600 mt-1">
                    You are registered{myReg.teamName ? ` (${myReg.teamName})` : ""}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/competitions/${c.slug}`}>View details</Link>
                </Button>
                <CompetitionRegisterButton
                  userId={session.user.id}
                  competitionSlug={c.slug}
                  isRegistered={registeredSlugs.has(c.slug)}
                  open={c.status === "REGISTRATION_OPEN"}
                />
              </div>
            </Card>
          );
          })}
        </div>
      )}
    </div>
  );
}
