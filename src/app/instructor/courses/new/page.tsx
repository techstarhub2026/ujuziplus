/**
 * /instructor/courses/new
 * Creates a blank draft in DB, then redirects to the editor.
 */
import { redirect } from "next/navigation";
import { createDraftCourse } from "@/lib/actions/courses";
import { getAuthSession } from "@/lib/auth-server";

export default async function NewCoursePage() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/instructor/courses/new");
  }

  const result = await createDraftCourse(session.user.id);
  if (!result.success) redirect("/instructor/courses");

  redirect(`/instructor/courses/${result.data.courseId}/edit`);
}
