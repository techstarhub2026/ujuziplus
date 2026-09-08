import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { getInstructorCredentials } from "@/lib/actions/instructor-credentials";
import { CredentialsManager } from "@/components/instructor/CredentialsManager";

export default async function InstructorCredentialsSettingsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const credentials = await getInstructorCredentials(session.user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Certifications</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage the certifications shown on your public profile.
      </p>
      <div className="mt-6">
        <CredentialsManager userId={session.user.id} initialCredentials={credentials} />
      </div>
    </div>
  );
}
