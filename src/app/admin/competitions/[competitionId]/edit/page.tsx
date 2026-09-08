import { notFound } from "next/navigation";
import { AdminCompetitionForm } from "@/components/admin/AdminCompetitionForm";
import { getCompetitionById } from "@/lib/actions/competitions";

export default async function AdminEditCompetitionPage({
  params,
}: {
  params: { competitionId: string };
}) {
  const competition = await getCompetitionById(params.competitionId);
  if (!competition) notFound();
  return (
    <AdminCompetitionForm competitionId={params.competitionId} initial={competition} />
  );
}
