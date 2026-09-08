"use client";

import { PricingCard } from "@/components/shared/PricingCard";
import { MotionGrid } from "@/components/motion/RevealStagger";

export function PricingPlansGrid({
  plans,
}: {
  plans: {
    id: string;
    name: string;
    slug: string;
    price: number;
    period: string | null;
    features: unknown;
    ctaLabel: string;
    ctaHref: string | null;
    isPopular: boolean;
  }[];
}) {
  return (
    <MotionGrid className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {plans.map((plan) => {
        const features = (plan.features as string[]) ?? [];
        const price = Number(plan.price);
        return (
          <PricingCard
            key={plan.id}
            name={plan.name}
            price={price}
            period={plan.period ?? "month"}
            features={features}
            ctaLabel={plan.ctaLabel}
            ctaHref={
              plan.ctaHref ?? (plan.slug === "organization" ? "/contact" : "/auth/register")
            }
            isPopular={plan.isPopular}
          />
        );
      })}
    </MotionGrid>
  );
}
