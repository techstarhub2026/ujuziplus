const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "clones");
const file = "Home___WaziLab.html";
const html = fs.readFileSync(path.join(dir, file), "utf8");

// Extract emotion css rules containing key selectors
const styleMatch = html.match(/<style data-emotion=css[^>]*>([\s\S]*?)<\/style>/);
if (!styleMatch) {
  console.log("No emotion style found");
  process.exit(1);
}

const css = styleMatch[1];
const rules = css.split("}").filter((r) =>
  /LabDrawer|LabPage|MuiButton|MuiCard|MuiDrawer|css-10xzrtl|css-a873xc|css-i7cegx|MuiListItem/.test(r)
);

console.log("=== KEY CSS RULES (" + rules.length + ") ===\n");
rules.slice(0, 40).forEach((r) => console.log(r.trim() + "}\n"));

// Button outlined primary
const btnRules = css.split("}").filter((r) => /MuiButton-outlinedPrimary|MuiButton-containedPrimary/.test(r));
console.log("\n=== BUTTON RULES ===\n");
btnRules.slice(0, 8).forEach((r) => console.log(r.trim() + "}\n"));
