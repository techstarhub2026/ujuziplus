import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProjectCardActions } from "@/components/dashboard/ProjectCardActions";
import { getUserProjects } from "@/lib/actions/projects";
import { getAuthSession } from "@/lib/auth-server";

export default async function DashboardProjectsPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login");

  const projects = await getUserProjects(session.user.id);

  return (
    <div>
      <PageHeader
        title="My Projects"
        description="Your innovation portfolio"
        action={
          <Button asChild>
            <Link href="/dashboard/projects/new">Submit project</Link>
          </Button>
        }
      />
      <div className="grid gap-6 md:grid-cols-2">
        {projects.map((p) => (
          <Link key={p.id} href={`/projects/${p.slug}`}>
            <Card hover className="overflow-hidden p-0">
              <div className="relative aspect-video bg-gray-100">
                {p.thumbnailUrl ? (
                  <Image src={p.thumbnailUrl} alt={p.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
                ) : null}
              </div>
              <div className="p-4">
                <Badge variant="accent" className="capitalize">{p.status.toLowerCase()}</Badge>
                {!p.isPublished && <Badge variant="warning" className="ml-1">Hidden</Badge>}
                <h3 className="mt-2 font-semibold">{p.title}</h3>
                <div className="mt-2">
                  <ProjectCardActions userId={session.user.id} projectId={p.id} title={p.title} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
      {projects.length === 0 && (
        <Card className="py-12 text-center text-sm text-gray-400">
          You have not submitted any projects yet.
        </Card>
      )}
    </div>
  );
}
