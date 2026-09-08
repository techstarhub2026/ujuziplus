import { notFound, redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { SolutionEditorForm } from "@/components/solutions/SolutionEditorForm";
import { adminPublishDirectly, type LabStepData } from "@/lib/actions/solutions";

export default async function EditSolutionPage({ params }: { params: { slug: string } }) {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect(`/auth/login?callbackUrl=/solutions/${params.slug}/edit`);

  const solution = await db.solution.findUnique({ where: { slug: params.slug } });
  if (!solution) notFound();

  const isAdmin = session.user.role === "ADMIN" || session.user.role === "MODERATOR";
  const isAuthor = solution.authorId === session.user.id;
  if (!isAdmin && !isAuthor) redirect(`/solutions/${params.slug}`);

  const memberships = await db.organizationMember.findMany({
    where: { userId: session.user.id, role: { in: ["ADMIN", "INSTRUCTOR"] } },
    include: { org: { select: { id: true, name: true } } },
  });
  const orgs = memberships.map((m) => ({ id: m.org.id, name: m.org.name }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit project</h1>
        <p className="mt-1 text-sm text-gray-500">
          {isAdmin
            ? "Admin view — you can publish directly without review."
            : "Edit your submission. When ready, submit for review to go live."}
        </p>
      </div>
      <SolutionEditorForm
        solutionId={solution.id}
        solutionSlug={solution.slug}
        initialStatus={solution.status}
        initial={{
          title: solution.title,
          subtitle: solution.subtitle ?? "",
          description: solution.description,
          level: solution.level,
          hours: solution.hours,
          thumbnailUrl: solution.thumbnailUrl ?? null,
          tags: Array.isArray(solution.tags) ? (solution.tags as string[]) : [],
          components: Array.isArray(solution.components) ? (solution.components as string[]) : [],
          relatedKitSlugs: Array.isArray(solution.relatedKitSlugs) ? (solution.relatedKitSlugs as string[]) : [],
          labSteps: Array.isArray(solution.labSteps) ? (solution.labSteps as LabStepData[]) : [],
          codeTemplate: solution.codeTemplate ?? "",
          orgId: solution.orgId ?? null,
        }}
        orgs={orgs}
        publishDirectly={isAdmin}
        onPublish={isAdmin ? adminPublishDirectly : undefined}
      />
    </div>
  );
}
