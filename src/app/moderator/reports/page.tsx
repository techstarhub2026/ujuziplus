import { redirect } from "next/navigation";

export default function ModeratorReportsRedirect() {
  redirect("/admin/discussions");
}
