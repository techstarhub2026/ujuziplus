import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrgAnalytics } from "@/lib/actions/organizations";
import { requireOrgAdmin } from "@/lib/org-access";
import { notFound } from "next/navigation";

export default async function OrgAnalyticsPage({ params }: { params: { slug: string } }) {
  await requireOrgAdmin(params.slug);
  const data = await getOrgAnalytics(params.slug);
  if (!data) notFound();

  const { org, enrollmentsByMonth, roleBreakdown } = data;
  const totalEnrollments = enrollmentsByMonth.length;
  const completed = enrollmentsByMonth.filter((e) => e.completedAt).length;
  const completionRate =
    totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-gray-500">Learning and kit metrics for {org.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="p-4">
          <p className="text-sm text-gray-500">Total enrollments</p>
          <p className="text-2xl font-bold">{totalEnrollments}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Completion rate</p>
          <p className="text-2xl font-bold">{completionRate}%</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Admins / instructors / members</p>
          <p className="text-lg font-bold">
            {roleBreakdown.admin} / {roleBreakdown.instructor} / {roleBreakdown.member}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-500">Kit inventory lines</p>
          <p className="text-2xl font-bold">{org.kitInventory.length}</p>
        </Card>
      </div>

      <Card className="p-4 mb-6">
        <h2 className="font-semibold mb-3">Kit inventory</h2>
        {org.kitInventory.length === 0 ? (
          <p className="text-sm text-gray-500">No kits in inventory.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {org.kitInventory.map((row) => (
              <li key={row.id} className="flex justify-between">
                <Link href={`/kits/${row.kit.slug}`} className="text-brand hover:underline">
                  {row.kit.title}
                </Link>
                <span>
                  {row.quantityOnHand} on hand · {row.quantityAllocated} allocated
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Recent kit requests</h2>
        {org.kitRequests.length === 0 ? (
          <p className="text-sm text-gray-500">No kit requests yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {org.kitRequests.map((req) => (
              <li key={req.id} className="flex justify-between gap-2">
                <span>
                  {req.kit.title} × {req.quantity} — {req.requester.fullName}
                </span>
                <Badge variant="outline">{req.status.toLowerCase()}</Badge>
              </li>
            ))}
          </ul>
        )}
        <Link href={`/org/${params.slug}/kits`} className="text-sm text-brand mt-3 inline-block hover:underline">
          Manage kits →
        </Link>
      </Card>
    </div>
  );
}
