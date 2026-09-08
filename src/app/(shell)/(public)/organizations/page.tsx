import Image from "next/image";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { getAllOrganizations } from "@/lib/actions/organizations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";

export const dynamic = "force-dynamic";

export default async function OrganizationsPage() {
  const organizations = await getAllOrganizations();

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="font-display text-2xl font-bold tracking-tight text-navy md:text-3xl">
        Organizations
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        {organizations.length} partner organizations
      </p>
      {organizations.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={<Building2 className="h-8 w-8 text-brand" />}
          title="No organizations listed yet"
          description="Check back soon as more partner organizations join the platform."
        />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {organizations.map((org) => (
            <Card key={org.id} className="p-4">
              <div className="flex items-start gap-4">
                {org.logoUrl ? (
                  <Image src={org.logoUrl} alt={org.name} width={48} height={48} className="rounded" />
                ) : (
                  <div className="h-12 w-12 rounded bg-brand/10 flex items-center justify-center text-brand font-bold">
                    {org.name.charAt(0)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">{org.name}</h3>
                  <p className="text-sm capitalize text-gray-500">
                    {org.type.toLowerCase()} · {org.memberCount} members
                  </p>
                  {org.isVerified && (
                    <Badge variant="success" className="mt-1">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" variant="secondary" className="border-brand text-brand">
                  <Link href={`/organizations/${org.slug}`}>Learn more</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
