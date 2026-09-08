/**
 * Instructor payout profile & withdrawal requests
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PayoutMethod } from "@prisma/client";
import type { ActionResult } from "./courses";
import { requireInstructor, assertSelfOrAdmin } from "@/lib/auth-server";

const INSTRUCTOR_SHARE = 0.7;
const MIN_PAYOUT = 10_000; // TZS

export async function getPayoutProfile(instructorId: string) {
  const { user } = await requireInstructor();
  assertSelfOrAdmin(user.id, instructorId, user.role);

  const [profile, payouts, orderItems] = await Promise.all([
    db.instructorPayoutProfile.findUnique({ where: { userId: instructorId } }),
    db.instructorPayout.findMany({
      where: { instructorId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.orderItem.findMany({
      where: {
        course: { instructorId },
        order: { status: "COMPLETED" },
      },
      select: { price: true },
    }),
  ]);

  const totalNet =
    orderItems.reduce((s, i) => s + Number(i.price), 0) * INSTRUCTOR_SHARE;
  const paidOut = payouts
    .filter((p) => p.status === "COMPLETED")
    .reduce((s, p) => s + Number(p.amount), 0);
  const pending = payouts
    .filter((p) => p.status === "PENDING" || p.status === "PROCESSING")
    .reduce((s, p) => s + Number(p.amount), 0);
  const available = Math.max(0, totalNet - paidOut - pending);

  return { profile, payouts, totalNet, paidOut, pending, available };
}

export async function savePayoutProfile(
  instructorId: string,
  data: {
    preferredMethod: PayoutMethod;
    mpesaPhone?: string;
    bankName?: string;
    bankAccountName?: string;
    bankAccountNumber?: string;
    bankSwift?: string;
  }
): Promise<ActionResult> {
  const { user } = await requireInstructor();
  assertSelfOrAdmin(user.id, instructorId, user.role);

  if (data.preferredMethod === "MPESA" && !data.mpesaPhone?.trim()) {
    return { success: false, error: "M-Pesa phone number is required." };
  }
  if (data.preferredMethod === "BANK_TRANSFER") {
    if (!data.bankName?.trim() || !data.bankAccountName?.trim() || !data.bankAccountNumber?.trim()) {
      return { success: false, error: "Bank name, account name, and account number are required." };
    }
  }

  await db.instructorPayoutProfile.upsert({
    where: { userId: instructorId },
    create: {
      userId: instructorId,
      preferredMethod: data.preferredMethod,
      mpesaPhone: data.mpesaPhone?.trim() ?? null,
      bankName: data.bankName?.trim() ?? null,
      bankAccountName: data.bankAccountName?.trim() ?? null,
      bankAccountNumber: data.bankAccountNumber?.trim() ?? null,
      bankSwift: data.bankSwift?.trim() ?? null,
    },
    update: {
      preferredMethod: data.preferredMethod,
      mpesaPhone: data.mpesaPhone?.trim() ?? null,
      bankName: data.bankName?.trim() ?? null,
      bankAccountName: data.bankAccountName?.trim() ?? null,
      bankAccountNumber: data.bankAccountNumber?.trim() ?? null,
      bankSwift: data.bankSwift?.trim() ?? null,
    },
  });

  revalidatePath("/instructor/earnings");
  return { success: true, data: undefined };
}

export async function requestPayout(
  instructorId: string,
  amount: number
): Promise<ActionResult> {
  const { user } = await requireInstructor();
  assertSelfOrAdmin(user.id, instructorId, user.role);

  const { profile, available } = await getPayoutProfile(instructorId);
  if (!profile) {
    return { success: false, error: "Set up your payout method first." };
  }
  if (amount < MIN_PAYOUT) {
    return { success: false, error: `Minimum payout is TZS ${MIN_PAYOUT.toLocaleString()}.` };
  }
  if (amount > available) {
    return { success: false, error: "Amount exceeds your available balance." };
  }

  await db.instructorPayout.create({
    data: {
      instructorId,
      amount,
      method: profile.preferredMethod,
      status: "PENDING",
    },
  });

  revalidatePath("/instructor/earnings");
  return { success: true, data: undefined };
}
