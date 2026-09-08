"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { registerForProgram } from "@/lib/actions/programs";
import { useAppStore } from "@/store/appStore";

export function ProgramRegisterButton({
  userId,
  programSlug,
  programId,
  price = 0,
  isRegistered,
  isFull,
}: {
  userId: string;
  programSlug: string;
  programId?: string;
  price?: number;
  isRegistered: boolean;
  isFull: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();

  if (isRegistered) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium w-full justify-center">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        You&apos;re registered
      </div>
    );
  }

  if (isFull) {
    return (
      <Button size="lg" className="w-full" disabled>
        No seats available
      </Button>
    );
  }

  const isPaid = price > 0;

  const handleRegister = () => {
    startTransition(async () => {
      const res = await registerForProgram(userId, programSlug);
      if (!res.success) {
        showToast(res.error ?? "Registration failed", "error");
        return;
      }
      if (res.data && "requiresPayment" in res.data && res.data.requiresPayment) {
        // Redirect to checkout for paid programs
        router.push(`/checkout?orderId=${res.data.orderId}`);
      } else {
        showToast("Registered successfully! Check your email for confirmation.", "success");
        router.refresh();
      }
    });
  };

  return (
    <Button
      size="lg"
      className="w-full"
      disabled={isPending}
      onClick={handleRegister}
    >
      {isPending ? (
        "Processing…"
      ) : isPaid ? (
        <>
          <CreditCard className="h-4 w-4 mr-2" />
          Register & Pay
        </>
      ) : (
        "Register Now — Free"
      )}
    </Button>
  );
}
