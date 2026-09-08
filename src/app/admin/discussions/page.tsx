/**
 * /admin/discussions — moderation panel
 */

import { db } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DiscussionModerationPanel } from "@/components/admin/DiscussionModerationPanel";
import { getAuthSession } from "@/lib/auth-server";

export default async function AdminDiscussionsPage() {
  const session = await getAuthSession();

  const discussions = await db.discussion.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      author: { select: { id: true, fullName: true, email: true } },
      course: { select: { title: true } },
      _count: { select: { replies: true, likes: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Discussion Moderation</h1>
      <DiscussionModerationPanel
        discussions={discussions}
        adminId={session!.user.id}
      />
    </div>
  );
}
