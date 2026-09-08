// One-time migration: copies files still referenced via local /uploads/... paths
// (uploaded back when the app ran on Railway with a persistent volume) into
// object storage, then rewrites the DB rows to point at the new URL.
//
// Run once, after B2_* env vars are set, before decommissioning the old host:
//   SOURCE_BASE_URL=https://ujuziplus.co.tz node scripts/migrate-uploads-to-storage.mjs

import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const db = new PrismaClient();

const sourceBaseUrl = (process.env.SOURCE_BASE_URL ?? "https://ujuziplus.co.tz").replace(/\/$/, "");
const { B2_ENDPOINT, B2_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME } = process.env;

if (!B2_ENDPOINT || !B2_KEY_ID || !B2_APPLICATION_KEY || !B2_BUCKET_NAME) {
  console.error("Missing B2_ENDPOINT / B2_KEY_ID / B2_APPLICATION_KEY / B2_BUCKET_NAME");
  process.exit(1);
}

const region = new URL(B2_ENDPOINT).hostname.split(".")[1] ?? "us-west-004";
const s3 = new S3Client({
  region,
  endpoint: B2_ENDPOINT,
  credentials: { accessKeyId: B2_KEY_ID, secretAccessKey: B2_APPLICATION_KEY },
});

// [prisma model name, column name] for every field found to hold /uploads/ paths.
const TARGETS = [
  ["course", "thumbnailUrl"],
  ["instructorCredential", "fileUrl"],
  ["labResource", "fileUrl"],
  ["program", "thumbnailUrl"],
  ["program", "posterUrl"],
  ["project", "thumbnailUrl"],
  ["user", "avatarUrl"],
];

const CONTENT_TYPES = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
  ".gif": "image/gif", ".svg": "image/svg+xml", ".pdf": "application/pdf",
};

async function migrateOne(model, column, id, relPath) {
  const res = await fetch(`${sourceBaseUrl}${relPath}`);
  if (!res.ok) {
    console.error(`  FETCH FAILED (${res.status}): ${relPath}`);
    return;
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const key = relPath.replace(/^\/uploads\//, "");
  const ext = (key.match(/\.[a-z0-9]+$/i) ?? [""])[0].toLowerCase();
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";

  await s3.send(new PutObjectCommand({ Bucket: B2_BUCKET_NAME, Key: key, Body: buffer, ContentType: contentType }));

  const newUrl = `/api/files/${key}`;
  await db[model].update({ where: { id }, data: { [column]: newUrl } });
  console.log(`  OK: ${relPath} -> ${newUrl}`);
}

async function main() {
  for (const [model, column] of TARGETS) {
    const rows = await db[model].findMany({
      where: { [column]: { startsWith: "/uploads/" } },
      select: { id: true, [column]: true },
    });
    if (rows.length === 0) continue;

    console.log(`${model}.${column}: ${rows.length} row(s)`);
    for (const row of rows) {
      await migrateOne(model, column, row.id, row[column]);
    }
  }
  console.log("Done.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
