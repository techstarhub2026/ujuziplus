/**
 * Course wishlist — persisted per user
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "./courses";
import { requireUser, assertSelfOrAdmin } from "@/lib/auth-server";

export async function getWishlist(userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  return db.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      course: {
        include: {
          instructor: { select: { fullName: true, avatarUrl: true, username: true } },
        },
      },
    },
  });
}

export async function toggleWishlist(
  userId: string,
  courseId: string
): Promise<ActionResult<{ added: boolean }>> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const existing = await db.wishlistItem.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });

  if (existing) {
    await db.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/dashboard/wishlist");
    return { success: true, data: { added: false } };
  }

  const course = await db.course.findFirst({
    where: { id: courseId, status: "PUBLISHED" },
    select: { id: true },
  });
  if (!course) return { success: false, error: "Course not available." };

  await db.wishlistItem.create({ data: { userId, courseId } });
  revalidatePath("/dashboard/wishlist");
  return { success: true, data: { added: true } };
}

export async function isCourseWishlisted(userId: string, courseId: string) {
  const item = await db.wishlistItem.findUnique({
    where: { userId_courseId: { userId, courseId } },
  });
  return !!item;
}

export async function removeFromWishlist(
  userId: string,
  courseId: string
): Promise<ActionResult> {
  return toggleWishlist(userId, courseId).then((r) =>
    r.success ? { success: true, data: undefined } : r
  );
}
