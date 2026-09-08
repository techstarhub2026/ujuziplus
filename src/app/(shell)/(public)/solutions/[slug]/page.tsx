import { notFound } from "next/navigation";
import { getSolutionBySlug, getUserSolutionJoin } from "@/lib/actions/solutions";
import { SolutionDetailClient } from "@/components/solutions/SolutionDetailClient";
import { getAuthSession } from "@/lib/auth-server";

export default async function SolutionDetailPage({ params }: { params: { slug: string } }) {
  const session = await getAuthSession();
  const solution = await getSolutionBySlug(params.slug);
  if (!solution) notFound();

  const join = session?.user?.id
    ? await getUserSolutionJoin(session.user.id, solution.slug)
    : null;

  return (
    <SolutionDetailClient
      solution={{
        slug: solution.slug,
        title: solution.title,
        subtitle: solution.subtitle,
        description: solution.description,
        level: solution.level,
        hours: solution.hours,
        thumbnailUrl: solution.thumbnailUrl ?? null,
        tags: Array.isArray(solution.tags) ? (solution.tags as string[]) : [],
        components: Array.isArray(solution.components) ? (solution.components as string[]) : [],
        relatedKitSlugs: Array.isArray(solution.relatedKitSlugs)
          ? (solution.relatedKitSlugs as string[])
          : [],
        labSteps: solution.labSteps,
        codeTemplate: solution.codeTemplate ?? null,
        joinCount: solution._count.joins,
      }}
      initialJoined={join !== null}
      initialProgress={Array.isArray(join?.labProgress) ? (join.labProgress as number[]) : []}
      userId={session?.user?.id ?? null}
    />
  );
}
