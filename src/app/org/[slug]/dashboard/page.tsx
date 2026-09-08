import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOrgDashboardStats } from "@/lib/actions/organizations";
import { requireOrgPageAccess } from "@/lib/org-access";
import { notFound } from "next/navigation";

export default async function OrgDashboardPage({ params }: { params: { slug: string } }) {
  const { isOrgAdmin } = await requireOrgPageAccess(params.slug);
  const data = await getOrgDashboardStats(params.slug);
  if (!data) notFound();

  const { org, stats } = data;

  return (
    <div>
      <div className="mb-8 rounded-xl bg-brand p-6 text-white">
        <h1 className="font-display text-2xl font-bold">{org.name}</h1>
        <p className="text-blue-100">
          {stats.memberCount.toLocaleString()} members
          {org.isVerified && " · Verified partner"}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Courses offered", value: stats.coursesOffered },
          { label: "Kit units on hand", value: stats.kitUnitsOnHand },
          { label: "Pending kit requests", value: stats.pendingKitRequests },
          { label: "Pending invites", value: stats.pendingInvites },
        ].map((s) => (
          <Card key={s.label} className="p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-6 p-4">
        <CardTitle>Quick links</CardTitle>
        <ul className="mt-4 space-y-2 text-sm">
          {isOrgAdmin && (
            <li>
              <Link href={`/org/${params.slug}/members`} className="text-brand hover:underline">
                Manage members & invites
              </Link>
            </li>
          )}
          <li>
            <Link href={`/org/${params.slug}/kits`} className="text-brand hover:underline">
              Kit inventory & procurement
            </Link>
            {stats.pendingKitRequests > 0 && (
              <Badge variant="warning" className="ml-2">
                {stats.pendingKitRequests} pending
              </Badge>
            )}
          </li>
          <li>
            <Link href={`/org/${params.slug}/courses`} className="text-brand hover:underline">
              Organization courses
            </Link>
          </li>
          <li>
            <Link href={`/org/${params.slug}/programs`} className="text-brand hover:underline">
              Programs & bootcamps
            </Link>
          </li>
          {isOrgAdmin && (
            <li>
              <Link href={`/org/${params.slug}/analytics`} className="text-brand hover:underline">
                View analytics
              </Link>
            </li>
          )}
          <li>
            <Link href="/courses" className="text-brand hover:underline">
              Browse UjuziLab courses
            </Link>
          </li>
        </ul>
      </Card>
    </div>
  );
}
