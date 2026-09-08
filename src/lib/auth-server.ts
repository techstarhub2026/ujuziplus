/**
 * Server-side session helpers for pages and server actions.
 */
import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

/** Deduped per React request — avoids multiple session reads on one navigation. */
export const getAuthSession = cache(async () => getServerSession(authOptions));

/** Throws if not signed in or account suspended. Uses JWT session — no extra DB round-trip. */
export async function requireUser() {
  const session = await getAuthSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  if (session.user.isActive === false) throw new Error("Account suspended");

  return {
    session,
    user: {
      id: session.user.id,
      role: session.user.role,
      fullName: session.user.fullName,
      email: session.user.email ?? "",
      isActive: true,
    },
  };
}

/** Use when fresh DB verification is required (e.g. admin suspend check). */
export async function requireUserFromDb() {
  const session = await getAuthSession();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isActive: true, fullName: true, email: true },
  });
  if (!user?.isActive) throw new Error("Account suspended");

  return { session, user };
}

export async function requireInstructor() {
  const { session, user } = await requireUser();
  if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") throw new Error("Forbidden");
  return { session, user };
}

export async function requireAdmin() {
  const { session, user } = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "MODERATOR") throw new Error("Forbidden");
  return { session, user };
}

export function assertSelfOrAdmin(actorId: string, targetId: string, role: Role) {
  if (actorId !== targetId && role !== "ADMIN") throw new Error("Forbidden");
}

export async function assertActor(userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);
  return user;
}
