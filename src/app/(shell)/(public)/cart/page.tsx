"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, Tag, BookOpen, ArrowRight, ShoppingCart, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Divider } from "@/components/ui/divider";
import { EmptyState } from "@/components/shared/EmptyState";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { OrderSummaryPanel, SummaryRow } from "@/components/shared/OrderSummaryPanel";
import { formatCurrency } from "@/lib/utils";
import { useCartStore, cartItemKey } from "@/store/cartStore";

export default function CartPage() {
  const router = useRouter();
  const { items, couponCode, discountPercent, removeItem, applyCoupon, clearCart, subtotal, total } =
    useCartStore();

  const [couponInput, setCouponInput] = useState(couponCode ?? "");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState(!!couponCode);

  function handleApplyCoupon() {
    const ok = applyCoupon(couponInput);
    if (ok) {
      setCouponSuccess(true);
      setCouponError("");
    } else {
      setCouponSuccess(false);
      setCouponError("Invalid coupon code.");
    }
  }

  const sub = subtotal();
  const discount = sub - total();
  const tot = total();

  if (items.length === 0) {
    return (
      <div className="learner-canvas mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={<ShoppingCart className="h-8 w-8 text-brand" />}
          title="Your cart is empty"
          description="Browse courses or learning kits to add to your cart."
          actionLabel="Browse courses"
          actionHref="/courses"
        />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline">
            <Link href="/kits">Browse kits</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="learner-canvas mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <LearnerPageHero
        banner="cart"
        title={`Your cart (${items.length})`}
        subtitle="Review your items and proceed to secure checkout."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <Card key={cartItemKey(item)} hover padding="sm" className="flex gap-4">
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-100">
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    {item.kind === "kit" ? (
                      <Package className="h-6 w-6 text-gray-300" />
                    ) : (
                      <BookOpen className="h-6 w-6 text-gray-300" />
                    )}
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div>
                  <h3 className="line-clamp-2 font-semibold text-gray-900">{item.title}</h3>
                  <Badge variant="outline" size="sm" className="mt-1.5">
                    {item.kind === "kit" ? "Learning kit" : "Course"}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-brand">{formatCurrency(item.price)}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(cartItemKey(item))}
                    className="rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}

          <button
            type="button"
            onClick={clearCart}
            className="text-sm font-medium text-gray-400 transition hover:text-red-500"
          >
            Clear cart
          </button>
        </div>

        <OrderSummaryPanel
          footer={
            <>
              <Button className="mt-5 w-full" size="lg" onClick={() => router.push("/checkout")}>
                Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <div className="mt-3 flex justify-center gap-4 text-sm text-gray-400">
                <Link href="/courses" className="transition hover:text-brand">
                  Courses
                </Link>
                <Link href="/kits" className="transition hover:text-brand">
                  Kits
                </Link>
              </div>
            </>
          }
        >
          <div className="mb-4">
            <Input
              label="Coupon code"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponError("");
                setCouponSuccess(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              placeholder="e.g. UJUZI20"
              disabled={couponSuccess}
              error={couponError}
              hint={couponSuccess ? `${discountPercent}% discount applied!` : "Try UJUZI20 or UJUZI50"}
              leftIcon={<Tag className="h-4 w-4" />}
              rightIcon={
                couponSuccess ? (
                  <Badge variant="success" size="sm">
                    Applied
                  </Badge>
                ) : undefined
              }
            />
            {!couponSuccess && (
              <Button size="sm" variant="outline" className="mt-2 w-full" onClick={handleApplyCoupon}>
                Apply coupon
              </Button>
            )}
          </div>

          <Divider />

          <div className="space-y-2 pt-2">
            <SummaryRow label="Subtotal" value={formatCurrency(sub)} />
            {discount > 0 && (
              <SummaryRow
                label={`Discount (${discountPercent}%)`}
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
