"use client";

/**
 * /checkout — Payment page
 * Mobile money: USSD push via ClickPesa → polls for confirmation.
 * Card: ClickPesa hosted checkout link → webhook confirms → polling detects completion.
 */

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Phone,
  CreditCard,
  CheckCircle2,
  Loader2,
  Lock,
  ChevronRight,
  BookOpen,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UjuziLoader } from "@/components/ui/UjuziLoader";
import { Input } from "@/components/ui/input";
import { Divider } from "@/components/ui/divider";
import { FormAlert } from "@/components/ui/form-alert";
import { EmptyState } from "@/components/shared/EmptyState";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { OrderSummaryPanel, SummaryRow } from "@/components/shared/OrderSummaryPanel";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, cartItemKey } from "@/store/cartStore";
import { createOrder, confirmPayment } from "@/lib/actions/orders";
import { cn } from "@/lib/utils";

const MOBILE_METHODS = [
  { id: "MPESA", label: "M-Pesa", logo: "🔴", hint: "Vodacom M-Pesa" },
  { id: "AIRTEL_MONEY", label: "Airtel Money", logo: "🔵", hint: "Airtel Money Tanzania" },
  { id: "TIGO_PESA", label: "Tigo Pesa", logo: "🟡", hint: "MIC Tanzania" },
  { id: "HALOPESA", label: "HaloPesa", logo: "🟢", hint: "Halotel Tanzania" },
] as const;

/** How long to poll before giving up (ms) */
const POLL_TIMEOUT_MS = 3 * 60 * 1000;
/** Interval between each poll (ms) */
const POLL_INTERVAL_MS = 4_000;

