import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getUserPrivacySettings } from "@/lib/actions/auth";
import { PrivacySettingsForm } from "@/components/settings/PrivacySettingsForm";

export default async function PrivacySettingsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/settings/privacy");
  }

  const privacy = await getUserPrivacySettings(session.user.id);
  if (!privacy) {
    redirect("/auth/login?callbackUrl=/dashboard/settings/privacy");
  }

  return <PrivacySettingsForm userId={session.user.id} initial={privacy} />;
}
