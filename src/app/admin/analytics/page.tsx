import { Card } from "@/components/ui/card";
import { getPlatformStats, getAdminPayments } from "@/lib/actions/admin";
import { getRevenueChartData, getEnrollmentChartData } from "@/lib/analytics/chart-data";
import { AnalyticsChartsRow } from "@/components/charts/AnalyticsCharts";
import { formatCurrency } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const [stats, { orders }, revenueData, enrollmentData] = await Promise.all([
    getPlatformStats(),
    getAdminPayments(1, 5),
    getRevenueChartData(),
    getEnrollmentChartData(),
  ]);

  const cards = [
    { label: "Total users", value: stats.users.toLocaleString() },
    { label: "Total courses", value: stats.courses.toLocaleString() },
    { label: "Enrollments", value: stats.enrollments.toLocaleString() },
    { label: "Gross revenue", value: formatCurrency(stats.totalRevenue) },
    { label: "Completed orders", value: stats.totalOrders.toLocaleString() },
    { label: "Certificates issued", value: stats.certificates.toLocaleString() },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Platform Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <p className="text-xs text-gray-500">{c.label}</p>
            <p className="text-2xl font-bold mt-1">{c.value}</p>
          </Card>
        ))}
      </div>

      <div className="mb-8">
        <AnalyticsChartsRow
          revenueData={revenueData}
          enrollmentData={enrollmentData}
          revenueTitle="Gross revenue (last 6 months)"
        />
      </div>

      <Card>
        <h2 className="font-semibold mb-4">Latest orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-gray-400">No orders yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {orders.map((o) => (
              <li
                key={o.id}
                className="flex justify-between rounded-lg bg-gray-50 px-3 py-2"
              >
                <span>{o.user.fullName}</span>
                <span className="font-medium">{formatCurrency(Number(o.total))}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
