"use client";

import { ProjectCard } from "@/components/shared/ProjectCard";
import { MotionGrid } from "@/components/motion/RevealStagger";

export function ProjectsGrid({
  projects,
}: {
  projects: {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    thumbnailUrl: string | null;
    creator: { fullName: string; avatarUrl: string | null };
  }[];
}) {
  return (
    <MotionGrid className="catalog-grid mt-8">
      {projects.map((p) => (
        <ProjectCard
          key={p.id}
          slug={p.slug}
          title={p.title}
          description={p.description}
          category={p.category}
          thumbnailUrl={p.thumbnailUrl}
          creatorName={p.creator.fullName}
          creatorAvatar={p.creator.avatarUrl}
        />
      ))}
    </MotionGrid>
  );
}
