import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProjectsGrid } from "@/components/projects/ProjectsGrid";
import { PageSection } from "@/components/motion/PageSection";
import { LearnerPageHero, HeroActions } from "@/components/shared/LearnerPageHero";
import { FolderKanban } from "lucide-react";
import { getPublishedProjects } from "@/lib/actions/projects";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getPublishedProjects();

  return (
    <div className="learner-canvas mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <LearnerPageHero
        banner="projects"
        title="Innovation Showcase"
        subtitle="Real projects built by African innovators — get inspired and share your own."
      >
        <HeroActions primary={{ href: "/dashboard/projects/new", label: "Submit a project" }} />
      </LearnerPageHero>

      {projects.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={<FolderKanban className="h-8 w-8 text-brand" />}
          title="No projects yet"
          description="Be the first to showcase your innovation on UjuziLab."
          actionLabel="Submit your project"
          actionHref="/dashboard/projects/new"
        />
      ) : (
        <ProjectsGrid projects={projects} />
      )}

      {projects.length > 0 && (
        <PageSection className="mt-10 text-center" delay={0.12}>
          <Button asChild variant="outline">
            <Link href="/dashboard/projects/new">Share your project</Link>
          </Button>
        </PageSection>
      )}
    </div>
  );
}
