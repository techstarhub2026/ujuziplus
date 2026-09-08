import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { SolutionEditorForm } from "@/components/solutions/SolutionEditorForm";
import { db } from "@/lib/db";

export default async function NewSolutionPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/solutions/new");

  // Fetch orgs the user is an admin/instructor of
  const memberships = await db.organizationMember.findMany({
    where: { userId: session.user.id, role: { in: ["ADMIN", "INSTRUCTOR"] } },
    include: { org: { select: { id: true, name: true } } },
  });
  const orgs = memberships.map((m) => ({ id: m.org.id, name: m.org.name }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Share a project</h1>
        <p className="mt-1 text-sm text-gray-500">
          Share your IoT project with the community. Fill in the details, add step-by-step instructions, and submit for review — approved projects appear in the public lab solutions catalog.
        </p>
      </div>
      <SolutionEditorForm orgs={orgs} />
    </div>
  );
}
