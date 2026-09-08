import { redirect } from "next/navigation";
import { SubmitProjectForm } from "@/components/projects/SubmitProjectForm";
import { getAuthSession } from "@/lib/auth-server";

export default async function NewProjectPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login");

  return <SubmitProjectForm userId={session.user.id} />;
}
