import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { AccountSettingsForm } from "@/components/settings/AccountSettingsForm";

export default async function AccountSettingsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login");

  return <AccountSettingsForm userId={session.user.id} email={session.user.email ?? ""} />;
}
