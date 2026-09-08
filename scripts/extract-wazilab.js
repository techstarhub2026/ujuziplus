const fs = require("fs");
const path = require("path");

const clonesDir = path.join(__dirname, "..", "clones");
const files = fs.readdirSync(clonesDir).filter((f) => f.endsWith(".html"));

const allColors = new Set();
const allNav = new Set();
const pageInfo = [];

for (const file of files) {
  const html = fs.readFileSync(path.join(clonesDir, file), "utf8");
  const title = (html.match(/<title>([^<]+)/) || [])[1] || "";
  [...html.matchAll(/rgb\(\d+,\s*\d+,\s*\d+\)/g)].forEach((m) => allColors.add(m[0]));
  [...html.matchAll(/#([0-9a-fA-F]{3,8})\b/g)].forEach((m) => allColors.add("#" + m[1]));

  // Tooltips / list items / buttons with visible text
  const spans = [...html.matchAll(/>([A-Za-z][A-Za-z0-9\s&/'-]{2,50})</g)]
    .map((m) => m[1].trim())
    .filter((t) => !t.startsWith("css") && !t.includes("Mui") && t.length < 40);

  const navCandidates = spans.filter((t) =>
    /^(Home|Courses|Programs?|Projects|Organizations|Lab|Resources|Settings|Profile|Dashboard|Community|Youth|Solutions|Modules|Lessons|Enroll|Sign|Log)/i.test(t)
  );
  navCandidates.forEach((n) => allNav.add(n));

  const headings = [...new Set([...html.matchAll(/<h[1-6][^>]*>([^<]{3,120})</g)].map((m) => m[1].trim()))];

  pageInfo.push({ file, title, headings: headings.slice(0, 8) });
}

console.log("=== WAZILAB COLOR PALETTE ===");
console.log([...allColors].sort().join("\n"));

console.log("\n=== NAV / UI LABELS (sample) ===");
console.log([...allNav].sort().join("\n"));

console.log("\n=== PAGES ===");
pageInfo
  .sort((a, b) => a.title.localeCompare(b.title))
  .forEach((p) => {
    console.log(`\n${p.title} (${p.file})`);
    if (p.headings.length) console.log("  H:", p.headings.join(" | "));
  });
