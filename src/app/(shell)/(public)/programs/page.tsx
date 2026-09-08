import { Card } from "@/components/ui/card";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { ProgramsList } from "@/components/programs/ProgramsList";
import { getPrograms, getUserProgramRegistrations } from "@/lib/actions/programs";
import { getAuthSession } from "@/lib/auth-server";
import { PageParticleBackground } from "@/components/home/PageParticleBackground";

export default async function ProgramsPage() {
  const session = await getAuthSession();
  const [programs, registered] = await Promise.all([
    getPrograms(),
    session?.user?.id
      ? getUserProgramRegistrations(session.user.id)
      : Promise.resolve([] as string[]),
  ]);

  return (
    <div className="learner-canvas mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <PageParticleBackground />
      <LearnerPageHero
        banner="programs"
        title="Programs & Bootcamps"
        subtitle="Intensive learning paths and innovation initiatives — online, in-person, or hybrid."
      />

      {programs.length === 0 ? (
        <Card className="mt-8 py-16 text-center text-sm text-gray-400">
          No programs are listed right now.
        </Card>
      ) : (
        <ProgramsList programs={programs} registered={registered} />
      )}
    </div>
  );
}
