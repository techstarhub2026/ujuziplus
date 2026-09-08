/**
 * Chart data helpers — aggregate DB rows for Recharts
 */
"use server";

import { db } from "@/lib/db";
import { requireAdmin, requireInstructor, assertSelfOrAdmin } from "@/lib/auth-server";
import { subDays, format, startOfMonth, eachMonthOfInterval, subMonths } from "date-fns";

export type ChartPoint = { label: string; value: number };

/** Last 6 months revenue (platform or instructor net) */
export async function getRevenueChartData(instructorId?: string) {
  if (instructorId) {
    const { user } = await requireInstructor();
    assertSelfOrAdmin(user.id, instructorId, user.role);
  } else {
    await requireAdmin();
  }

  const since = subMonths(new Date(), 5);
  const months = eachMonthOfInterval({ start: startOfMonth(since), end: new Date() });

  const orderItems = await db.orderItem.findMany({
    where: {
      order: { status: "COMPLETED", createdAt: { gte: since } },
      courseId: { not: null },
      ...(instructorId ? { course: { instructorId } } : {}),
    },
    select: { price: true, order: { select: { createdAt: true } } },
  });

  const share = instructorId ? 0.7 : 1;
  const byMonth = new Map<string, number>();
  for (const m of months) {
    byMonth.set(format(m, "MMM yyyy"), 0);
  }
  for (const item of orderItems) {
    const key = format(item.order.createdAt, "MMM yyyy");
    if (byMonth.has(key)) {
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(item.price) * share);
    }
  }

  return Array.from(byMonth.entries()).map(([label, value]) => ({
    label,
    value: Math.round(value),
  }));
}

/** Daily enrollments last 30 days */
export async function getEnrollmentChartData(instructorId?: string) {
  if (instructorId) {
    const { user } = await requireInstructor();
    assertSelfOrAdmin(user.id, instructorId, user.role);
  } else {
    await requireAdmin();
  }

  const since = subDays(new Date(), 29);
  const enrollments = await db.enrollment.findMany({
    where: {
      enrolledAt: { gte: since },
      ...(instructorId ? { course: { instructorId } } : {}),
    },
    select: { enrolledAt: true },
  });

  const byDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = subDays(new Date(), 29 - i);
    byDay.set(format(d, "MMM d"), 0);
  }
  for (const e of enrollments) {
    const key = format(e.enrolledAt, "MMM d");
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  return Array.from(byDay.entries()).map(([label, value]) => ({ label, value }));
}

/** Last 6 months net revenue for a single course */
export async function getCourseRevenueChartData(
  instructorId: string,
  courseId: string
) {
  const { user } = await requireInstructor();
  assertSelfOrAdmin(user.id, instructorId, user.role);

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId },
    select: { id: true },
  });
  if (!course) return [];

  const since = subMonths(new Date(), 5);
  const months = eachMonthOfInterval({ start: startOfMonth(since), end: new Date() });

  const orderItems = await db.orderItem.findMany({
    where: {
      courseId,
      order: { status: "COMPLETED", createdAt: { gte: since } },
    },
    select: { price: true, order: { select: { createdAt: true } } },
  });

  const share = 0.7;
  const byMonth = new Map<string, number>();
  for (const m of months) byMonth.set(format(m, "MMM yyyy"), 0);
  for (const item of orderItems) {
    const key = format(item.order.createdAt, "MMM yyyy");
    if (byMonth.has(key)) {
      byMonth.set(key, (byMonth.get(key) ?? 0) + Number(item.price) * share);
    }
  }

  return Array.from(byMonth.entries()).map(([label, value]) => ({
    label,
    value: Math.round(value),
  }));
}

/** Daily enrollments for one course — last 30 days */
export async function getCourseEnrollmentChartData(courseId: string, instructorId: string) {
  const { user } = await requireInstructor();
  assertSelfOrAdmin(user.id, instructorId, user.role);

  const course = await db.course.findFirst({
    where: { id: courseId, instructorId },
    select: { id: true },
  });
  if (!course) return [];

  const since = subDays(new Date(), 29);
  const enrollments = await db.enrollment.findMany({
    where: { courseId, enrolledAt: { gte: since } },
    select: { enrolledAt: true },
  });

  const byDay = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const d = subDays(new Date(), 29 - i);
    byDay.set(format(d, "MMM d"), 0);
  }
  for (const e of enrollments) {
    const key = format(e.enrolledAt, "MMM d");
    if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }

  return Array.from(byDay.entries()).map(([label, value]) => ({ label, value }));
}
