import Link from "next/link";
import { redirect } from "next/navigation";

/** Payment failure — linked from checkout error state when needed. */
export default function CheckoutFailedPage({
  searchParams,
}: {
  searchParams?: { order?: string };
}) {
  if (!searchParams?.order) {
    redirect("/cart");
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-xl font-bold">Payment not completed</h1>
      <p className="mt-2 text-sm text-gray-600">
        Your order was not charged. You can return to your cart and try again.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/cart" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Back to cart
        </Link>
        <Link href="/dashboard/settings/billing" className="rounded-lg border px-4 py-2 text-sm font-semibold">
          Billing history
        </Link>
      </div>
    </div>
  );
}
