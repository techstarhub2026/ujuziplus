/**
 * Generates UjuziLab brand assets from final_ujuzi_logo.png (project root).
 * Full logo files keep the original canvas. Favicons use the gear/head mark only
 * (standard web practice — square icon, no wordmark in the tab).
 * Run: npm run brand:assets
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const logoSrc = path.join(root, "final_ujuzi_logo.png");
const NAVY = { r: 0, g: 0, b: 77, alpha: 1 };

async function knockOutBackground(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (Math.max(r, g, b) < 90) data[i + 3] = 0;
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

async function knockOutBlack(input, output) {
  const img = await knockOutBackground(input);
  await img.png({ compressionLevel: 9 }).toFile(output);
}

function isOrangePixel(r, g, b) {
  return r > 150 && g > 65 && b < 110 && r > g && g > b * 0.9;
}

/** Recolor navy/blue logo elements to white for dark navy sidebars. */
async function createOnDarkLogo(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (Math.max(r, g, b) < 90) {
      data[i + 3] = 0;
      continue;
    }
    if (isOrangePixel(r, g, b)) continue;
    if (b >= r * 0.75 && b > 35) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
    }
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } });
}

/** Gear/head mark from the top of the logo — sidebar display only, not favicon. */
async function extractIconMark(input) {
  const trimmed = await (await knockOutBackground(input)).trim().png().toBuffer();
  const meta = await sharp(trimmed).metadata();

  // Upper ~70% holds the head mark; full width so side outlines are not cropped.
  const iconHeight = Math.min(meta.height, Math.round(meta.height * 0.7));
  const cropped = await sharp(trimmed)
    .extract({ left: 0, top: 0, width: meta.width, height: iconHeight })
    .trim()
    .extend({
      top: 12,
      bottom: 12,
      left: 12,
      right: 12,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const cropMeta = await sharp(cropped).metadata();
  const side = Math.max(cropMeta.width, cropMeta.height);
  return sharp(cropped)
    .resize(side, side, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

const outBrand = path.join(root, "public", "brand");
const outArtworks = path.join(root, "artworks");
const outPublic = path.join(root, "public");
fs.mkdirSync(outBrand, { recursive: true });

if (!fs.existsSync(logoSrc)) {
  console.error("Source not found: final_ujuzi_logo.png in project root.");
  process.exit(1);
}

const logoFull = await fs.promises.readFile(logoSrc);
const logoMeta = await sharp(logoFull).metadata();
const logoAspect = Number((logoMeta.width / logoMeta.height).toFixed(3));

const iconMark = await extractIconMark(logoFull);
await fs.promises.writeFile(path.join(outBrand, "ujuzilab-mark.png"), iconMark);

const onDarkLogo = await createOnDarkLogo(logoFull);
const onDarkLogoBuf = await onDarkLogo.png({ compressionLevel: 9 }).toBuffer();
await fs.promises.writeFile(path.join(outBrand, "final_ujuzi_logo-on-dark.png"), onDarkLogoBuf);
await fs.promises.writeFile(path.join(outPublic, "final_ujuzi_logo-on-dark.png"), onDarkLogoBuf);

const onDarkMark = await extractIconMark(onDarkLogoBuf);
await fs.promises.writeFile(path.join(outBrand, "ujuzilab-mark-on-dark.png"), onDarkMark);

console.log(`Logo (full canvas): ${logoMeta.width}x${logoMeta.height} (aspect ${logoAspect})`);

// Full logo — original canvas everywhere except favicon
await fs.promises.copyFile(logoSrc, path.join(outBrand, "ujuzilab-logo.png"));
await fs.promises.copyFile(logoSrc, path.join(outBrand, "ujuzilab-icon.png"));
await fs.promises.copyFile(logoSrc, path.join(outBrand, "final_ujuzi_logo.png"));
await knockOutBlack(logoFull, path.join(outBrand, "ujuzilab-logo-transparent.png"));
await knockOutBlack(logoFull, path.join(outBrand, "ujuzilab-icon-transparent.png"));

const displayImg = await knockOutBackground(logoFull);
const displayMeta = await displayImg.clone().trim().metadata();
const contentAspect = Number((displayMeta.width / displayMeta.height).toFixed(3));
await displayImg.trim().png({ compressionLevel: 9 }).toFile(path.join(outBrand, "ujuzilab-logo-display.png"));

// Favicons — display-optimized from artworks/32by32.png (see scripts/sync-favicons.mjs)
const faviconCopies = [
  ["final_ujuzi_logo.ico", "final_ujuzi_logo.ico"],
  ["log.png", "log.png"],
];
for (const [srcName, destName] of faviconCopies) {
  const from = path.join(outArtworks, srcName);
  if (!fs.existsSync(from)) {
    console.warn(`artworks/${srcName} not found — skipping`);
    continue;
  }
  await fs.promises.copyFile(from, path.join(outPublic, destName));
}

// Legacy public logo copies
await fs.promises.copyFile(logoSrc, path.join(outPublic, "ujuzilab-logo.png"));
await fs.promises.copyFile(logoSrc, path.join(outPublic, "ujuzilab-icon.png"));

// OG / social — full logo
await sharp(logoFull)
  .resize(512, Math.round(512 / logoAspect), { fit: "inside" })
  .png()
  .toFile(path.join(outBrand, "og-image.png"));

const aspectFile = `/** Auto-generated by npm run brand:assets — do not edit manually */
export const BRAND_LOGO_ASPECT = ${logoAspect};
export const BRAND_LOGO_CONTENT_ASPECT = ${contentAspect};
export const BRAND_LOGO_ZOOM = ${Number((logoMeta.width / displayMeta.width).toFixed(3))};
`;
fs.writeFileSync(path.join(root, "src", "lib", "brand-logo-aspect.ts"), aspectFile);

const manifest = {
  name: "ujuziPlus",
  short_name: "ujuziPlus",
  description: "Africa's modern learning and innovation ecosystem.",
  start_url: "/",
  display: "standalone",
  background_color: "#00004D",
  theme_color: "#f39223",
  icons: [
    { src: "/favicon-32.png", sizes: "32x32", type: "image/png", purpose: "any" },
    { src: "/log.png", sizes: "1536x1024", type: "image/png", purpose: "any" },
  ],
};
fs.writeFileSync(path.join(outPublic, "manifest.webmanifest"), JSON.stringify(manifest, null, 2));

spawnSync(process.execPath, [path.join(__dirname, "sync-favicons.mjs")], {
  stdio: "inherit",
  cwd: root,
});

console.log("Brand assets generated");
