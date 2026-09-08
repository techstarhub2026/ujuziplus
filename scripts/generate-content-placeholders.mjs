/**
 * Creates branded raster FALLBACK assets for missing /content/* paths only.
 * Does NOT overwrite existing files (e.g. real AI-generated photos).
 * Run: node scripts/generate-content-placeholders.mjs
 * Force overwrite: node scripts/generate-content-placeholders.mjs --force
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "public", "content");

const assets = [
  ["courses/course-arduino-robotics.jpg", "Arduino Robotics", "#00004D", "#f39223"],
  ["courses/course-flutter-mobile.jpg", "Flutter Mobile Apps", "#1e3a5f", "#f39223"],
  ["courses/course-iot-farming.jpg", "IoT Smart Agriculture", "#14532d", "#84cc16"],
  ["courses/course-python-data.jpg", "Python for Innovation", "#312e81", "#818cf8"],
  ["courses/course-esp32-lora.jpg", "ESP32 and LoRa", "#0f766e", "#2dd4bf"],
  ["courses/course-solar-health.jpg", "Solar Microgrids", "#b45309", "#fbbf24"],
  ["courses/course-pcb-kicad.jpg", "PCB Design KiCad", "#1e293b", "#94a3b8"],
  ["kits/kit-arduino-classroom.jpg", "Arduino Classroom Kit", "#00004D", "#f39223"],
  ["kits/kit-esp32-iot-field.jpg", "ESP32 Field Kit", "#0f766e", "#34d399"],
  ["kits/kit-solar-learning.jpg", "Solar Learning Lab", "#b45309", "#fcd34d"],
  ["kits/gallery/arduino-kit-students.jpg", "Students in Lab", "#00004D", "#f39223"],
  ["kits/gallery/arduino-kit-robot.jpg", "Line-Follower Robot", "#334155", "#f39223"],
  ["kits/gallery/esp32-field-node.jpg", "Field Sensor Node", "#0f766e", "#2dd4bf"],
  ["kits/gallery/solar-clinic-demo.jpg", "Clinic Solar Demo", "#b45309", "#fbbf24"],
  ["orgs/org-dit-tanzania.png", "DIT Tanzania", "#00004D", "#f39223"],
  ["orgs/org-makerere-hub.png", "Makerere Hub", "#166534", "#f39223"],
  ["orgs/org-kigali-stem.png", "Kigali STEM", "#1e40af", "#fbbf24"],
  ["orgs/org-nairobi-techstar.png", "Nairobi TechStar", "#00004D", "#f39223"],
  ["projects/project-soil-network.jpg", "Soil Sensor Network", "#14532d", "#84cc16"],
  ["projects/project-clinic-queue.jpg", "Clinic Queue App", "#0e7490", "#67e8f9"],
  ["projects/project-solar-fridge.jpg", "Solar Vaccine Fridge", "#b45309", "#fbbf24"],
  ["projects/project-solar-irrigation.jpg", "Smart Irrigation", "#15803d", "#4ade80"],
  ["projects/project-health-chatbot.jpg", "Health Chatbot", "#7c3aed", "#c4b5fd"],
  ["projects/project-air-quality.jpg", "Air Quality Monitor", "#475569", "#94a3b8"],
  ["components/component-arduino-uno.jpg", "Arduino Uno", "#00979d", "#ffffff"],
  ["components/component-esp32.jpg", "ESP32 Board", "#1d4ed8", "#ffffff"],
  ["components/component-dht22.jpg", "DHT22 Sensor", "#0f766e", "#ffffff"],
  ["components/component-soil-sensor.jpg", "Soil Sensor", "#854d0e", "#fef3c7"],
  ["components/component-lora.jpg", "LoRa Module", "#312e81", "#c7d2fe"],
  ["components/component-breadboard.jpg", "Breadboard", "#f8fafc", "#64748b"],
  ["components/component-motor-driver.jpg", "Motor Driver", "#1e293b", "#f39223"],
  ["components/component-ir-sensor.jpg", "IR Sensor", "#111827", "#ef4444"],
  ["components/component-jumper-wires.jpg", "Jumper Wires", "#f59e0b", "#ffffff"],
  ["components/component-power-bank.jpg", "Power Bank", "#374151", "#f39223"],
  ["components/component-enclosure.jpg", "IP65 Enclosure", "#64748b", "#e2e8f0"],
  ["components/component-battery.jpg", "18650 Pack", "#1f2937", "#22c55e"],
  ["components/component-solar-panel.jpg", "Solar Panel", "#1e3a8a", "#fbbf24"],
  ["components/component-mppt.jpg", "MPPT Controller", "#0f172a", "#f39223"],
  ["components/component-lifepo4.jpg", "LiFePO4 Battery", "#166534", "#bbf7d0"],
  ["components/component-load-bank.jpg", "Load Bank", "#44403c", "#fcd34d"],
  ["certificates/certificate-template.jpg", "UjuziLab Certificate", "#00004D", "#f39223"],
];

function svg(title, bg, accent) {
  const safe = title.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720" role="img">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${bg}"/><stop offset="100%" stop-color="${accent}"/></linearGradient></defs>
  <rect width="1280" height="720" fill="url(#g)"/>
  <rect x="60" y="60" width="1160" height="600" rx="24" fill="none" stroke="#fff" stroke-width="4" opacity=".25"/>
  <text x="80" y="200" fill="#fff" font-family="Segoe UI,Arial,sans-serif" font-size="56" font-weight="700">${safe}</text>
  <text x="80" y="270" fill="#fff" opacity=".85" font-family="Segoe UI,Arial,sans-serif" font-size="28">TechStar UjuziLab · Africa STEM</text>
</svg>`;
}

// Remove stale SVG duplicates that were written with wrong extensions
function cleanStaleSvgDuplicates(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) cleanStaleSvgDuplicates(full);
    else if (entry.name.endsWith(".svg")) fs.unlinkSync(full);
  }
}

const force = process.argv.includes("--force");

cleanStaleSvgDuplicates(root);

let skipped = 0;
for (const [rel, title, bg, accent] of assets) {
  const full = path.join(root, rel);
  if (!force && fs.existsSync(full) && fs.statSync(full).size > 80_000) {
    skipped++;
    continue;
  }
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const buffer = Buffer.from(svg(title, bg, accent));
  const pipeline = sharp(buffer).resize(1280, 720);
  if (rel.endsWith(".png")) {
    await pipeline.png({ compressionLevel: 8 }).toFile(full);
  } else {
    await pipeline.jpeg({ quality: 92, mozjpeg: true }).toFile(full);
  }
}

// Stub PDF paths referenced by kit materials (minimal valid PDF)
const pdfStub = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj
2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj
3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Contents 4 0 R>>endobj
4 0 obj<</Length 44>>stream
BT /F1 12 Tf 72 720 Td (UjuziLab resource) Tj ET
endstream endobj
xref
0 5
trailer<</Size 5/Root 1 0 R>>
startxref
0
%%EOF`;

const pdfs = [
  "kits/materials/arduino-educator-guide.pdf",
  "kits/materials/classroom-safety.pdf",
  "kits/materials/line-follower-worksheet.pdf",
  "kits/materials/competition-rubric.pdf",
  "kits/materials/esp32-field-manual.pdf",
  "kits/materials/lora-link-budget.pdf",
  "kits/materials/esp32-flash-guide.pdf",
  "kits/materials/solar-educator-guide.pdf",
  "kits/materials/clinic-load-survey.pdf",
  "kits/materials/solar-maintenance.pdf",
  "lab/kicad-quick-start.pdf",
];

for (const rel of pdfs) {
  const full = path.join(root, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, pdfStub);
}

console.log(
  `Content assets: wrote raster images, ${pdfs.length} PDF stubs` +
    (skipped ? `, skipped ${skipped} existing photo(s)` : "") +
    (force ? " (--force)" : "")
);
