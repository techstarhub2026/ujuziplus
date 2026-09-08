"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { savePayoutProfile, requestPayout } from "@/lib/actions/payouts";
import { useAppStore } from "@/store/appStore";
import type { PayoutMethod, PayoutStatus } from "@prisma/client";

type Profile = {
  preferredMethod: PayoutMethod;
  mpesaPhone: string | null;
  bankName: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankSwift: string | null;
} | null;

type Payout = {
  id: string;
  amount: number;
  method: PayoutMethod;
  status: PayoutStatus;
  createdAt: Date;
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "error" | "outline"> = {
  COMPLETED: "success",
  PENDING: "warning",
  PROCESSING: "warning",
  REJECTED: "error",
};

export function InstructorEarningsPanel({
  instructorId,
  profile,
  payouts,
  available,
  paidOut,
  pending,
}: {
  instructorId: string;
  profile: Profile;
  payouts: Payout[];
  available: number;
  paidOut: number;
  pending: number;
}) {
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();
  const [method, setMethod] = useState<PayoutMethod>(profile?.preferredMethod ?? "MPESA");
  const [mpesaPhone, setMpesaPhone] = useState(profile?.mpesaPhone ?? "");
  const [bankName, setBankName] = useState(profile?.bankName ?? "");
  const [bankAccountName, setBankAccountName] = useState(profile?.bankAccountName ?? "");
  const [bankAccountNumber, setBankAccountNumber] = useState(profile?.bankAccountNumber ?? "");
  const [bankSwift, setBankSwift] = useState(profile?.bankSwift ?? "");
  const [payoutAmount, setPayoutAmount] = useState("");

  function saveProfile() {
    startTransition(async () => {
      const res = await savePayoutProfile(instructorId, {
        preferredMethod: method,
        mpesaPhone,
        bankName,
        bankAccountName,
        bankAccountNumber,
        bankSwift,
      });
      if (res.success) showToast("Payout details saved", "success");
      else showToast(res.error ?? "Failed", "error");
    });
  }

  function submitPayout() {
    const amount = Number(payoutAmount.replace(/\D/g, ""));
    startTransition(async () => {
      const res = await requestPayout(instructorId, amount);
      if (res.success) {
        showToast("Payout request submitted", "success");
        setPayoutAmount("");
        window.location.reload();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-gray-500">Available to withdraw</p>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(available)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Pending payouts</p>
          <p className="text-2xl font-bold">{formatCurrency(pending)}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Paid out (all time)</p>
          <p className="text-2xl font-bold">{formatCurrency(paidOut)}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-semibold mb-4">Payout method</h3>
        <div className="flex gap-4 mb-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={method === "MPESA"}
              onChange={() => setMethod("MPESA")}
            />
            M-Pesa
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              checked={method === "BANK_TRANSFER"}
              onChange={() => setMethod("BANK_TRANSFER")}
            />
            Bank transfer
          </label>
        </div>

        {method === "MPESA" ? (
          <Input
            label="M-Pesa phone number"
            placeholder="255712345678"
            value={mpesaPhone}
            onChange={(e) => setMpesaPhone(e.target.value)}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <Input label="Bank name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <Input
              label="Account holder name"
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
            />
            <Input
              label="Account number"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
            />
            <Input
              label="SWIFT / BIC (optional)"
              value={bankSwift}
              onChange={(e) => setBankSwift(e.target.value)}
            />
          </div>
        )}

        <Button className="mt-4" variant="secondary" onClick={saveProfile} disabled={isPending}>
          Save payout details
        </Button>
      </Card>

      <Card className="p-6">
        <h3 className="font-semibold mb-2">Request payout</h3>
        <p className="text-xs text-gray-500 mb-4">
          Minimum TZS 10,000 · Platform fee 30% already deducted from available balance
        </p>
        <div className="flex flex-wrap gap-3 max-w-md">
          <Input
            label="Amount (TZS)"
            placeholder="500000"
            value={payoutAmount}
            onChange={(e) => setPayoutAmount(e.target.value)}
          />
          <div className="flex items-end">
            <Button onClick={submitPayout} disabled={isPending || !profile}>
              Request payout
            </Button>
          </div>
        </div>
        {!profile && (
          <p className="text-sm text-amber-700 mt-2">Save your payout method first.</p>
        )}
      </Card>

      {payouts.length > 0 && (
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Payout history</h3>
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500">
                <th className="pb-2">Date</th>
                <th className="pb-2">Amount</th>
                <th className="pb-2">Method</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-gray-50">
                  <td className="py-2 text-gray-500">{formatDate(p.createdAt)}</td>
                  <td className="py-2 font-medium">{formatCurrency(Number(p.amount))}</td>
                  <td className="py-2">{p.method === "MPESA" ? "M-Pesa" : "Bank"}</td>
                  <td className="py-2">
                    <Badge variant={STATUS_VARIANT[p.status] ?? "outline"} className="text-xs">
                      {p.status.toLowerCase()}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </Card>
      )}
    </div>
  );
}
