import { redirect } from "next/navigation";

/** Legacy route — real checkout uses /checkout/success/[orderId] */
export default function LegacyCheckoutSuccessPage() {
  redirect("/dashboard/my-courses");
}
