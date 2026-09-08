import { getPublishedSolutions, getUserJoinedSolutionSlugs } from "@/lib/actions/solutions";
import { SolutionsCatalogClient } from "@/components/solutions/SolutionsCatalogClient";
import { getAuthSession } from "@/lib/auth-server";

export default async function SolutionsPage() {
  const session = await getAuthSession();
  const [solutions, joinedSlugs] = await Promise.all([
    getPublishedSolutions().catch(() => []),
    session?.user?.id ? getUserJoinedSolutionSlugs(session.user.id).catch(() => []) : Promise.resolve([]),
  ]);

  return (
    <SolutionsCatalogClient
      solutions={solutions.map((s) => ({
        slug: s.slug,
        title: s.title,
        subtitle: s.subtitle,
        description: s.description,
        level: s.level,
        hours: s.hours,
        thumbnailUrl: s.thumbnailUrl ?? null,
        tags: s.tags,
        _count: s._count,
        author: s.author,
        organization: s.organization,
      }))}
      joinedSlugs={joinedSlugs}
      userId={session?.user?.id ?? null}
      isLoggedIn={!!session?.user?.id}
    />
  );
}
