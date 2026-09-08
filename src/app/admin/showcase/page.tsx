import { getAdminShowcaseProjects, adminUpdateShowcaseProject, adminDeleteShowcaseProject } from "@/lib/actions/showcase";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminShowcaseClient } from "./AdminShowcaseClient";

export default async function AdminShowcasePage() {
  const projects = await getAdminShowcaseProjects();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Showcase Review</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review learner project submissions for the public Innovation Showcase.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        {[
          { label: "Total", value: projects.length, color: "text-gray-900" },
          { label: "Pending review", value: projects.filter((p) => p.status === "PENDING_REVIEW").length, color: "text-amber-600" },
          { label: "Published", value: projects.filter((p) => p.status === "PUBLISHED").length, color: "text-green-600" },
          { label: "Rejected", value: projects.filter((p) => p.status === "REJECTED").length, color: "text-red-600" },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-3">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </Card>
        ))}
      </div>

      <AdminShowcaseClient
        projects={projects}
        onUpdate={adminUpdateShowcaseProject}
        onDelete={adminDeleteShowcaseProject}
      />
    </div>
  );
}
