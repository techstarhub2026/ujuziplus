import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { getLearnerMentorData } from "@/lib/actions/mentors";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { Button } from "@/components/ui/button";
import { DashboardMentorsContent } from "./DashboardMentorsContent";

export default async function DashboardMentorsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/dashboard/mentors");

  const data = await getLearnerMentorData(session.user.id);

  return (
    <div className="learner-canvas mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <LearnerPageHero
        banner="dashboard"
        title="My mentors"
        subtitle="Your guidance requests, booked sessions, group office hours, and cohorts."
        panel={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/mentors/resources">Mentor resources</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/mentors">Browse mentors</Link>
            </Button>
          </div>
        }
      />
      <DashboardMentorsContent data={data} />
    </div>
  );
}
