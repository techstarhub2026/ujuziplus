const fs = require("fs");
const path = require("path");
const html = fs.readFileSync(path.join(__dirname, "..", "clones", "Home___WaziLab.html"), "utf8");
const m = html.match(/src="(data:image\/png;base64,[^"]+)"/);
if (!m) {
  console.error("no logo");
  process.exit(1);
}
const buf = Buffer.from(m[1].split(",")[1], "base64");
fs.writeFileSync(path.join(__dirname, "..", "public", "wazilab-logo.png"), buf);
console.log("saved", buf.length, "bytes");
