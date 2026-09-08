/**
 * Marketing pricing plans (display only — not connected to billing)
 */
"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "./courses";
import { requireAdmin } from "@/lib/auth-server";

const getActivePricingPlansCached = unstable_cache(
  async () =>
    db.pricingPlan.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ["active-pricing-plans"],
  { revalidate: 300, tags: ["active-pricing-plans"] }
);

export async function getActivePricingPlans() {
  return getActivePricingPlansCached();
}

export async function getAdminPricingPlans() {
  await requireAdmin();
  return db.pricingPlan.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function adminUpsertPricingPlan(input: {
  id?: string;
  slug: string;
  name: string;
  price: number;
  period?: string;
  features: string[];
  isPopular?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
}): Promise<ActionResult> {
  await requireAdmin();

  const data = {
    slug: input.slug.trim(),
    name: input.name.trim(),
    price: input.price,
    period: input.period?.trim() || null,
    features: input.features,
    isPopular: input.isPopular ?? false,
    sortOrder: input.sortOrder ?? 0,
    isActive: input.isActive ?? true,
    ctaLabel: input.ctaLabel?.trim() || "Get started",
    ctaHref: input.ctaHref?.trim() || null,
  };

  if (input.id) {
    await db.pricingPlan.update({ where: { id: input.id }, data });
  } else {
    await db.pricingPlan.create({ data });
  }

  revalidatePath("/admin/content");
  revalidatePath("/pricing");
  revalidateTag("active-pricing-plans");
  return { success: true, data: undefined };
}
