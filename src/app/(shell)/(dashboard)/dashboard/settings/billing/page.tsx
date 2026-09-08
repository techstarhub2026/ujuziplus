/**
 * /dashboard/settings/billing — real order history from DB
 */

import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";
import { getOrderHistory } from "@/lib/actions/orders";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const STATUS_VARIANT: Record<string, "success" | "accent" | "error" | "outline"> = {
  COMPLETED: "success",
  PENDING: "accent",
  PROCESSING: "accent",
  FAILED: "error",
  REFUNDED: "outline",
};

const METHOD_LABEL: Record<string, string> = {
  MPESA: "M-Pesa",
  AIRTEL_MONEY: "Airtel Money",
  TIGO_PESA: "Tigo Pesa",
  HALOPESA: "HaloPesa",
  CARD: "Card",
  BANK_TRANSFER: "Bank Transfer",
};

export default async function BillingSettingsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const orders = await getOrderHistory(session.user.id);

  return (
    <div>
      <PageHeader title="Billing & Payments" />

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand">
            {orders.filter((o) => o.status === "COMPLETED").length}
          </p>
          <p className="text-xs text-gray-500 mt-1">Completed orders</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand">
            {orders.reduce((sum, o) => sum + o.items.length, 0)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Courses purchased</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-brand">
            {formatCurrency(
              orders
                .filter((o) => o.status === "COMPLETED")
                .reduce((sum, o) => sum + Number(o.total), 0)
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total spent</p>
        </Card>
      </div>

      {/* Order history */}
      <Card className="mb-6">
        <h3 className="font-semibold mb-4">Payment history</h3>

        {orders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No orders yet.</p>
            <Link href="/courses" className="mt-2 inline-block text-sm text-brand hover:underline">
              Browse courses
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-gray-500">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Courses</th>
                  <th className="pb-2 pr-4 font-medium">Method</th>
                  <th className="pb-2 pr-4 font-medium">Amount</th>
                  <th className="pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="space-y-0.5">
                        {order.items.map((item) => {
                          const href = item.course
                            ? `/courses/${item.course.slug}`
                            : item.kit
                              ? `/kits/${item.kit.slug}`
                              : "#";
                          const label = item.course?.title ?? item.kit?.title ?? "Item";
                          return (
                            <Link
                              key={item.id}
                              href={href}
                              className="block text-gray-700 hover:text-brand hover:underline line-clamp-1"
                            >
                              {label}
                            </Link>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600 whitespace-nowrap">
                      {order.paymentMethod ? METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod : "—"}
                    </td>
                    <td className="py-3 pr-4 font-medium whitespace-nowrap">
                      {formatCurrency(Number(order.total))}
                    </td>
                    <td className="py-3">
                      <Badge variant={STATUS_VARIANT[order.status] ?? "secondary"}>
                        {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Saved methods placeholder */}
      <Card>
        <h3 className="font-semibold mb-2">Preferred payment method</h3>
        <p className="text-sm text-gray-500">
          Your last payment method is remembered at checkout. Full payment method management
          (save, delete) coming in a future update.
        </p>
      </Card>
    </div>
  );
}
