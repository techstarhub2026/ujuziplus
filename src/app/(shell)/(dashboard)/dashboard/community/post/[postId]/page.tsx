import { redirect } from "next/navigation";
import { db } from "@/lib/db";

/** Legacy route — resolve discussion id and redirect to the current URL shape. */
export default async function LegacyCommunityPostRedirect({
  params,
}: {
  params: { postId: string };
}) {
  const discussion = await db.discussion.findUnique({
    where: { id: params.postId },
    select: { id: true, channel: true },
  });

  if (discussion) {
    redirect(`/dashboard/community/${discussion.channel}/${discussion.id}`);
  }

  redirect("/dashboard/community");
}
