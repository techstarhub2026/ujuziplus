import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireOrgAdmin } from "@/lib/org-access";
import { OrgProgramForm } from "@/components/org/OrgProgramForm";
import { AdminProgramUnitsSection } from "@/components/admin/AdminProgramUnitsSection";
import { AdminProgramEventsSection } from "@/components/admin/AdminProgramEventsSection";
import { AdminProgramRegistrantsSection } from "@/components/admin/AdminProgramRegistrantsSection";
import { getAdminProgramRegistrations } from "@/lib/actions/programs";
import { getAdminProgramUnits, getCoursesForSelect } from "@/lib/actions/program-units";
import { getAdminProgramEvents } from "@/lib/actions/program-events";

export default async function OrgEditProgramPage({
  params,
}: {
  params: { slug: string; programId: string };
}) {
  await requireOrgAdmin(params.slug);

  const org = await db.organization.findUnique({
    where: { slug: params.slug },
    select: { id: true },
  });
  if (!org) notFound();

  const program = await db.program.findFirst({
    where: { id: params.programId, organizationId: org.id },
  });
  if (!program) notFound();

  const initial = {
    title: program.title,
    type: program.type,
    thumbnailUrl: program.thumbnailUrl ?? null,
    posterUrl: program.posterUrl ?? null,
    description: program.description ?? "",
    startDate: program.startDate ? program.startDate.toISOString().slice(0, 10) : "",
    endDate: program.endDate ? program.endDate.toISOString().slice(0, 10) : "",
    format: program.format,
    seats: program.seats,
    price: Number(program.price),
    status: program.status,
  };

  const [units, courseOptions, events, registrants] = await Promise.all([
    getAdminProgramUnits(program.id),
    getCoursesForSelect(),
    getAdminProgramEvents(program.id),
    getAdminProgramRegistrations(program.id),
  ]);

  return (
    <div className="space-y-6">
      <OrgProgramForm
        orgId={org.id}
        orgSlug={params.slug}
        programId={program.id}
        initial={initial}
      />

      <AdminProgramUnitsSection
        programId={program.id}
        units={units.map((u) => ({ id: u.id, course: u.course }))}
        courseOptions={courseOptions}
      />

      <AdminProgramEventsSection
        programId={program.id}
        events={events}
      />

      <AdminProgramRegistrantsSection
        programId={program.id}
        registrants={registrants}
      />
    </div>
  );
}
