import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { getUserOrganizations } from "@/lib/actions/org-kits";
import { db } from "@/lib/db";
import { getAuthSession } from "@/lib/auth-server";

export default async function DashboardOrganizationsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login");

  const [memberships, allOrgs] = await Promise.all([
    getUserOrganizations(session.user.id),
    db.organization.findMany({ orderBy: { name: "asc" } }),
  ]);

  const memberSlugs = new Set(memberships.map((m) => m.org.slug));
  const otherOrgs = allOrgs.filter((o) => !memberSlugs.has(o.slug));

  return (
    <div>
      <PageHeader
        title="Organizations"
        description="Schools and innovation hubs — open the org portal for kit requests"
      />

      {memberships.length > 0 && (
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">Your organizations</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {memberships.map((m) => (
              <Card key={m.id} className="flex items-center gap-4 p-4">
                {m.org.logoUrl ? (
                  <Image src={m.org.logoUrl} alt="" width={48} height={48} />
                ) : (
                  <div className="h-12 w-12 rounded-lg bg-brand/10 flex items-center justify-center text-brand font-bold">
                    {m.org.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{m.org.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{m.role.toLowerCase()}</p>
                  {m.org.isVerified && (
                    <Badge variant="success" className="mt-1">
                      Verified
                    </Badge>
                  )}
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/org/${m.org.slug}/dashboard`}>Open portal</Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {otherOrgs.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-3">
            {memberships.length > 0 ? "Other organizations" : "Browse organizations"}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {otherOrgs.map((org) => (
              <Card key={org.id} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <h3 className="font-semibold">{org.name}</h3>
                  <p className="text-sm text-gray-500">{org.memberCount} members</p>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/org/${org.slug}/dashboard`}>View</Link>
                </Button>
              </Card>
            ))}
          </div>
        </section>
      )}

      {allOrgs.length === 0 && (
        <Card className="py-12 text-center text-sm text-gray-400">
          No organizations in the directory yet.
        </Card>
      )}
    </div>
  );
}
