import { redirect } from "next/navigation";

export default function ModeratorCoursesRedirect() {
  redirect("/admin/courses");
}
