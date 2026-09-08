/**
 * Certificate server actions — Phase 2
 */
"use server";

import { readFile } from "fs/promises";
import path from "path";
import { PDFDocument } from "pdf-lib";
import { db } from "@/lib/db";
import { assertActor, requireInstructor } from "@/lib/auth-server";
import type { ActionResult } from "./courses";

const TEMPLATE_FIELD_NAMES = [
  "student_name",
  "course_title",
  "instructor_name",
  "issue_date",
  "verify_code",
  "duration_hours",
];

// ─── Issue a certificate (called after course completion) ─────────────────────

export async function issueCertificate(
  userId: string,
  courseId: string
): Promise<ActionResult<{ verifyCode: string }>> {
  await assertActor(userId);

  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { enableCert: true },
  });

  if (!course?.enableCert) {
    return { success: false, error: "This course does not offer a certificate." };
  }

  const cert = await db.certificate.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: { userId, courseId },
    update: {},
  });

  return { success: true, data: { verifyCode: cert.verifyCode } };
}

// ─── Get all certificates for a user ─────────────────────────────────────────

export async function getMyCertificates(userId: string) {
  await assertActor(userId);

  return db.certificate.findMany({
    where: { userId },
    orderBy: { issuedAt: "desc" },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          slug: true,
          thumbnailUrl: true,
          instructor: { select: { fullName: true } },
        },
      },
    },
  });
}

// ─── Verify certificate by code (public) ─────────────────────────────────────

export async function verifyCertificate(verifyCode: string) {
  return db.certificate.findUnique({
    where: { verifyCode },
    include: {
      user: { select: { fullName: true, username: true, avatarUrl: true } },
      course: {
        select: {
          title: true,
          slug: true,
          thumbnailUrl: true,
          durationHours: true,
          instructor: { select: { fullName: true } },
        },
      },
    },
  });
}

// ─── Certificate template management (instructor / admin) ────────────────────

export async function saveCertificateTemplate(
  courseId: string,
  filePath: string
): Promise<ActionResult<{ id: string; warning?: string }>> {
  const { user } = await requireInstructor();
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return { success: false, error: "Course not found." };
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  // Verify the uploaded file actually reads back as a valid PDF before
  // saving the reference — otherwise a lost/corrupt upload (e.g. a storage
  // hiccup) silently looks "saved" and every certificate download quietly
  // falls back to the default design with no error anywhere.
  let warning: string | undefined;
  try {
    const absPath = path.join(process.cwd(), "public", filePath);
    const bytes = await readFile(absPath);
    const pdfDoc = await PDFDocument.load(bytes);
    const fieldNames = new Set(pdfDoc.getForm().getFields().map((f) => f.getName()));
    const missing = TEMPLATE_FIELD_NAMES.filter((n) => !fieldNames.has(n));
    if (missing.length === TEMPLATE_FIELD_NAMES.length) {
      warning =
        "This PDF has no fillable form fields, so certificates will be issued blank. Add text form fields named " +
        TEMPLATE_FIELD_NAMES.join(", ") +
        " in your PDF editor.";
    } else if (missing.length > 0) {
      warning = `This PDF is missing these form fields, which will be left blank on certificates: ${missing.join(", ")}.`;
    }
  } catch {
    return {
      success: false,
      error: "Could not read the uploaded file as a valid PDF. Please try uploading it again.",
    };
  }

  const tpl = await db.certificateTemplate.upsert({
    where: { courseId },
    create: { courseId, filePath },
    update: { filePath },
  });
  return { success: true, data: { id: tpl.id, warning } };
}

export async function getCertificateTemplate(courseId: string) {
  return db.certificateTemplate.findUnique({ where: { courseId } });
}

export async function deleteCertificateTemplate(courseId: string): Promise<ActionResult> {
  const { user } = await requireInstructor();
  const course = await db.course.findUnique({
    where: { id: courseId },
    select: { instructorId: true },
  });
  if (!course) return { success: false, error: "Course not found." };
  if (course.instructorId !== user.id && user.role !== "ADMIN") {
    return { success: false, error: "Forbidden" };
  }

  await db.certificateTemplate.deleteMany({ where: { courseId } });
  return { success: true, data: undefined };
}
