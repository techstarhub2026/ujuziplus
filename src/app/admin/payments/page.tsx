/**
 * /admin/payments — real orders from DB
 */
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminPayments } from "@/lib/actions/admin";
import { formatCurrency, formatDate } from "@/lib/utils";

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "outline"> = {
  COMPLETED: "success",
  PENDING: "warning",
  PROCESSING: "warning",
  FAILED: "error",
  REFUNDED: "outline",
};

const METHOD_LABEL: Record<string, string> = {
  MPESA: "M-Pesa",
  AIRTEL_MONEY: "Airtel",
  TIGO_PESA: "Tigo",
  HALOPESA: "HaloPesa",
  CARD: "Card",
  BANK_TRANSFER: "Bank",
};

export default async function AdminPaymentsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Number(searchParams.page ?? 1);
  const { orders, total, pages } = await getAdminPayments(page);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Payments</h1>
      <p className="text-sm text-gray-500 mb-6">{total} order{total !== 1 ? "s" : ""} total</p>

      <Card>
        {orders.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Customer</th>
                  <th className="pb-3 pr-4 font-medium">Courses</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Method</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                      {formatDate(o.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{o.user.fullName}</p>
                      <p className="text-xs text-gray-400">{o.user.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">
                      {o.items.map((i) => i.course?.title ?? i.kit?.title ?? "Item").join(", ")}
                    </td>
                    <td className="py-3 pr-4 font-medium">
                      {formatCurrency(Number(o.total))}
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {o.paymentMethod
                        ? METHOD_LABEL[o.paymentMethod] ?? o.paymentMethod
                        : "—"}
                    </td>
                    <td className="py-3">
                      <Badge variant={STATUS_VARIANT[o.status] ?? "outline"} className="text-xs">
                        {o.status.toLowerCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {page} of {pages}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/payments?page=${page - 1}`}
                className="text-sm text-brand hover:underline"
              >
                ← Previous
              </Link>
            )}
            {page < pages && (
              <Link
                href={`/admin/payments?page=${page + 1}`}
                className="text-sm text-brand hover:underline"
              >
                Next →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
