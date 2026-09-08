import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { ShowcaseSubmitForm } from "@/components/showcase/ShowcaseSubmitForm";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { Card } from "@/components/ui/card";
import { getLearnerShowcaseProjects } from "@/lib/actions/showcase";
import { CheckCircle, Clock, XCircle, Eye } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ShowcaseSubmissionActions } from "@/components/showcase/ShowcaseSubmissionActions";

const STATUS_CONFIG = {
  DRAFT:          { label: "Draft",         icon: <Clock className="h-3.5 w-3.5" />,        color: "warning" as const },
  PENDING_REVIEW: { label: "Under review",  icon: <Clock className="h-3.5 w-3.5" />,        color: "accent" as const },
  PUBLISHED:      { label: "Published",     icon: <CheckCircle className="h-3.5 w-3.5" />,  color: "success" as const },
  REJECTED:       { label: "Needs changes", icon: <XCircle className="h-3.5 w-3.5" />,      color: "error" as const },
};

export default async function ShowcaseSubmitPage() {
  const session = await getAuthSession();
  if (!session?.user?.id) redirect("/auth/login?callbackUrl=/dashboard/showcase/submit");

  const projects = await getLearnerShowcaseProjects(session.user.id);

  return (
    <div className="learner-canvas mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <LearnerPageHero
        banner="dashboard"
        title="My projects"
        subtitle="Submit projects for review. Once approved they appear in the public Innovation Showcase."
      />

      {/* Existing projects */}
      {projects.length > 0 && (
        <section className="mt-8">
          <h2 className="font-semibold text-gray-800 mb-3">Your submissions</h2>
          <div className="space-y-3">
            {projects.map((p) => {
              const conf = STATUS_CONFIG[p.status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.DRAFT;
              return (
                <Card key={p.id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.title}</p>
                    {p.tagline && <p className="text-xs text-gray-500 truncate">{p.tagline}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={conf.color} className="flex items-center gap-1">
                      {conf.icon}{conf.label}
                    </Badge>
                    {p.status === "PUBLISHED" && (
                      <Link href="/showcase" className="text-xs text-brand hover:underline flex items-center gap-1">
                        <Eye className="h-3 w-3" />View
                      </Link>
                    )}
                    {["DRAFT", "REJECTED"].includes(p.status) && (
                      <ShowcaseSubmissionActions projectId={p.id} title={p.title} />
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Submit form */}
      <section className="mt-10">
        <h2 className="font-semibold text-gray-800 mb-1">Submit a new project</h2>
        <p className="text-sm text-gray-500 mb-6">
          Projects are reviewed by our team within 48 hours. Featured projects get promoted to mentors and industry partners.
        </p>
        <ShowcaseSubmitForm />
      </section>
    </div>
  );
}
