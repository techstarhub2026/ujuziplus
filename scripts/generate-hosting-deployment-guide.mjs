/**
 * UjuziLab Hosting & Infrastructure Guide (GreenGeeks + Beem + Domains)
 * Run: node scripts/generate-hosting-deployment-guide.mjs
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const FX = 2620.42; // Bank of Tanzania mean USD/TZS, 11-Jun-2026 (bot.go.tz)
const FX_DATE = "11 June 2026";

const C = {
  brand: rgb(0.953, 0.573, 0.137),
  navy: rgb(0, 0, 0.302),
  navySoft: rgb(0.2, 0.2, 0.45),
  text: rgb(0.15, 0.15, 0.2),
  muted: rgb(0.45, 0.45, 0.5),
  line: rgb(0.88, 0.88, 0.9),
  white: rgb(1, 1, 1),
  cream: rgb(0.99, 0.98, 0.96),
  accentBg: rgb(1, 0.97, 0.93),
  greenBg: rgb(0.92, 0.98, 0.93),
  green: rgb(0.1, 0.45, 0.25),
};

const PAGE = { w: 595.28, h: 841.89 };
const M = 48;
const CONTENT_W = PAGE.w - M * 2;
const FOOTER = "UjuziLab - Hosting & Infrastructure Guide";

function ascii(s) {
  return String(s)
    .replace(/\u2014/g, "-")
    .replace(/\u2013/g, "-")
    .replace(/\u2192/g, ">")
    .replace(/[^\x00-\xFF]/g, "");
}
function t(s) {
  return ascii(s);
}
function tzs(usd) {
  return Math.round(usd * FX);
}
function fmtTzs(n) {
  return `TZS ${n.toLocaleString("en-US")}`;
}
function fmtUsd(n) {
  return `$${n.toFixed(2)}`;
}

function wrapText(text, font, size, maxWidth) {
  const words = t(text).split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) <= maxWidth) line = test;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawText(page, text, opts) {
  page.drawText(t(text), opts);
}

function drawParagraph(page, text, x, y, font, size, maxWidth, color = C.text) {
  let cy = y;
  for (const line of wrapText(text, font, size, maxWidth)) {
    drawText(page, line, { x, y: cy, size, font, color });
    cy -= size + 4;
  }
  return cy;
}

function drawSectionHeader(page, title, y, fontBold) {
  page.drawRectangle({ x: M, y: y - 6, width: CONTENT_W, height: 28, color: C.accentBg });
  page.drawRectangle({ x: M, y: y - 6, width: 4, height: 28, color: C.brand });
  drawText(page, title, { x: M + 12, y: y + 2, size: 13, font: fontBold, color: C.navy });
  return y - 36;
}

function drawTable(page, rows, y, font, fontBold) {
  const col1 = M;
  const col2 = M + 200;
  const col3 = M + 320;
  let cy = y;
  rows.forEach((row, i) => {
    const isHeader = i === 0;
    const f = isHeader ? fontBold : font;
    const sz = isHeader ? 8.5 : 8;
    if (isHeader) {
      page.drawRectangle({ x: M, y: cy - 4, width: CONTENT_W, height: 16, color: C.navy });
    }
    const color = isHeader ? C.white : C.text;
    drawText(page, row[0], { x: col1 + 4, y: cy, size: sz, font: f, color });
    drawText(page, row[1], { x: col2, y: cy, size: sz, font: f, color });
    drawText(page, row[2], { x: col3, y: cy, size: sz, font: f, color });
    cy -= isHeader ? 20 : 16;
  });
  return cy - 8;
}

function drawBullets(page, items, x, y, font, fontBold, size, maxWidth) {
  let cy = y;
  for (const text of items) {
    drawText(page, "-", { x, y: cy, size: size + 1, font: fontBold, color: C.brand });
    const lines = wrapText(text, font, size, maxWidth - 16);
    lines.forEach((ln, i) => {
      drawText(page, ln, { x: x + 12, y: cy, size, font, color: C.text });
      if (i < lines.length - 1) cy -= 13;
    });
    cy -= 15;
  }
  return cy;
}

function drawFooter(page, pageNum, total, font) {
  page.drawLine({ start: { x: M, y: 36 }, end: { x: PAGE.w - M, y: 36 }, thickness: 0.5, color: C.line });
  drawText(page, FOOTER, { x: M, y: 22, size: 8, font, color: C.muted });
  drawText(page, `Page ${pageNum} of ${total}`, {
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

  const title = "Hosting & Infrastructure Guide";
  drawText(page, title, {
    x: (PAGE.w - fontBold.widthOfTextAtSize(title, 24)) / 2,
    y: PAGE.h - 115,
    size: 24,
    font: fontBold,
    color: C.white,
  });
  const sub = "GreenGeeks deployment, domains & Beem SMS for UjuziLab";
  drawText(page, sub, {
    x: (PAGE.w - font.widthOfTextAtSize(sub, 11)) / 2,
    y: PAGE.h - 142,
    size: 11,
    font,
    color: rgb(0.85, 0.85, 0.95),
  });
  drawText(page, "UjuziLab", { x: M, y: PAGE.h - 72, size: 18, font: fontBold, color: C.brand });

  const lines = [
    "GreenGeeks VPS & shared hosting (USD list prices + TZS)",
    "Domain options: .com via GreenGeeks, .co.tz via TZ registrars",
    "Beem Africa SMS API - Tanzania tiered pricing (TZS/SMS)",
    "Recommended stack for Next.js 14 + MySQL + file uploads",
  ];
  let y = PAGE.h - 270;
  for (const ln of lines) {
    drawText(page, ln, { x: M, y, size: 10, font, color: C.navySoft });
    y -= 22;
  }

  drawText(page, `FX rate: 1 USD = ${FX.toLocaleString("en-US")} TZS (BoT mean, ${FX_DATE})`, {
    x: M,
    y: 100,
    size: 9,
    font: fontItalic,
    color: C.muted,
  });
  drawText(page, `Research date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, {
    x: M,
    y: 84,
    size: 9,
    font,
    color: C.muted,
  });
  page.drawRectangle({ x: M, y: 56, width: 80, height: 3, color: C.brand });
}

const SECTIONS = [
  {
    title: "1. Recommendation for UjuziLab",
    body:
      "UjuziLab is a Next.js 14 application with server actions, Prisma, MySQL, sessions, and video uploads up to 500 MB. " +
      "It needs Node.js, a persistent process (PM2), and dedicated RAM - not a basic PHP/WordPress-only shared account.",
    highlight: true,
    bullets: [
      "RECOMMENDED: GreenGeeks VPS 8 GB (Self-Managed) - intro " +
        fmtUsd(19.99) + "/mo (" + fmtTzs(tzs(19.99)) + "/mo), renews at " +
        fmtUsd(39.99) + "/mo (" + fmtTzs(tzs(39.99)) + "/mo). 4 vCPU, 8 GB RAM, 160 GB SSD.",
      "ALTERNATIVE (managed support): GreenGeeks Managed VPS 8 GB - " +
        fmtUsd(129.95) + "/mo (" + fmtTzs(tzs(129.95)) + "/mo). 6 vCPU, 8 GB RAM, 150 GB SSD, proactive monitoring.",
      "BUDGET / STAGING ONLY: EcoSite Premium shared - intro " +
        fmtUsd(8.95) + "/mo (" + fmtTzs(tzs(8.95)) + "/mo). Node.js via cPanel but limited RAM, no PM2 on shared - not ideal for production LMS.",
      "NOT RECOMMENDED for production: Lite or Pro shared plans - no Node.js support per GreenGeeks documentation.",
    ],
  },
  {
    title: "2. GreenGeeks shared hosting (12-month prepaid)",
    body: "Source: greengeeks.com/pricing (June 2026). Intro rates require 12-month prepayment. Free .com domain year 1 on annual plans.",
    table: [
      ["Plan", "USD / month", "TZS / month"],
      ["Lite (intro / renew)", "$2.95 / $13.95", `${fmtTzs(tzs(2.95))} / ${fmtTzs(tzs(13.95))}`],
      ["Pro (intro / renew)", "$4.95 / $18.95", `${fmtTzs(tzs(4.95))} / ${fmtTzs(tzs(18.95))}`],
      ["Premium (intro / renew)", "$8.95 / $30.95", `${fmtTzs(tzs(8.95))} / ${fmtTzs(tzs(30.95))}`],
      ["Year 1 total (Premium)", "$107.40 prepaid", fmtTzs(tzs(107.4))],
      ["Year 2+ annual (Premium)", "$371.40/yr", fmtTzs(tzs(371.4))],
    ],
    bullets: [
      "Premium: 100 GB SSD, unlimited sites, Node.js on EcoSite Premium servers, free SSL, CDN, daily backups.",
      "Lite/Pro: 25-50 GB SSD - suitable for marketing landing pages only, not the full UjuziLab app.",
    ],
  },
  {
    title: "3. GreenGeeks VPS hosting",
    body: "VPS is the right tier for production Next.js. Choose Managed for hands-on support or Self-Managed for lower cost.",
    table: [
      ["Plan", "USD / month", "TZS / month"],
      ["Managed VPS 4 GB", "$69.95", fmtTzs(tzs(69.95))],
      ["Managed VPS 8 GB", "$129.95", fmtTzs(tzs(129.95))],
      ["Managed VPS 16 GB", "$179.95", fmtTzs(tzs(179.95))],
      ["Self VPS 4 GB (intro/renew)", "$9.99 / $19.99", `${fmtTzs(tzs(9.99))} / ${fmtTzs(tzs(19.99))}`],
      ["Self VPS 8 GB (intro/renew)", "$19.99 / $39.99", `${fmtTzs(tzs(19.99))} / ${fmtTzs(tzs(39.99))}`],
      ["Self VPS 16 GB (intro/renew)", "$39.99 / $79.99", `${fmtTzs(tzs(39.99))} / ${fmtTzs(tzs(79.99))}`],
    ],
    bullets: [
      "Deploy: Node 20 LTS, PM2, Nginx reverse proxy, MySQL 8, store uploads on SSD or S3-compatible storage.",
      "Set NEXTAUTH_URL to https://yourdomain.tz. Use GreenGeeks free SSL (Let's Encrypt).",
      "Pick EU or US data centre; for Tanzania users consider CDN for static assets.",
    ],
  },
  {
    title: "4. Domain name pricing",
    body: "Register .co.tz locally (TCRA) for trust in Tanzania; use GreenGeeks bundled .com for international reach.",
    table: [
      ["Domain", "USD / year", "TZS / year"],
      [".com via GreenGeeks (yr 1 w/ hosting)", "Free", "Free"],
      [".com via GreenGeeks (renewal)", "$17.95", fmtTzs(tzs(17.95))],
      [".co.tz (TZ registrars, typical)", "N/A", "TZS 19,500 - 25,500"],
      [".com via TZ registrar (typical)", "N/A", "TZS 32,000 - 50,000"],
      ["ujuzilab.co.tz example (Sakurahost sale)", "N/A", "TZS 19,500 register"],
      ["ujuzilab.co.tz renewal (typical)", "N/A", "TZS 25,000"],
    ],
    bullets: [
      "Suggested pair: ujuzilab.co.tz (primary, Tanzania) + ujuzilab.com (redirect to .co.tz or global marketing).",
      "GreenGeeks free domain applies to .com, .net, .org, .info, .biz on first annual hosting purchase.",
    ],
  },
  {
    title: "5. Beem Africa SMS API (Tanzania)",
    body: "Source: beem.africa/coverage (official). All networks (Vodacom, Airtel, Tigo). Sender ID registration required (7-14 working days). API: apisms.beem.africa",
    table: [
      ["Monthly volume", "TZS per SMS", "Example cost"],
      ["1 - 10,000", "20", "1,000 SMS = TZS 20,000"],
      ["10,001 - 25,000", "18", "15,000 SMS = TZS 270,000"],
      ["25,001 - 50,000", "17", "40,000 SMS = TZS 680,000"],
      ["50,001 - 100,000", "16", "75,000 SMS = TZS 1,200,000"],
      ["100,001 - 250,000", "14", ""],
      ["250,001 - 500,000", "13", ""],
      ["500,001 - 1,000,000", "12", ""],
      ["1,000,001 - 2,000,000", "10.7", ""],
    ],
    bullets: [
      "Use for: OTP login, course notifications, assignment alerts, org invites (alongside email).",
      "Register sender name 'UJUZILAB' (max 11 chars) with business registration docs via Beem dashboard.",
      "Prepaid SMS credits required before sender ID approval. Contact senderid@beem.africa for current fees.",
      "Shortcode (optional, enterprise): dedicated toll-free setup from EUR 3,000 + annual TCRA/regulatory fees - only if you need two-way SMS.",
    ],
  },
  {
    title: "6. Estimated Year 1 budget (recommended stack)",
    body: "Assumes VPS 8 GB self-managed intro pricing, .co.tz domain, modest SMS volume.",
    table: [
      ["Item", "USD equiv.", "TZS"],
      ["GreenGeeks VPS 8 GB (12 mo intro)", "$239.88", fmtTzs(tzs(239.88))],
      [".co.tz domain (register + renew est.)", "N/A", "TZS 45,000"],
      ["Beem SMS 2,000 transactional/yr", "N/A", "TZS 40,000"],
      ["SSL certificate", "Free (Let's Encrypt)", "Free"],
      ["TOTAL Year 1 (approx.)", "~$240 + domains/SMS", fmtTzs(tzs(239.88) + 85000)],
    ],
    bullets: [
      "Year 2 hosting renews at $39.99/mo = " + fmtTzs(tzs(39.99)) + "/mo (" + fmtTzs(tzs(479.88)) + "/yr).",
      "Add MySQL managed add-on or external DB only if you outgrow VPS - not required at launch.",
      "Keep Gmail SMTP for email (free tier) or use Beem SMS for critical alerts in Tanzania.",
    ],
  },
  {
    title: "7. UjuziLab deployment checklist on GreenGeeks",
    bullets: [
      "Order VPS 8 GB, point ujuzilab.co.tz A-record to VPS IP (and www CNAME).",
      "Install Node 20, MySQL 8, Nginx, PM2. Clone repo, set .env (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL).",
      "Run prisma migrate deploy && npm run build && pm2 start npm --name ujuzilab -- start.",
      "Configure Nginx proxy to port 3000, enable HTTPS via certbot or GreenGeeks SSL tool.",
      "Create Beem account, request sender ID, integrate SMS API for OTP/notifications.",
      "Set up daily DB backups and test restore. Monitor RAM during video upload peaks.",
    ],
  },
  {
    title: "8. Sources & disclaimers",
    bullets: [
      "GreenGeeks prices: https://www.greengeeks.com/pricing/ (checked June 2026).",
      "Beem SMS Tanzania: https://beem.africa/coverage/ (official tier table in TZS).",
      "USD/TZS: Bank of Tanzania indicative rate, mean " + FX + " TZS/USD on " + FX_DATE + ".",
      ".co.tz pricing: Sakurahost, Duhosting, ISP.co.tz public price lists (TZ registrars vary).",
      "Prices change with promotions and FX. Confirm in checkout before purchase.",
      "GreenGeeks Node.js: limited support on Premium shared; full control on VPS (see GreenGeeks support docs).",
    ],
  },
];

async function main() {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  drawCover(pdf.addPage([PAGE.w, PAGE.h]), fontBold, font, fontItalic);

  let page = pdf.addPage([PAGE.w, PAGE.h]);
  let y = PAGE.h - M;

  // Recommendation callout box on page 2
  page.drawRectangle({ x: M, y: y - 72, width: CONTENT_W, height: 78, color: C.greenBg });
  drawText(page, "RECOMMENDED PLAN", { x: M + 12, y: y - 18, size: 10, font: fontBold, color: C.green });
  y = drawParagraph(
    page,
    "GreenGeeks VPS 8 GB (Self-Managed): " + fmtUsd(19.99) + "/mo intro (" + fmtTzs(tzs(19.99)) +
      "/mo) | Renews " + fmtUsd(39.99) + "/mo (" + fmtTzs(tzs(39.99)) + "/mo) + ujuzilab.co.tz (~TZS 20,000) + Beem SMS from TZS 20/SMS",
    M + 12,
    y - 36,
    font,
    9,
    CONTENT_W - 24,
    C.text
  );
  y -= 16;

  for (const section of SECTIONS) {
    const estHeight = 120 + (section.table?.length ?? 0) * 16 + (section.bullets?.length ?? 0) * 14;
    if (y < M + estHeight) {
      page = pdf.addPage([PAGE.w, PAGE.h]);
      y = PAGE.h - M;
    }

    y = drawSectionHeader(page, section.title, y, fontBold);
    if (section.body) {
      y = drawParagraph(page, section.body, M, y, font, 9, CONTENT_W, C.navySoft) - 6;
    }
    if (section.table) {
      y = drawTable(page, section.table, y, font, fontBold);
    }
    if (section.bullets) {
      y = drawBullets(page, section.bullets, M, y, font, fontBold, 8.5, CONTENT_W);
    }
    y -= 12;
  }

  const pages = pdf.getPages();
  const total = pages.length;
  pages.forEach((p, i) => {
    if (i > 0) drawFooter(p, i + 1, total, font);
  });

  const outDir = path.join(process.cwd(), "docs");
  await mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, "UjuziLab-Hosting-Infrastructure-Guide.pdf");
  await writeFile(outPath, await pdf.save());
  console.log(`\nPDF written to: ${outPath}\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
