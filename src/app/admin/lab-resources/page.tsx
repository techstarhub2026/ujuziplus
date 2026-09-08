import Image from "next/image";
import Link from "next/link";
import { Plus, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminLabResources } from "@/lib/actions/lab-resources";
import { AdminLabResourceRowActions } from "@/components/admin/AdminLabResourceRowActions";

export default async function AdminLabResourcesPage() {
  const resources = await getAdminLabResources();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lab Resources</h1>
          <p className="text-sm text-gray-500">
            {resources.length} resource{resources.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/lab-resources/new">
            <Plus className="mr-1 h-4 w-4" /> Create lab resource
          </Link>
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card className="py-14 text-center text-sm text-gray-400">
          No lab resources yet.{" "}
          <Link href="/admin/lab-resources/new" className="text-brand underline">
            Create your first one
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => {
            const tags = Array.isArray(r.tags) ? (r.tags as string[]) : [];
            return (
              <Card key={r.id} className="flex items-center gap-4 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {r.thumbnailUrl ? (
                    <Image
                      src={r.thumbnailUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized={r.thumbnailUrl.startsWith("/content/")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <FlaskConical className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">{r.title}</h3>
                    <Badge variant="outline" size="sm" className="capitalize">
                      {r.type.toLowerCase()}
                    </Badge>
                    {r.category && (
                      <Badge variant="muted" size="sm">
                        {r.category}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    /{r.slug} · {tags.length} tag{tags.length !== 1 ? "s" : ""} · created{" "}
                    {r.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <AdminLabResourceRowActions id={r.id} slug={r.slug} title={r.title} />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
