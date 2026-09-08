/**
 * GET /api/certificate/[verifyCode]
 * Generates and streams a PDF certificate.
 *
 * Strategy:
 *  1. If the course has a custom PDF template (AcroForm fields), fill it.
 *  2. Otherwise generate a clean, styled certificate from scratch.
 *
 * Expected AcroForm field names in uploaded templates:
 *   student_name, course_title, instructor_name, issue_date,
 *   verify_code, duration_hours
 */

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { readFile } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const BRAND = rgb(0.957, 0.420, 0.071); // #F46B12 orange

function hex(h: string) {
  const n = parseInt(h.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const GOLD = hex("#D4AF37");
const DARK = hex("#1a1a2e");

// ─── Handler ─────────────────────────────────────────────────────────────────

export async function GET(
  _req: NextRequest,
  { params }: { params: { verifyCode: string } }
) {
  const cert = await db.certificate.findUnique({
    where: { verifyCode: params.verifyCode },
    include: {
      user: { select: { fullName: true, username: true } },
      course: {
        select: {
          title: true,
          durationHours: true,
          certTemplate: { select: { filePath: true } },
          instructor: { select: { fullName: true } },
        },
      },
    },
  });

  if (!cert) {
    return new NextResponse("Certificate not found", { status: 404 });
  }

  const fields = {
    student_name: cert.user.fullName,
    course_title: cert.course.title,
    instructor_name: cert.course.instructor.fullName,
    issue_date: formatDate(cert.issuedAt),
    verify_code: params.verifyCode.slice(-12).toUpperCase(),
    duration_hours:
      cert.course.durationHours > 0 ? `${cert.course.durationHours} hours` : "",
  };

  let pdfBytes: Uint8Array;

  try {
    // ── Try template first ──────────────────────────────────────────────────

    const templatePath = cert.course.certTemplate?.filePath;
    if (templatePath) {
      try {
        const absPath = path.join(process.cwd(), "public", templatePath);
        const templateBytes = await readFile(absPath);
        const pdfDoc = await PDFDocument.load(templateBytes);

        const form = pdfDoc.getForm();
        for (const [name, value] of Object.entries(fields)) {
          try {
            const field = form.getTextField(name);
            field.setText(value);
            field.enableReadOnly();
          } catch {
            // field not present in this template — skip
          }
        }
        form.flatten();
        pdfBytes = await pdfDoc.save();
      } catch (templateErr) {
        // Falling back silently here means a missing/corrupt template file
        // (or one with no fillable form) always looks identical to "no
        // template uploaded" from the outside — log which one it actually
        // was so this is diagnosable instead of a silent downgrade.
        console.error(
          `Certificate template for course "${cert.course.title}" failed to render (path: ${templatePath}), falling back to default:`,
          templateErr
        );
        pdfBytes = await generateDefault(fields, params.verifyCode);
      }
    } else {
      pdfBytes = await generateDefault(fields, params.verifyCode);
    }
  } catch (err) {
    console.error("Certificate PDF generation failed:", err);
    return new NextResponse("Could not generate certificate PDF. Please try again or contact support.", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new NextResponse(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="certificate-${params.verifyCode.slice(-8)}.pdf"`,
    },
  });
}

// ─── Default PDF generator ────────────────────────────────────────────────────

async function generateDefault(
  fields: Record<string, string>,
  verifyCode: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  // A4 landscape
  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const timesItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);

  // ── Background ─────────────────────────────────────────────────────────────

  // Cream background
  page.drawRectangle({
    x: 0, y: 0, width, height,
    color: hex("#FDFAF4"),
  });

  // Decorative border (double line)
  const m = 24;
  page.drawRectangle({ x: m, y: m, width: width - m * 2, height: height - m * 2,
    borderColor: GOLD, borderWidth: 2, color: undefined as unknown as ReturnType<typeof rgb> });
  page.drawRectangle({ x: m + 6, y: m + 6, width: width - (m + 6) * 2, height: height - (m + 6) * 2,
    borderColor: GOLD, borderWidth: 0.5, color: undefined as unknown as ReturnType<typeof rgb> });

  // Orange header bar
  page.drawRectangle({ x: m, y: height - m - 70, width: width - m * 2, height: 70, color: BRAND });

  // ── Header text ────────────────────────────────────────────────────────────

  page.drawText("UjuziLab", {
    x: width / 2 - helveticaBold.widthOfTextAtSize("UjuziLab", 26) / 2,
    y: height - m - 42,
    size: 26, font: helveticaBold, color: rgb(1, 1, 1),
  });
  page.drawText("CERTIFICATE OF COMPLETION", {
    x: width / 2 - helvetica.widthOfTextAtSize("CERTIFICATE OF COMPLETION", 10) / 2,
    y: height - m - 58,
    size: 10, font: helvetica, color: rgb(0.95, 0.95, 0.95),
  });

  // ── Body ───────────────────────────────────────────────────────────────────

  const bodyTop = height - m - 70 - 30;

  page.drawText("This is to certify that", {
    x: width / 2 - helvetica.widthOfTextAtSize("This is to certify that", 11) / 2,
    y: bodyTop,
    size: 11, font: helvetica, color: hex("#555555"),
  });

  // Recipient name (large)
  const nameSize = Math.min(36, 36 * (26 / Math.max(fields.student_name.length, 1)));
  const clampedNameSize = Math.max(22, Math.min(36, nameSize));
  page.drawText(fields.student_name, {
    x: width / 2 - helveticaBold.widthOfTextAtSize(fields.student_name, clampedNameSize) / 2,
    y: bodyTop - 42,
    size: clampedNameSize, font: helveticaBold, color: DARK,
  });

  // Underline
  const nameWidth = helveticaBold.widthOfTextAtSize(fields.student_name, clampedNameSize);
  page.drawLine({
    start: { x: width / 2 - nameWidth / 2, y: bodyTop - 46 },
    end: { x: width / 2 + nameWidth / 2, y: bodyTop - 46 },
    thickness: 1.5, color: GOLD,
  });

  page.drawText("has successfully completed", {
    x: width / 2 - helvetica.widthOfTextAtSize("has successfully completed", 11) / 2,
    y: bodyTop - 68,
    size: 11, font: helvetica, color: hex("#555555"),
  });

  // Course title (italic)
  const ctSize = Math.max(16, Math.min(22, 22 * 20 / Math.max(fields.course_title.length, 10)));
  page.drawText(fields.course_title, {
    x: width / 2 - timesItalic.widthOfTextAtSize(fields.course_title, ctSize) / 2,
    y: bodyTop - 96,
    size: ctSize, font: timesItalic, color: BRAND,
  });

  if (fields.duration_hours) {
    page.drawText(`(${fields.duration_hours})`, {
      x: width / 2 - helvetica.widthOfTextAtSize(`(${fields.duration_hours})`, 10) / 2,
      y: bodyTop - 116,
      size: 10, font: helvetica, color: hex("#888888"),
    });
  }

  // ── Instructor & date row ──────────────────────────────────────────────────

  const rowY = m + 90;

  // Instructor signature section
  const sigX = width * 0.3;
  page.drawLine({
    start: { x: sigX - 70, y: rowY + 14 },
    end: { x: sigX + 70, y: rowY + 14 },
    thickness: 0.8, color: hex("#cccccc"),
  });
  page.drawText(fields.instructor_name, {
    x: sigX - helveticaBold.widthOfTextAtSize(fields.instructor_name, 10) / 2,
    y: rowY,
    size: 10, font: helveticaBold, color: DARK,
  });
  page.drawText("Instructor", {
    x: sigX - helvetica.widthOfTextAtSize("Instructor", 9) / 2,
    y: rowY - 13,
    size: 9, font: helvetica, color: hex("#888888"),
  });

  // Date section
  const dateX = width * 0.7;
  page.drawLine({
    start: { x: dateX - 70, y: rowY + 14 },
    end: { x: dateX + 70, y: rowY + 14 },
    thickness: 0.8, color: hex("#cccccc"),
  });
  page.drawText(fields.issue_date, {
    x: dateX - helveticaBold.widthOfTextAtSize(fields.issue_date, 10) / 2,
    y: rowY,
    size: 10, font: helveticaBold, color: DARK,
  });
  page.drawText("Date of issue", {
    x: dateX - helvetica.widthOfTextAtSize("Date of issue", 9) / 2,
    y: rowY - 13,
    size: 9, font: helvetica, color: hex("#888888"),
  });

  // ── Verify code footer ────────────────────────────────────────────────────

  const verifyText = `Verify at: ujuzilab.com/certificate/${verifyCode}   ·   Code: ${fields.verify_code}`;
  page.drawText(verifyText, {
    x: width / 2 - helvetica.widthOfTextAtSize(verifyText, 7.5) / 2,
    y: m + 10,
    size: 7.5, font: helvetica, color: hex("#aaaaaa"),
  });

  // Stamp circle (decorative) with a drawn checkmark — the ✓ glyph (U+2713)
  // isn't in the standard Helvetica font's WinAnsi encoding, so drawText()
  // with that character throws; draw two line segments instead.
  const stampX = width / 2;
  const stampY = m + 50;
  page.drawCircle({ x: stampX, y: stampY, size: 24, borderColor: BRAND, borderWidth: 2 });
  page.drawLine({
    start: { x: stampX - 8, y: stampY },
    end: { x: stampX - 2, y: stampY - 6 },
    thickness: 2.5, color: BRAND,
  });
  page.drawLine({
    start: { x: stampX - 2, y: stampY - 6 },
    end: { x: stampX + 9, y: stampY + 8 },
    thickness: 2.5, color: BRAND,
  });

  return pdfDoc.save();
}
