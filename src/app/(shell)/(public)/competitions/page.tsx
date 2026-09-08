import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { getCompetitions, getUserCompetitionRegistrations } from "@/lib/actions/competitions";
import { getAuthSession } from "@/lib/auth-server";
import { PageParticleBackground } from "@/components/home/PageParticleBackground";

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline" | "accent"> = {
  REGISTRATION_OPEN: "success",
  UPCOMING: "warning",
  IN_PROGRESS: "accent",
  COMPLETED: "outline",
};

export default async function CompetitionsPage() {
  const session = await getAuthSession();
  const [competitions, regs] = await Promise.all([
    getCompetitions(),
    session?.user?.id
      ? getUserCompetitionRegistrations(session.user.id)
      : Promise.resolve([]),
  ]);
  const registeredSlugs = new Set(regs.map((r) => r.competition.slug));

  return (
    <div className="learner-canvas pb-12">
      <PageParticleBackground />
      <LearnerPageHero
        banner="competitions"
        title="Competitions"
        subtitle="Hackathons and innovation challenges across Africa's STEM ecosystem"
        eyebrow={false}
      />

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        {competitions.length === 0 ? (
          <Card className="py-12 text-center text-sm text-gray-400">No competitions yet.</Card>
        ) : (
          <div className="space-y-4">
            {competitions.map((c) => (
              <Link key={c.id} href={`/competitions/${c.slug}`}>
                <Card className="premium-card transition hover:shadow-card-hover">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-bold text-gray-900">{c.title}</h2>
                        {registeredSlugs.has(c.slug) && (
                          <Badge variant="success">Registered</Badge>
                        )}
                      </div>
                      {c.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{c.description}</p>
                      )}
                    </div>
                    <Badge variant={STATUS_VARIANT[c.status] ?? "outline"} className="shrink-0 capitalize">
                      {c.status.replace(/_/g, " ").toLowerCase()}
                    </Badge>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
