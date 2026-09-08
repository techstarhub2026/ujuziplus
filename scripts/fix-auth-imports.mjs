import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..", "src", "app");

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, files);
    else if (/\.(tsx|ts)$/.test(ent.name)) files.push(p);
  }
  return files;
}

let count = 0;
for (const file of walk(root)) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("getAuthSession()")) continue;
  if (src.includes('@/lib/auth-server"')) continue;

  const imports = [...src.matchAll(/^import .+$/gm)];
  const importLine = 'import { getAuthSession } from "@/lib/auth-server";';
  if (imports.length > 0) {
    const last = imports[imports.length - 1];
    const pos = last.index + last[0].length;
    src = `${src.slice(0, pos)}\n${importLine}${src.slice(pos)}`;
  } else {
    src = `${importLine}\n${src}`;
  }
  fs.writeFileSync(file, src);
  count++;
}
console.log(`Fixed ${count} files`);
