"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertActor } from "@/lib/auth-server";

export type InstructorCredentialInput = {
  title: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
  fileUrl?: string;
};

async function revalidateCredentialPaths(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId }, select: { username: true } });
  revalidatePath("/instructor/settings/credentials");
  if (user) revalidatePath(`/profile/${user.username}`);
}

export async function getInstructorCredentials(userId: string) {
  await assertActor(userId);
  return db.instructorCredential.findMany({
    where: { userId },
    orderBy: { orderIndex: "asc" },
  });
}

export async function addCredential(userId: string, input: InstructorCredentialInput) {
  await assertActor(userId);

  const title = input.title.trim();
  if (!title) return { error: "Certification title is required." };

  const count = await db.instructorCredential.count({ where: { userId } });

  await db.instructorCredential.create({
    data: {
      userId,
      title,
      issuer: input.issuer?.trim() || null,
      issueDate: input.issueDate ? new Date(input.issueDate) : null,
      credentialUrl: input.credentialUrl?.trim() || null,
      fileUrl: input.fileUrl?.trim() || null,
      orderIndex: count,
    },
  });

  await revalidateCredentialPaths(userId);
  return { success: true };
}

export async function updateCredential(
  userId: string,
  credentialId: string,
  input: InstructorCredentialInput
) {
  await assertActor(userId);

  const title = input.title.trim();
  if (!title) return { error: "Certification title is required." };

  const existing = await db.instructorCredential.findUnique({ where: { id: credentialId } });
  if (!existing || existing.userId !== userId) return { error: "Certification not found." };

  await db.instructorCredential.update({
    where: { id: credentialId },
    data: {
      title,
      issuer: input.issuer?.trim() || null,
      issueDate: input.issueDate ? new Date(input.issueDate) : null,
      credentialUrl: input.credentialUrl?.trim() || null,
      fileUrl: input.fileUrl?.trim() || null,
    },
  });

  await revalidateCredentialPaths(userId);
  return { success: true };
}

export async function deleteCredential(userId: string, credentialId: string) {
  await assertActor(userId);

  const existing = await db.instructorCredential.findUnique({ where: { id: credentialId } });
  if (!existing || existing.userId !== userId) return { error: "Certification not found." };

  await db.instructorCredential.delete({ where: { id: credentialId } });

  await revalidateCredentialPaths(userId);
  return { success: true };
}
