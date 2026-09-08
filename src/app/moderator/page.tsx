import { redirect } from "next/navigation";

export default function ModeratorRootRedirect() {
  redirect("/admin/moderation");
}
