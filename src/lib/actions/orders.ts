/**
 * Order & payment server actions — courses and learning kits
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertActor } from "@/lib/auth-server";
import type { ActionResult } from "./courses";
import { validateCoupon } from "@/lib/coupons";
import { processPaymentConfirmation } from "@/lib/payment-confirmation";

export async function createOrder(
  userId: string,
  input: { courseIds: string[]; kitIds: string[] },
  couponCode?: string
): Promise<ActionResult<{ orderId: string; total: number }>> {
  await assertActor(userId);

  const courseIds = Array.from(new Set(input.courseIds));
  const kitIds = Array.from(new Set(input.kitIds));

  if (courseIds.length === 0 && kitIds.length === 0) {
    return { success: false, error: "Cart is empty." };
  }

  const lineItems: { courseId?: string; kitId?: string; price: number }[] = [];

  if (courseIds.length > 0) {
    const courses = await db.course.findMany({
      where: { id: { in: courseIds }, status: "PUBLISHED", isFree: false },
    });
    const existing = await db.enrollment.findMany({
      where: { userId, courseId: { in: courses.map((c) => c.id) } },
    });
    const ownedIds = new Set(existing.map((e) => e.courseId));
    for (const c of courses.filter((c) => !ownedIds.has(c.id))) {
      lineItems.push({
        courseId: c.id,
        price: Number(c.discountPrice ?? c.price ?? 0),
      });
    }
  }

  if (kitIds.length > 0) {
    const kits = await db.kit.findMany({
      where: { id: { in: kitIds }, status: "PUBLISHED", isFree: false },
    });
    const owned = await db.kitPurchase.findMany({
      where: { userId, kitId: { in: kits.map((k) => k.id) } },
    });
    const ownedKitIds = new Set(owned.map((p) => p.kitId));
    for (const k of kits.filter((k) => !ownedKitIds.has(k.id))) {
      if (k.inventoryCount > 0) {
        lineItems.push({ kitId: k.id, price: Number(k.price ?? 0) });
      }
    }
  }

  if (lineItems.length === 0) {
    return { success: false, error: "No purchasable items in your cart." };
  }

  const subtotal = lineItems.reduce((sum, li) => sum + li.price, 0);

  let discountAmount = 0;
  let validCoupon: string | null = null;
  if (couponCode) {
    const { valid, discountPercent } = validateCoupon(couponCode);
    if (valid) {
      discountAmount = Math.round((subtotal * discountPercent) / 100);
      validCoupon = couponCode.toUpperCase();
    }
  }

  const total = Math.max(0, subtotal - discountAmount);

  const order = await db.order.create({
    data: {
      userId,
      status: "PENDING",
      subtotal,
      discountAmount,
      total,
      couponCode: validCoupon,
      items: {
        create: lineItems.map((li) => ({
          courseId: li.courseId ?? null,
          kitId: li.kitId ?? null,
          price: li.price,
        })),
      },
    },
  });

  return { success: true, data: { orderId: order.id, total } };
}

export async function confirmPayment(
  orderId: string,
  userId: string,
  method: string,
  paymentRef?: string
): Promise<ActionResult<{ orderId: string }>> {
  await assertActor(userId);

  const ref = paymentRef ?? `SANDBOX-${Date.now()}`;
  const result = await processPaymentConfirmation(orderId, userId, method, ref);

  if (!result.success) return { success: false, error: result.error! };
  return { success: true, data: { orderId } };
}

export async function claimFreeKit(
  userId: string,
  kitSlug: string
): Promise<ActionResult> {
  await assertActor(userId);

  const kit = await db.kit.findFirst({
    where: { slug: kitSlug, status: "PUBLISHED", isFree: true },
  });
  if (!kit) return { success: false, error: "This kit is not available for free claim." };

  const existing = await db.kitPurchase.findUnique({
    where: { userId_kitId: { userId, kitId: kit.id } },
  });
  if (existing) return { success: false, error: "You already own this kit." };

  await db.kitPurchase.create({ data: { userId, kitId: kit.id } });
  revalidatePath(`/kits/${kitSlug}`);
  revalidatePath("/dashboard/my-kits");
  return { success: true, data: undefined };
}

export async function userOwnsKit(userId: string, kitId: string): Promise<boolean> {
  const { getAuthSession } = await import("@/lib/auth-server");
  const session = await getAuthSession();
  if (!session?.user?.id) return false;
  if (session.user.id !== userId && session.user.role !== "ADMIN") return false;

  const p = await db.kitPurchase.findUnique({
    where: { userId_kitId: { userId, kitId } },
  });
  return !!p;
}

export async function getOrder(orderId: string, userId: string) {
  await assertActor(userId);

  return db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          course: {
            select: {
              id: true,
              slug: true,
              title: true,
              thumbnailUrl: true,
              instructor: { select: { fullName: true } },
            },
          },
          kit: {
            select: { id: true, slug: true, title: true, thumbnailUrl: true },
          },
        },
      },
    },
  });
}

export async function getOrderHistory(userId: string) {
  await assertActor(userId);

  return db.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          course: { select: { title: true, slug: true } },
          kit: { select: { title: true, slug: true } },
        },
      },
    },
  });
}
