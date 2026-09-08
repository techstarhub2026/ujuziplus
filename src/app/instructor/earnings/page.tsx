/**
 * Instructor earnings — real order data from DB
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import { DollarSign, TrendingUp, Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/PageHeader";
import { getInstructorEarnings } from "@/lib/actions/instructor";
import { getPayoutProfile } from "@/lib/actions/payouts";
import { formatCurrency, formatDate } from "@/lib/utils";
import { InstructorEarningsPanel } from "@/components/instructor/InstructorEarningsPanel";
import { serializePayout } from "@/lib/serialize";
import { getAuthSession } from "@/lib/auth-server";

const METHOD_LABEL: Record<string, string> = {
  MPESA: "M-Pesa", AIRTEL_MONEY: "Airtel Money",
  TIGO_PESA: "Tigo Pesa", HALOPESA: "HaloPesa",
  CARD: "Card", BANK_TRANSFER: "Bank",
};

export default async function InstructorEarningsPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const [{ transactions, totalGross, totalNet }, payoutData] = await Promise.all([
    getInstructorEarnings(session.user.id),
    getPayoutProfile(session.user.id),
  ]);

  const platformFee = totalGross - totalNet;

  return (
    <div>
      <PageHeader title="Earnings & Payouts" />

      <InstructorEarningsPanel
        instructorId={session.user.id}
        profile={payoutData.profile}
        payouts={payoutData.payouts.map(serializePayout)}
        available={payoutData.available}
        paidOut={payoutData.paidOut}
        pending={payoutData.pending}
      />

      <Card className="mt-8">
        <h3 className="font-semibold mb-4">Transaction history</h3>
        {transactions.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">
            No sales yet.{" "}
            <Link href="/instructor/courses" className="text-brand underline">
              Publish a course
            </Link>{" "}
            to start earning.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Course</th>
                  <th className="pb-3 pr-4 font-medium">Method</th>
                  <th className="pb-3 pr-4 font-medium">Gross</th>
                  <th className="pb-3 font-medium text-green-600">Your cut (70%)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                      {formatDate(t.date)}
                    </td>
                    <td className="py-3 pr-4">
                      <Link href={`/courses/${t.courseSlug}`} className="hover:text-brand">
                        {t.courseTitle}
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">
                      {t.method ? METHOD_LABEL[t.method] ?? t.method : "—"}
                    </td>
                    <td className="py-3 pr-4">{formatCurrency(t.gross)}</td>
                    <td className="py-3 font-medium text-green-600">
                      {formatCurrency(t.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
