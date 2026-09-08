/**
 * Program schedule — admin-managed workshop/session events for a Program.
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { ActionResult } from "./courses";
import { assertProgramManager } from "./program-units";
import type { ProgramEventType } from "@prisma/client";

export async function getProgramEvents(programSlug: string) {
  return db.programEvent.findMany({
    where: { program: { slug: programSlug } },
    orderBy: { startAt: "asc" },
  });
}

export async function getAdminProgramEvents(programId: string) {
  await assertProgramManager(programId);
  return db.programEvent.findMany({
    where: { programId },
    orderBy: { startAt: "asc" },
  });
}

export type ProgramEventInput = {
  title: string;
  type: ProgramEventType;
  startAt: string;
  endAt?: string;
  location?: string;
  agenda?: string;
};

export async function createProgramEvent(
  programId: string,
  input: ProgramEventInput
): Promise<ActionResult<{ id: string }>> {
  await assertProgramManager(programId);
  if (!input.title.trim()) return { success: false, error: "Title is required." };
  if (!input.startAt) return { success: false, error: "Start date/time is required." };

  const event = await db.programEvent.create({
    data: {
      programId,
      title: input.title.trim(),
      type: input.type,
      startAt: new Date(input.startAt),
      endAt: input.endAt ? new Date(input.endAt) : null,
      location: input.location?.trim() || null,
      agenda: input.agenda?.trim() || null,
    },
  });

  revalidatePath(`/admin/programs/${programId}/edit`);
  return { success: true, data: { id: event.id } };
}

export async function updateProgramEvent(
  eventId: string,
  input: ProgramEventInput
): Promise<ActionResult> {
  const existing = await db.programEvent.findUnique({ where: { id: eventId } });
  if (!existing) return { success: false, error: "Event not found." };
  await assertProgramManager(existing.programId);

  await db.programEvent.update({
    where: { id: eventId },
    data: {
      title: input.title.trim(),
      type: input.type,
      startAt: new Date(input.startAt),
      endAt: input.endAt ? new Date(input.endAt) : null,
      location: input.location?.trim() || null,
      agenda: input.agenda?.trim() || null,
    },
  });

  revalidatePath(`/admin/programs/${existing.programId}/edit`);
  return { success: true, data: undefined };
}

export async function deleteProgramEvent(eventId: string): Promise<ActionResult> {
  const existing = await db.programEvent.findUnique({ where: { id: eventId } });
  if (!existing) return { success: false, error: "Event not found." };
  await assertProgramManager(existing.programId);

  await db.programEvent.delete({ where: { id: eventId } });
  revalidatePath(`/admin/programs/${existing.programId}/edit`);
  return { success: true, data: undefined };
}
