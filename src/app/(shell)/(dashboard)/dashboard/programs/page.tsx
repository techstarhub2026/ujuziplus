import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { PageHeader } from "@/components/shared/PageHeader";
import { getPrograms, getUserProgramRegistrations } from "@/lib/actions/programs";
import { formatCurrency } from "@/lib/utils";
import { ProgramRegisterButton } from "@/components/programs/ProgramRegisterButton";
import { getAuthSession } from "@/lib/auth-server";

const FORMAT_LABEL: Record<string, string> = {
  ONLINE: "Online",
  IN_PERSON: "In-person",
  HYBRID: "Hybrid",
};

export default async function DashboardProgramsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const [programs, registered] = await Promise.all([
    getPrograms(),
    getUserProgramRegistrations(session.user.id),
  ]);

  return (
    <div>
      <PageHeader title="Programs & Bootcamps" description="Intensive learning paths and initiatives" />
      {programs.length === 0 ? (
        <Card className="py-12 text-center text-sm text-gray-400">
          No programs are open right now. Check back soon.
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => {
            const isRegistered = registered.includes(p.slug);
            const isFull = p.enrolledCount >= p.seats;
            const pct = p.seats > 0 ? Math.round((p.enrolledCount / p.seats) * 100) : 0;
            return (
              <Card key={p.id} hover>
                <Badge variant="outline">{p.type}</Badge>
                <h3 className="mt-2 font-semibold">{p.title}</h3>
                <p className="text-sm text-gray-500">
                  {p.startDate ? new Date(p.startDate).toLocaleDateString("en-TZ") : "TBD"}
                  {p.endDate ? ` — ${new Date(p.endDate).toLocaleDateString("en-TZ")}` : ""}
                  {" · "}
                  {FORMAT_LABEL[p.format] ?? p.format}
                </p>
                <ProgressBar value={pct} showLabel className="mt-4" />
                <p className="mt-1 text-xs text-gray-500">
                  {p.enrolledCount}/{p.seats} seats
                </p>
                <p className="mt-2 font-bold text-brand">
                  {Number(p.price) === 0 ? "Free" : formatCurrency(Number(p.price))}
                </p>
                <div className="mt-4 flex gap-2">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/programs/${p.slug}`}>Details</Link>
                  </Button>
                  <ProgramRegisterButton
                    userId={session.user.id}
                    programSlug={p.slug}
                    isRegistered={isRegistered}
                    isFull={isFull}
                  />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
