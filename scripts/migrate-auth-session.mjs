import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "app");

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (ent.name === "api") continue;
      walk(p, files);
    } else if (/\.(tsx|ts)$/.test(ent.name)) {
      files.push(p);
    }
  }
  return files;
}

let count = 0;
for (const file of walk(root)) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("getServerSession")) continue;
  const before = src;
  src = src.replace(/import \{ getServerSession \} from "next-auth";\r?\n/g, "");
  src = src.replace(/import \{ authOptions \} from "@\/lib\/auth";\r?\n/g, "");
  if (!src.includes("getAuthSession")) {
    src = src.replace(/^((?:import[^\n]+\n)+)/, '$1import { getAuthSession } from "@/lib/auth-server";\n');
  }
  src = src.replace(/getServerSession\(authOptions\)/g, "getAuthSession()");
  if (src !== before) {
    fs.writeFileSync(file, src);
    count++;
  }
}
console.log(`Updated ${count} files`);
