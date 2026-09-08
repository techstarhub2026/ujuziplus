import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/lib/actions/auth";
import { ProfileSettingsForm } from "@/components/settings/ProfileSettingsForm";

export default async function ProfileSettingsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/dashboard/settings/profile");
  }

  const profile = await getUserProfile(session.user.id);
  if (!profile) {
    redirect("/auth/login?callbackUrl=/dashboard/settings/profile");
  }

  return <ProfileSettingsForm userId={session.user.id} initial={profile} />;
}
