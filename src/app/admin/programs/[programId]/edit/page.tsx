import { notFound } from "next/navigation";
import { AdminProgramForm } from "@/components/admin/AdminProgramForm";
import { AdminProgramUnitsSection } from "@/components/admin/AdminProgramUnitsSection";
import { AdminProgramEventsSection } from "@/components/admin/AdminProgramEventsSection";
import { AdminProgramRegistrantsSection } from "@/components/admin/AdminProgramRegistrantsSection";
import { getProgramById, getOrgsForSelect, getAdminProgramRegistrations } from "@/lib/actions/programs";
import { getAdminProgramUnits, getCoursesForSelect } from "@/lib/actions/program-units";
import { getAdminProgramEvents } from "@/lib/actions/program-events";

export default async function AdminEditProgramPage({
  params,
}: {
  params: { programId: string };
}) {
  const [program, orgs, units, courseOptions, events, registrants] = await Promise.all([
    getProgramById(params.programId),
    getOrgsForSelect(),
    getAdminProgramUnits(params.programId),
    getCoursesForSelect(),
    getAdminProgramEvents(params.programId),
    getAdminProgramRegistrations(params.programId),
  ]);
  if (!program) notFound();

  const serialized = {
    ...program,
    startDate: program.startDate ?? null,
    endDate: program.endDate ?? null,
    organizationId: program.organizationId ?? null,
    posterUrl: program.posterUrl ?? null,
  };

  return (
    <div className="space-y-6">
      <AdminProgramForm
        programId={params.programId}
        initial={serialized}
        orgs={orgs}
      />

      <AdminProgramUnitsSection
        programId={params.programId}
        units={units.map((u) => ({ id: u.id, course: u.course }))}
        courseOptions={courseOptions}
      />

      <AdminProgramEventsSection
        programId={params.programId}
        events={events}
      />

      <AdminProgramRegistrantsSection
        programId={params.programId}
        registrants={registrants}
      />
    </div>
  );
}
