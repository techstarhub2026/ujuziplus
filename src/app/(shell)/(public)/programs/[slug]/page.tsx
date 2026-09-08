import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProgramBySlug, getUserProgramRegistrations } from "@/lib/actions/programs";
import { getProgramUnitsForLearner } from "@/lib/actions/program-units";
import { getProgramEvents } from "@/lib/actions/program-events";
import { ProgramRegisterButton } from "@/components/programs/ProgramRegisterButton";
import { ProgramDetailTabs } from "@/components/programs/ProgramDetailTabs";
import { formatCurrency } from "@/lib/utils";
import { getAuthSession } from "@/lib/auth-server";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { MapPin, BookOpen, Clock, Building2 } from "lucide-react";

const FORMAT_LABEL: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "In-person",
  HYBRID: "Hybrid",
};

export default async function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const program = await getProgramBySlug(params.slug);
  if (!program || program.status === "DRAFT" || program.status === "ARCHIVED") notFound();

  const session = await getAuthSession();
  const [registered, units, events] = await Promise.all([
    session?.user?.id ? getUserProgramRegistrations(session.user.id) : Promise.resolve([] as string[]),
    getProgramUnitsForLearner(params.slug, session?.user?.id),
    getProgramEvents(params.slug),
  ]);
  const isRegistered = registered.includes(program.slug);
  const isFull = program.enrolledCount >= program.seats;
  const isClosed = program.status !== "OPEN";
  const price = Number(program.price);

  const durationDays =
    program.startDate && program.endDate
      ? Math.max(1, Math.round((program.endDate.getTime() - program.startDate.getTime()) / 86_400_000))
      : null;

  const detailsTable = [
    { label: "Number of units", value: `${program._count.units} unit${program._count.units !== 1 ? "s" : ""}` },
    { label: "Duration", value: durationDays ? `${durationDays} day${durationDays !== 1 ? "s" : ""}` : "TBD" },
    {
      label: "Start date",
      value: program.startDate
        ? program.startDate.toLocaleDateString("en-TZ", { month: "long", day: "numeric", year: "numeric" })
        : "TBD",
    },
    {
      label: "End date",
      value: program.endDate
        ? program.endDate.toLocaleDateString("en-TZ", { month: "long", day: "numeric", year: "numeric" })
        : "TBD",
    },
  ];

  return (
    <div className="learner-canvas pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Breadcrumbs
          items={[{ label: "Programs", href: "/programs" }, { label: program.title }]}
        />
      </div>

      {/* Hero */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline">{program.type}</Badge>
          <Badge variant={program.status === "OPEN" ? "success" : "muted"}>
            {program.status.toLowerCase()}
          </Badge>
        </div>

        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
          {program.title}
        </h1>
        {program.description && (
          <p className="mt-2 max-w-2xl text-sm text-gray-600">{program.description}</p>
        )}

        {/* Stat row */}
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-gray-400" />
            {FORMAT_LABEL[program.format] ?? program.format}
          </span>
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-4 w-4 text-gray-400" />
            {program._count.units} unit{program._count.units !== 1 ? "s" : ""}
          </span>
          {durationDays && (
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-gray-400" />
              {durationDays} day{durationDays !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Published by */}
        {program.organization && (
          <Link
            href={`/org/${program.organization.slug}`}
            className="mt-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand transition-colors"
          >
            {program.organization.logoUrl ? (
              <Image
                src={program.organization.logoUrl}
                alt=""
                width={28}
                height={28}
                className="shrink-0 rounded-md border border-gray-200/80 bg-white object-contain p-0.5"
              />
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-gray-200/80 bg-gray-50">
                <Building2 className="h-4 w-4 text-gray-400" />
              </span>
            )}
            Published by: {program.organization.name}
          </Link>
        )}

        {/* Join */}
        <div className="mt-5 max-w-xs">
          {session?.user?.id ? (
            <ProgramRegisterButton
              userId={session.user.id}
              programSlug={program.slug}
              programId={program.id}
              price={price}
              isRegistered={isRegistered}
              isFull={isFull || isClosed}
            />
          ) : (
            <Button asChild size="lg" className="w-full">
              <Link href={`/auth/login?callbackUrl=/programs/${program.slug}`}>Sign in to register</Link>
            </Button>
          )}
          {program.startDate && !isRegistered && (
            <p className="mt-1.5 text-center text-xs text-gray-400">
              Starts {program.startDate.toLocaleDateString("en-TZ", { month: "long", day: "numeric", year: "numeric" })}
            </p>
          )}
          {isClosed && !isRegistered && (
            <p className="mt-1.5 text-center text-xs text-gray-400">Registration is closed</p>
          )}
        </div>

        {price > 0 && (
          <p className="mt-2 text-sm font-semibold text-brand">{formatCurrency(price)}</p>
        )}
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <hr className="my-8 border-gray-200" />
      </div>

      {/* Poster (optional, shown above tabs if set) */}
      {program.posterUrl && (
        <div className="mx-auto max-w-5xl px-4 pb-8 sm:px-6">
          <div className="relative overflow-hidden rounded-xl border border-gray-100 shadow-sm bg-white">
            <Image
              src={program.posterUrl}
              alt={`${program.title} poster`}
              width={1200}
              height={630}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="h-auto w-full"
              unoptimized={program.posterUrl.startsWith("/content/")}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <ProgramDetailTabs
          description={program.description}
          detailsTable={detailsTable}
          units={units}
          events={events}
        />
      </div>
    </div>
  );
}
