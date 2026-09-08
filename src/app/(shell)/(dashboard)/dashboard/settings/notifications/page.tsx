import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getNotificationPreferences } from "@/lib/actions/notification-prefs";
import { getPushConfig, getUserPushSubscriptionCount } from "@/lib/actions/push";
import { getFcmConfig, getUserFcmTokenCount } from "@/lib/actions/fcm";
import { NotificationPrefsForm } from "@/components/settings/NotificationPrefsForm";
import { PushNotificationManager } from "@/components/settings/PushNotificationManager";
import { FcmNotificationManager } from "@/components/settings/FcmNotificationManager";

export default async function NotificationSettingsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login");

  const [prefs, pushConfig, subCount, fcmConfig, fcmCount] = await Promise.all([
    getNotificationPreferences(session.user.id),
    getPushConfig(),
    getUserPushSubscriptionCount(session.user.id),
    getFcmConfig(),
    getUserFcmTokenCount(session.user.id),
  ]);

  return (
    <div className="space-y-6">
      <PushNotificationManager
        userId={session.user.id}
        vapidPublicKey={pushConfig.publicKey}
        pushConfigured={pushConfig.configured}
        initialSubscribed={subCount > 0}
      />
      <FcmNotificationManager
        userId={session.user.id}
        serverConfigured={fcmConfig.serverConfigured}
        webConfig={fcmConfig.web}
        initialRegistered={fcmCount > 0}
      />
      <NotificationPrefsForm userId={session.user.id} initialPrefs={prefs} pushConfigured={pushConfig.configured} />
    </div>
  );
}
