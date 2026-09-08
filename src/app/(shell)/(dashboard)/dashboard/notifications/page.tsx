/**
 * /dashboard/notifications — notification center
 */

import { redirect } from "next/navigation";
import { getNotifications } from "@/lib/actions/notifications";
import { PageHeader } from "@/components/shared/PageHeader";
import { NotificationList } from "@/components/notifications/NotificationList";
import { getAuthSession } from "@/lib/auth-server";

export default async function NotificationsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const notifications = await getNotifications(session.user.id, 50);

  return (
    <div className="animate-fade-in">
      <PageHeader
        variant="hero"
        banner="dashboard"
        title="Notifications"
        description="Stay updated on courses, community, and platform activity."
      />
      <NotificationList notifications={notifications} userId={session.user.id} />
    </div>
  );
}
