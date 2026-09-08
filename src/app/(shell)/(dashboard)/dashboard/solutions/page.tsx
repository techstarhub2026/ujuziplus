import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { getMySubmissions } from "@/lib/actions/solutions";
import { getAuthSession } from "@/lib/auth-server";
import { Plus } from "lucide-react";

const STATUS_VARIANT: Record<string, "success" | "accent" | "warning" | "error" | "outline"> = {
  DRAFT: "outline",
  PENDING_REVIEW: "accent",
  PUBLISHED: "success",
  REJECTED: "error",
};

export default async function DashboardSolutionsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login");

  const submissions = await getMySubmissions();

  return (
    <div>
      <PageHeader
        title="My Solutions"
        description="Solutions you've submitted for review"
        action={
          <Button asChild>
            <Link href="/solutions/new">
              <Plus className="mr-1 h-3.5 w-3.5" />
              Share a project
            </Link>
          </Button>
        }
      />

      {submissions.length > 0 ? (
        <div className="space-y-3">
          {submissions.map((s) => (
            <Card key={s.id} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{s.title}</p>
                <p className="text-xs text-gray-500">
                  {s._count.joins} builder{s._count.joins !== 1 ? "s" : ""} joined
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Badge variant={STATUS_VARIANT[s.status] ?? "outline"}>
                  {s.status.replace("_", " ").toLowerCase()}
                </Badge>
                <Button asChild size="sm" variant="ghost">
                  <Link href={`/solutions/${s.slug}/edit`}>
                    {["DRAFT", "REJECTED"].includes(s.status) ? "Edit" : "View"}
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="py-12 text-center text-sm text-gray-400">
          You have not submitted any solutions yet.
        </Card>
      )}
    </div>
  );
}