type Step = "form" | "processing" | "card-redirect" | "done" | "error";

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, couponCode, subtotal, total, clearCart, courseIds, kitIds } = useCartStore();

  const [tab, setTab] = useState<"mobile" | "card">("mobile");
  const [method, setMethod] = useState("MPESA");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [step, setStep] = useState<Step>("form");
  const [statusMsg, setStatusMsg] = useState("");
  const [checkoutLink, setCheckoutLink] = useState("");

  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef(false);

  const sub = subtotal();
  const discount = sub - total();
  const tot = total();

  if (items.length === 0) {
    return (
      <div className="learner-canvas mx-auto max-w-xl px-4 py-12">
        <EmptyState
          icon={<ShoppingBag className="h-8 w-8 text-brand" />}
          title="Your cart is empty"
          description="Add courses or kits before checking out."
          actionLabel="Browse courses"
          actionHref="/courses"
        />
      </div>
    );
  }

  if (!session) {
    if (typeof window !== "undefined") router.replace(`/auth/login?callbackUrl=/checkout`);
    return null;
  }

  function validatePhone() {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 9) {
      setPhoneError("Enter a valid Tanzanian phone number.");
      return false;
    }
    setPhoneError("");
    return true;
  }

  function stopPolling() {
    abortRef.current = true;
    if (pollRef.current) clearTimeout(pollRef.current);
  }

  /** Poll /api/payments/clickpesa/status/{orderId} until confirmed, failed, or timeout */
  async function pollStatus(orderId: string, userId: string, paymentMethod: string) {
    const deadline = Date.now() + POLL_TIMEOUT_MS;
    abortRef.current = false;

    async function tick() {
      if (abortRef.current) return;

      if (Date.now() > deadline) {
        setStep("error");
        setStatusMsg(
          "Payment timed out. If you completed the payment, check your dashboard in a moment."
        );
        return;
      }

      try {
        const res = await fetch(`/api/payments/clickpesa/status/${orderId}`, {
          cache: "no-store",
        });
        const data: { status: string; paymentReference?: string; error?: string } =
          await res.json();

        if (data.status === "COMPLETED") {
          // Webhook already confirmed — go straight to success
          clearCart();
          setStep("done");
          setTimeout(() => router.replace(`/checkout/success/${orderId}`), 1200);
          return;
        }

        if (data.status === "SUCCESS" || data.status === "SETTLED") {
          setStatusMsg("Payment received! Enrolling you…");
          const ref = data.paymentReference ?? `CP-${orderId}`;
          const confirmRes = await confirmPayment(orderId, userId, paymentMethod, ref);
          if (!confirmRes.success) {
            // If already processed by webhook, still treat as success
            if (confirmRes.error?.includes("already processed") || confirmRes.error?.includes("current state")) {
              clearCart();
              setStep("done");
              setTimeout(() => router.replace(`/checkout/success/${orderId}`), 1200);
              return;
            }
            setStep("error");
            setStatusMsg(confirmRes.error ?? "Failed to confirm payment.");
            return;
          }
          clearCart();
          setStep("done");
          setTimeout(() => router.replace(`/checkout/success/${confirmRes.data.orderId}`), 1200);
          return;
        }

        if (data.status === "FAILED") {
          setStep("error");
          setStatusMsg("Payment was declined or failed. Please try again.");
          return;
        }

        // Still PENDING or PROCESSING — schedule next poll
        pollRef.current = setTimeout(tick, POLL_INTERVAL_MS);
      } catch {
        // Network hiccup — retry
        pollRef.current = setTimeout(tick, POLL_INTERVAL_MS);
      }
    }

    pollRef.current = setTimeout(tick, POLL_INTERVAL_MS);
  }

  async function handlePay() {
    const userId = session!.user.id;

    if (tab === "mobile" && !validatePhone()) return;

    setStep("processing");
    setStatusMsg(
      tab === "mobile"
        ? `Sending payment prompt to +255 ${phone}…`
        : "Generating secure checkout link…"
    );

    // Step 1: create order in DB
    const orderRes = await createOrder(
      userId,
      { courseIds: courseIds(), kitIds: kitIds() },
      couponCode ?? undefined
    );
    if (!orderRes.success) {
      setStep("error");
      setStatusMsg(orderRes.error);
      return;
    }

    const { orderId } = orderRes.data;

    // Step 2: initiate ClickPesa payment
    const initiateRes = await fetch("/api/payments/clickpesa/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId,
        method: tab === "mobile" ? method : "CARD",
        phoneNumber: tab === "mobile" ? `255${phone.replace(/\D/g, "")}` : undefined,
      }),
    });

    const initiateData = await initiateRes.json() as {
      type?: string;
      checkoutLink?: string;
      transactionId?: string;
      status?: string;
      error?: string;
    };

    if (!initiateRes.ok || initiateData.error) {
      setStep("error");
      setStatusMsg(initiateData.error ?? "Could not reach the payment gateway. Please retry.");
      return;
    }

    // Step 3a: card — open ClickPesa hosted checkout, then poll for webhook confirmation
    if (initiateData.type === "checkout" && initiateData.checkoutLink) {
      setCheckoutLink(initiateData.checkoutLink);
      setStep("card-redirect");
      // Open checkout in new tab
      window.open(initiateData.checkoutLink, "_blank", "noopener,noreferrer");
      // Begin polling — webhook will confirm and our poll will detect COMPLETED
      setStatusMsg("Waiting for payment confirmation…");
      pollStatus(orderId, userId, "CARD");
      return;
    }

    // Step 3b: mobile — USSD push sent, poll for response
    setStatusMsg(
      "Check your phone for the payment prompt and enter your PIN to confirm."
    );
    pollStatus(orderId, userId, method);
  }

  function handleRetry() {
    stopPolling();
    setStep("form");
    setStatusMsg("");
    setCheckoutLink("");
  }

  // ── Processing / card-redirect screen ─────────────────────────────────────
  if (step === "processing" || step === "card-redirect" || step === "done") {
    return (
      <div className="learner-canvas mx-auto max-w-md px-4 py-24 text-center animate-fade-in">
        {step === "done" ? (
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 ring-1 ring-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          </div>
        ) : (
          <UjuziLoader size="lg" className="mx-auto mb-4" />
        )}

        <p className="font-display text-lg font-semibold">
          {step === "done" ? "Payment confirmed!" : statusMsg}
        </p>

        {step === "done" && (
          <p className="mt-2 text-sm text-gray-500">Redirecting to your receipt…</p>
        )}

        {step === "card-redirect" && checkoutLink && (
          <div className="mt-6 space-y-3">
            <p className="text-sm text-gray-500">
              Complete your payment on the ClickPesa page that opened. This page will
              update automatically once confirmed.
            </p>
            <a
              href={checkoutLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-brand underline-offset-2 hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Re-open payment page
            </a>
          </div>
        )}

        {(step === "processing" || step === "card-redirect") && (
          <button
            onClick={handleRetry}
            className="mt-8 text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600"
          >
            Cancel and go back
          </button>
        )}
      </div>
    );
  }

  // ── Error screen ───────────────────────────────────────────────────────────
  if (step === "error") {
    return (
      <div className="learner-canvas mx-auto max-w-md px-4 py-24 text-center animate-fade-in">
        <FormAlert variant="error" className="mb-6 text-left">
          {statusMsg}
        </FormAlert>
        <Button onClick={handleRetry}>Try again</Button>
      </div>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <div className="learner-canvas mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/cart" className="font-medium transition hover:text-brand">
          Cart
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="font-semibold text-gray-900">Checkout</span>
      </nav>

      <LearnerPageHero
        banner="checkout"
        title="Secure checkout"
        subtitle="Pay with mobile money or card — powered by ClickPesa."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card padding="md">
            <h2 className="font-display text-lg font-semibold text-gray-900">Payment method</h2>

            {/* Tab switcher */}
            <div className="mb-6 mt-5 flex w-fit gap-1 rounded-2xl bg-gray-100 p-1">
              {(["mobile", "card"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all",
                    tab === t
                      ? "bg-brand text-white shadow-sm"
                      : "text-gray-500 hover:bg-white hover:text-gray-700"
                  )}
                >
                  {t === "mobile" ? (
                    <>
                      <Phone className="h-3.5 w-3.5" />
                      Mobile money
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-3.5 w-3.5" />
                      Card
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Mobile money */}
            {tab === "mobile" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {MOBILE_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-sm font-medium transition-all",
                        method === m.id
                          ? "border-brand bg-brand-light/60 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-soft"
                      )}
                    >
                      <span className="text-2xl">{m.logo}</span>
                      <span className={method === m.id ? "text-brand" : "text-gray-700"}>
                        {m.label}
                      </span>
                      <span className="text-[10px] text-gray-400">{m.hint}</span>
                    </button>
                  ))}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {MOBILE_METHODS.find((m) => m.id === method)?.label} phone number
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-gray-200 shadow-sm transition focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/15">
                    <span className="shrink-0 border-r border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
                      +255
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="7XX XXX XXX"
                      maxLength={9}
                      className="flex-1 px-3 py-2.5 text-sm focus:outline-none"
                    />
                  </div>
                  {phoneError && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">{phoneError}</p>
                  )}
                  <p className="mt-1.5 text-xs text-gray-500">
                    You will receive a payment prompt on your phone. Enter your PIN to confirm.
                  </p>
                </div>
              </div>
            )}

            {/* Card */}
            {tab === "card" && (
              <div className="space-y-4">
                <FormAlert variant="info">
                  You will be redirected to a secure ClickPesa page to enter your card details.
                  Return here once done — this page confirms automatically.
                </FormAlert>

                <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
                  <CreditCard className="h-4 w-4 shrink-0 text-gray-400" />
                  <span>Visa, Mastercard, American Express &amp; UnionPay accepted</span>
                </div>
              </div>
            )}

            <Divider className="my-6" />

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span>Payments are processed securely by ClickPesa — your details are encrypted.</span>
            </div>
          </Card>
        </div>

        <OrderSummaryPanel
          footer={
            <>
              <Button className="mt-5 w-full" size="lg" onClick={handlePay}>
                <Lock className="mr-2 h-4 w-4" />
                Pay {formatCurrency(tot)}
              </Button>
              <p className="mt-3 text-center text-xs text-gray-400">30-day money-back guarantee</p>
            </>
          }
        >
          <ul className="mb-4 space-y-3">
            {items.map((item) => (
              <li key={cartItemKey(item)} className="flex items-start gap-3">
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-100">
                  {item.thumbnailUrl ? (
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-4 w-4 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex flex-1 justify-between gap-2 text-sm">
                  <span className="line-clamp-2 text-gray-700">{item.title}</span>
                  <span className="shrink-0 font-medium tabular-nums">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <Divider />

          <div className="space-y-2 pt-2">
            <SummaryRow label="Subtotal" value={formatCurrency(sub)} />
            {discount > 0 && (
              <SummaryRow
                label={`Coupon (${couponCode})`}
                value={`− ${formatCurrency(discount)}`}
                className="text-green-600"
              />
            )}
            <SummaryRow label="Total" value={formatCurrency(tot)} emphasis />
          </div>
        </OrderSummaryPanel>
      </div>
    </div>
  );
}
