import Link from "next/link";
import { redirect } from "next/navigation";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { getUserSavedLabResources } from "@/lib/actions/lab-resources";
import { getAuthSession } from "@/lib/auth-server";

export default async function ResourcesPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login");

  const saved = await getUserSavedLabResources(session.user.id);

  return (
    <div>
      <PageHeader
        title="My Lab Resources"
        description="Saved hardware guides and reference materials"
        action={
          <Button asChild variant="outline">
            <Link href="/lab-resources">Browse catalog</Link>
          </Button>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {saved.map(({ labResource: r }) => (
          <Card key={r.id} className="flex items-center justify-between p-4">
            <div>
              <Badge variant="outline" className="capitalize">{r.type.toLowerCase()}</Badge>
              {r.category && <Badge variant="outline" className="ml-1">{r.category}</Badge>}
              <h3 className="mt-1 font-semibold">{r.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2">{r.description}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0 ml-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/lab-resources/${r.slug}`}>View</Link>
              </Button>
              {r.fileUrl && (
                <Button asChild variant="ghost" size="sm">
                  <a href={r.fileUrl} download>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
      {saved.length === 0 && (
        <Card className="py-12 text-center text-sm text-gray-400">
          Nothing saved yet. Browse{" "}
          <Link href="/lab-resources" className="text-brand hover:underline">
            lab resources
          </Link>{" "}
          and add items to My lab.
        </Card>
      )}
    </div>
  );
}
