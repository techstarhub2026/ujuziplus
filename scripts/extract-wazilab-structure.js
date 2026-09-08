const fs = require("fs");
const path = require("path");

function extractVisibleText(html, max = 80) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<img[^>]*>/gi, "")
    .replace(/<[^>]+>/g, "\n")
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 2 && s.length < 120 && !/^css-/.test(s))
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, max);
}

const samples = [
  "Home___WaziLab.html",
  "Courses___WaziLab.html",
  "Program___WaziLab.html",
  "Introduction_to_IoT___WaziLab.html",
  "Lab_Resources___WaziLab.html",
  "Organizations___WaziLab.html",
  "Projects___WaziLab.html",
  "YouthTeamUp___WaziLab.html",
];

const dir = path.join(__dirname, "..", "clones");
for (const f of samples) {
  const html = fs.readFileSync(path.join(dir, f), "utf8");
  console.log("\n========", f, "========");
  console.log(extractVisibleText(html).join(" | "));
}
