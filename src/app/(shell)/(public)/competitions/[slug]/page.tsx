import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth-server";
import {
  getCompetitionBySlug,
  getUserCompetitionRegistrations,
} from "@/lib/actions/competitions";
import { CompetitionRegisterButton } from "@/components/competitions/CompetitionRegisterButton";

export default async function CompetitionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const competition = await getCompetitionBySlug(params.slug);
  if (!competition) notFound();

  const session = await getAuthSession();
  const regs = session?.user?.id
    ? await getUserCompetitionRegistrations(session.user.id)
    : [];
  const myReg = regs.find((r) => r.competition.slug === competition.slug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/competitions">← All competitions</Link>
      </Button>
      <Badge variant="outline">{competition.status.replace(/_/g, " ")}</Badge>
      <h1 className="mt-2 text-3xl font-bold">{competition.title}</h1>

      <Card className="mt-6 p-6 space-y-4">
        {competition.description && (
          <p className="text-gray-600 whitespace-pre-wrap">{competition.description}</p>
        )}
        {competition.prize && (
          <p className="text-sm">
            <span className="font-semibold">Prize: </span>
            {competition.prize}
          </p>
        )}
        <p className="text-sm text-gray-500">
          {competition._count.registrations} teams registered
          {competition.startDate &&
            ` · Starts ${new Date(competition.startDate).toLocaleDateString("en-TZ")}`}
        </p>

        {session?.user?.id ? (
          <CompetitionRegisterButton
            userId={session.user.id}
            competitionSlug={competition.slug}
            isRegistered={!!myReg}
            open={competition.status === "REGISTRATION_OPEN"}
          />
        ) : (
          <Button asChild>
            <Link href={`/auth/login?callbackUrl=/competitions/${competition.slug}`}>
              Sign in to register your team
            </Link>
          </Button>
        )}
      </Card>
    </div>
  );
}
