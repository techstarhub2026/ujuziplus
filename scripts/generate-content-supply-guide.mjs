/**
 * Generates UjuziLab Content & Supply Guide PDF
 * Run: node scripts/generate-content-supply-guide.mjs
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

// ─── Brand palette (UjuziLab) ─────────────────────────────────────────────────
const C = {
  brand: rgb(0.953, 0.573, 0.137), // #f39223
  brandDark: rgb(0.851, 0.467, 0.071), // #d97706
  navy: rgb(0, 0, 0.302), // #00004d
  navySoft: rgb(0.2, 0.2, 0.45),
  gold: rgb(0.831, 0.686, 0.216),
  text: rgb(0.15, 0.15, 0.2),
  muted: rgb(0.45, 0.45, 0.5),
  line: rgb(0.88, 0.88, 0.9),
  white: rgb(1, 1, 1),
  cream: rgb(0.99, 0.98, 0.96),
  accentBg: rgb(1, 0.97, 0.93),
};

const PAGE = { w: 595.28, h: 841.89 }; // A4 portrait
const M = 48;
const CONTENT_W = PAGE.w - M * 2;

/** Standard PDF fonts only support WinAnsi; strip exotic Unicode. */
function ascii(text) {
  return String(text)
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u2192/g, ">")
    .replace(/\u00b7/g, " | ")
    .replace(/\u00d7/g, "x")
    .replace(/\u2713/g, "")
    .replace(/[^\x00-\xFF]/g, "");
}

function t(text) {
  return ascii(text);
}

function drawText(page, text, opts) {
  page.drawText(t(text), opts);
}

