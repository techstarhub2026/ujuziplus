/**
 * Favicon — final_ujuzi_logo.png only, proportional scale, no crop.
 * Run: npm run favicons:sync
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import toIco from "to-ico";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const png = path.join(root, "final_ujuzi_logo.png");

if (!fs.existsSync(png)) {
  console.error("Missing final_ujuzi_logo.png");
  process.exit(1);
}

const meta = await sharp(png).metadata();
const height = Math.round(32 * (4 / 3)); // +⅓ → 43px tall
const width = Math.round(meta.width * (height / meta.height));

async function atHeight(h) {
  const w = Math.round(meta.width * (h / meta.height));
  return sharp(png).resize(w, h).png().toBuffer();
}

const iconBuf = await atHeight(height);
await fs.promises.writeFile(path.join(root, "src", "app", "icon.png"), iconBuf);
await fs.promises.copyFile(png, path.join(root, "public", "final_ujuzi_logo.png"));

const icoHeights = [16, 21, 32, 43, 48].map((h) => Math.round(h * (4 / 3)));
const icoBuffers = await Promise.all(icoHeights.map(atHeight));
await fs.promises.writeFile(path.join(root, "public", "favicon.ico"), await toIco(icoBuffers));

console.log(`Favicon: ${width}x${height} (+33%) from final_ujuzi_logo.png`);