function wrapText(text, font, size, maxWidth) {
  const words = t(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) {
      line = test;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawBullets(page, items, x, y, font, fontBold, size, maxWidth, lineGap = 14) {
  let cy = y;
  for (const item of items) {
    const prefix = item.required ? "[R]" : "[O]";
    const label = item.required ? fontBold : font;
    page.drawText(t(prefix), { x, y: cy, size: size - 1, font: label, color: item.required ? C.brand : C.muted });
    const lines = wrapText(item.text, font, size, maxWidth - 28);
    lines.forEach((ln, i) => {
      page.drawText(t(ln), { x: x + 28, y: cy, size, font, color: C.text });
      if (i < lines.length - 1) cy -= lineGap;
    });
    cy -= lineGap + 2;
  }
  return cy;
}

function drawSectionHeader(page, title, y, fontBold) {
  page.drawRectangle({
    x: M,
    y: y - 6,
    width: CONTENT_W,
    height: 28,
    color: C.accentBg,
    borderColor: C.brand,
    borderWidth: 0,
  });
  page.drawRectangle({ x: M, y: y - 6, width: 4, height: 28, color: C.brand });
  drawText(page, title, { x: M + 12, y: y + 2, size: 13, font: fontBold, color: C.navy });
  return y - 36;
}

function drawFooter(page, pageNum, total, font) {
  page.drawLine({
    start: { x: M, y: 36 },
    end: { x: PAGE.w - M, y: 36 },
    thickness: 0.5,
    color: C.line,
  });
  drawText(page, "UjuziLab - Content & Supply Guide", {
    x: M,
    y: 22,
    size: 8,
    font,
    color: C.muted,
  });
  page.drawText(`Page ${pageNum} of ${total}`, {
    x: PAGE.w - M - font.widthOfTextAtSize(`Page ${pageNum} of ${total}`, 8),
    y: 22,
    size: 8,
    font,
    color: C.muted,
  });
}

function drawCover(page, fontBold, font, fontItalic) {
  page.drawRectangle({ x: 0, y: 0, width: PAGE.w, height: PAGE.h, color: C.cream });
  page.drawRectangle({ x: 0, y: PAGE.h - 200, width: PAGE.w, height: 200, color: C.navy });
  page.drawRectangle({ x: 0, y: PAGE.h - 204, width: PAGE.w, height: 4, color: C.brand });

  const title = "Content & Supply Guide";
  const titleW = fontBold.widthOfTextAtSize(title, 28);
  page.drawText(title, {
    x: (PAGE.w - titleW) / 2,
    y: PAGE.h - 120,
    size: 28,
    font: fontBold,
    color: C.white,
  });

  const sub = "Everything to create, upload & publish on UjuziLab";
  const subW = font.widthOfTextAtSize(sub, 12);
  page.drawText(sub, {
    x: (PAGE.w - subW) / 2,
    y: PAGE.h - 148,
    size: 12,
    font,
    color: rgb(0.85, 0.85, 0.95),
  });

  page.drawText("UjuziLab", {
    x: M,
    y: PAGE.h - 72,
    size: 18,
    font: fontBold,
    color: C.brand,
  });

  const blocks = [
    ["Courses & lessons", "Video | Article | Quiz | Assignment"],
    ["Learning kits", "Components | Materials | Gallery"],
    ["Programs & competitions", "Bootcamps | STEM fairs"],
    ["Community & projects", "Discussions | Showcases"],
    ["Lab & solutions", "Resources | IoT workspaces"],
    ["Platform content", "Blog | Pricing | Organizations"],
  ];

  let y = PAGE.h - 280;
  for (const [head, desc] of blocks) {
    drawText(page, head, { x: M, y, size: 11, font: fontBold, color: C.navy });
    drawText(page, desc, { x: M, y: y - 16, size: 9, font, color: C.muted });
    y -= 44;
  }

  page.drawText("Prepared for content teams, instructors & administrators", {
    x: M,
    y: 100,
    size: 9,
    font: fontItalic,
    color: C.muted,
  });
  page.drawText(new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), {
    x: M,
    y: 84,
    size: 9,
    font,
    color: C.muted,
  });

  page.drawRectangle({ x: M, y: 56, width: 80, height: 3, color: C.brand });
}

// ─── Document content ─────────────────────────────────────────────────────────

const SECTIONS = [
  {
    title: "1. Global media & brand standards",
    intro:
      "Use consistent visuals across all sections. Upload via admin or instructor forms (stored under /uploads/).",
    items: [
      { required: true, text: "Course / kit / program thumbnails — 16:10 ratio, min 800×500 px, JPEG/PNG/WebP, max 10 MB" },
      { required: true, text: "Hero & catalog images — high contrast, diverse African makers/students, no watermarks" },
      { required: false, text: "Organization logo — square or horizontal PNG/SVG, min 256 px, transparent background preferred" },
      { required: false, text: "Instructor avatar — square, min 200×200 px" },
      { required: true, text: "Videos — MP4/WebM upload (max 500 MB) OR YouTube/Vimeo embed URL" },
      { required: false, text: "Certificate PDF template — A4 landscape with AcroForm fields: student_name, course_title, instructor_name, issue_date, verify_code, duration_hours" },
    ],
  },
  {
    title: "2. Courses (Instructor → 6-step builder)",
    intro:
      "Path: /instructor/courses/new → edit. Submit for admin review → publish. Minimum: title, 1 module, 1 lesson.",
    items: [
      { required: true, text: "Step 1 - Basic info: title*, subtitle, description, category, level (Beginner/Intermediate/Advanced), language, thumbnail" },
      { required: true, text: "Step 2 - Curriculum: modules (sections) each with ordered lessons" },
      { required: true, text: "Step 3 - Requirements: what you will learn (bullet list), prerequisites, target audience, linked kit slugs" },
      { required: true, text: "Step 4 - Pricing: free toggle OR price + optional discount (TZS)" },
      { required: false, text: "Step 5 - SEO & certificate: meta title, meta description, enable certificate toggle, custom cert template upload" },
      { required: true, text: "Step 6 - Review: submit for approval (status PENDING_REVIEW then admin publishes)" },
    ],
  },
  {
    title: "3. Lesson types (per lesson in curriculum)",
    intro: "Lessons auto-complete when learners finish content (video end, article scroll, quiz pass, assignment submit).",
    items: [
      { required: true, text: "VIDEO - title*, video file or URL*, optional free preview flag" },
      { required: true, text: "ARTICLE - title*, article body text* (plain text / markdown-style paragraphs)" },
      { required: true, text: "QUIZ - title*, questions with 2+ options each, correct answer marked, pass mark % (default 70), optional time limit" },
      { required: true, text: "ASSIGNMENT - title*, instructions*, optional rubric, max score, due date; students submit text, GitHub URL, and/or files" },
      { required: false, text: "Mark at least one early lesson as free preview for catalog sampling" },
    ],
  },
  {
    title: "4. Learning kits (Admin → /admin/kits)",
    intro: "Physical/digital STEM kits sold or bundled with courses. Publish when inventory & content are ready.",
    items: [
      { required: true, text: "Core: title*, subtitle, description, category (Robotics/Electronics/IoT/Coding/STEM), difficulty, age range" },
      { required: true, text: "Commerce: price (TZS) or free, inventory count, status (Draft/Published/Archived)" },
      { required: true, text: "Thumbnail + gallery images (captions, one marked primary)" },
      { required: true, text: "Components list — name, quantity, description, optional component photo per item" },
      { required: true, text: "Materials — title, type (Guide/Video/PDF/Worksheet/Project), description, URL, duration" },
      { required: false, text: "Learning outcomes & project ideas (bullet lists), related course slugs for cross-linking" },
    ],
  },
  {
    title: "5. Programs & bootcamps (Admin → /admin/programs)",
    intro: "Cohort-based offerings with seats and registration windows.",
    items: [
      { required: true, text: "Title*, type (e.g. Bootcamp, Accelerator), description" },
      { required: true, text: "Thumbnail — 16:10, min 800×500 px" },
      { required: true, text: "Schedule: start date, end date, format (Online/In person/Hybrid)" },
      { required: true, text: "Capacity: seats, price (TZS), status (Draft/Open/Full/Closed/Archived)" },
      { required: false, text: "Link program marketing copy to related courses & kits on the home page" },
    ],
  },
  {
    title: "6. Competitions (Admin → /admin/competitions)",
    intro: "STEM competitions and fairs with registration and prize info.",
    items: [
      { required: true, text: "Title*, description, thumbnail" },
      { required: true, text: "Dates: start & end; status (Upcoming/Registration open/In progress/Completed)" },
      { required: false, text: "Prize description (cash, kits, mentorship, etc.)" },
      { required: false, text: "Optional team name on learner registration" },
    ],
  },
  {
    title: "7. Organizations (Admin → /admin/organizations)",
    intro: "Universities, hubs, schools with org portal for members and kit logistics.",
    items: [
      { required: true, text: "Name*, URL slug*, type (University/Hub/School/Other)" },
      { required: false, text: "Logo URL, verified badge (admin)" },
      { required: false, text: "Member invites — email, role (Admin/Instructor/Member)" },
      { required: false, text: "Org kit inventory — quantity on hand, reorder level; kit procurement requests with quantity & notes" },
    ],
  },
  {
    title: "8. Community & discussions",
    intro: "Channels under /dashboard/community. Course-specific threads on course detail pages.",
    items: [
      { required: true, text: "Discussion post: title*, body*, channel (e.g. general), optional cover image" },
      { required: false, text: "Excerpt auto-generated from body; pin/resolve flags for moderators" },
      { required: false, text: "Replies with accepted-answer support for Q&A threads" },
      { required: false, text: "Seed channels: General, Projects, Competitions, Help — with welcome pinned posts" },
    ],
  },
  {
    title: "9. Learner projects showcase (/dashboard/projects/new)",
    intro: "Student-built prototypes and MVPs displayed publicly when published.",
    items: [
      { required: true, text: "Title*, description*, category*, status (Idea/Prototype/MVP/Launched)" },
      { required: false, text: "Thumbnail, tags, GitHub URL, demo URL" },
      { required: false, text: "Curate featured projects for /projects catalog" },
    ],
  },
  {
    title: "10. IoT solutions workspace (Admin → Content → Solutions)",
    intro: "Guided lab experiences with steps, components, and code templates.",
    items: [
      { required: true, text: "Title*, subtitle, description*, difficulty level, estimated hours" },
      { required: true, text: "Components list (JSON), related kit slugs" },
      { required: true, text: "Lab steps (ordered instructions), optional code template" },
      { required: false, text: "Status: Draft/Published/Archived" },
    ],
  },
  {
    title: "11. Lab resources (/lab-resources, Admin → Content)",
    intro: "Reference library for components, sensors, boards, tools, and guides.",
    items: [
      { required: true, text: "Title*, type (Component/Sensor/Board/Tool/Guide/Other), description" },
      { required: false, text: "Category, thumbnail, file upload URL, external reference URL" },
      { required: false, text: "Bookmarkable by learners in dashboard resources" },
    ],
  },
  {
    title: "12. Blog & marketing content (Admin → Content)",
    intro: "News, tutorials, and platform updates on /blog.",
    items: [
      { required: true, text: "Title*, slug, excerpt, body*, category*" },
      { required: false, text: "Author assignment, published date, status (Draft/Published/Archived)" },
      { required: false, text: "Cover imagery aligned with home page editorial style" },
    ],
  },
  {
    title: "13. Pricing plans (Admin → Content → Pricing)",
    intro: "Marketing tiers on /pricing (not subscription billing).",
    items: [
      { required: true, text: "Plan name*, slug*, price (TZS), billing period (month/year)" },
      { required: true, text: "Features list (bullets), CTA label & link" },
      { required: false, text: "Popular badge, sort order, active toggle" },
    ],
  },
  {
    title: "14. User profiles & onboarding",
    intro: "First-run experience and public profile pages at /profile/[username].",
    items: [
      { required: false, text: "Profile: full name, username, avatar, bio, location, website, LinkedIn, GitHub" },
      { required: false, text: "Privacy toggles: public profile, show courses, show certificates" },
      { required: false, text: "Onboarding flow copy & illustration assets for new students" },
      { required: false, text: "Role-specific defaults: Student, Instructor, Org admin" },
    ],
  },
  {
    title: "15. Admin publishing checklist",
    intro: "Before go-live, verify each catalog item meets quality bar.",
    items: [
      { required: true, text: "Course: pending review queue cleared, preview tested on mobile, all lesson media loads" },
      { required: true, text: "Kit: components match physical BOM, inventory accurate, gallery shows product clearly" },
      { required: true, text: "Program/competition: dates correct, thumbnail on home discover sections" },
      { required: true, text: "SEO fields filled for top catalog courses; metaTitle/metaDesc under 60/160 chars" },
      { required: false, text: "Email notifications (GMAIL_USER + app password in .env) for invites & receipts" },
      { required: false, text: "Run npm run content:assets for placeholder catalog images if seeding dev data" },
    ],
  },
];

// ─── Build PDF ────────────────────────────────────────────────────────────────

async function main() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const cover = pdf.addPage([PAGE.w, PAGE.h]);
  drawCover(cover, fontBold, font, fontItalic);

  const contentPages = [];
  let page = pdf.addPage([PAGE.w, PAGE.h]);
  let y = PAGE.h - M;

  drawText(page, "How to use this guide", {
    x: M,
    y,
    size: 16,
    font: fontBold,
    color: C.navy,
  });
  y -= 28;

  const intro =
    "Each section lists assets and copy your team must supply before publishing on UjuziLab. " +
    "Required items [R] block publish or degrade learner experience. Optional items [O] improve discovery and engagement. " +
    "Roles: Instructors create courses; Admins manage kits, programs, competitions, organizations, and site content.";
  for (const line of wrapText(intro, font, 10, CONTENT_W)) {
    drawText(page, line, { x: M, y, size: 10, font, color: C.text });
    y -= 14;
  }
  y -= 16;

  // Legend
  page.drawRectangle({ x: M, y: y - 52, width: CONTENT_W, height: 56, color: C.accentBg, borderColor: C.line, borderWidth: 0.5 });
  drawText(page, "Legend", { x: M + 10, y: y - 14, size: 9, font: fontBold, color: C.navy });
  drawText(page, "[R] Required - must supply before publish or core experience breaks", {
    x: M + 10, y: y - 30, size: 8, font, color: C.text,
  });
  drawText(page, "[O] Optional - improves discovery, engagement, or polish", {
    x: M + 10, y: y - 44, size: 8, font, color: C.muted,
  });
  y -= 72;

  drawText(page, "Contents", { x: M, y, size: 12, font: fontBold, color: C.navy });
  y -= 18;
  SECTIONS.forEach((s, i) => {
    drawText(page, s.title, { x: M + 8, y, size: 8.5, font, color: C.navySoft });
    y -= 13;
    if (y < M + 120 && i < SECTIONS.length - 1) {
      contentPages.push(page);
      page = pdf.addPage([PAGE.w, PAGE.h]);
      y = PAGE.h - M;
    }
  });
  y -= 12;

  for (const section of SECTIONS) {
    const needed = 80 + section.items.length * 18;
    if (y < M + needed) {
      contentPages.push(page);
      page = pdf.addPage([PAGE.w, PAGE.h]);
      y = PAGE.h - M;
    }

    y = drawSectionHeader(page, section.title, y, fontBold);

    for (const line of wrapText(section.intro, font, 9, CONTENT_W)) {
      drawText(page, line, { x: M, y, size: 9, font: fontItalic, color: C.navySoft });
      y -= 13;
    }
    y -= 8;

    y = drawBullets(page, section.items, M, y, font, fontBold, 9, CONTENT_W, 13);
    y -= 20;
  }

  contentPages.push(page);

  const allPages = pdf.getPages();
  const total = allPages.length;
  allPages.forEach((p, i) => {
    if (i > 0) drawFooter(p, i + 1, total, font);
  });

  const bytes = await pdf.save();
  const outDir = path.join(process.cwd(), "docs");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "UjuziLab-Content-Supply-Guide.pdf");
  await writeFile(outPath, bytes);
  console.log(`\nPDF written to: ${outPath}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
