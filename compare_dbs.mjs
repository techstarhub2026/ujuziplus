import { PrismaClient } from '@prisma/client';

// Use Railway's internal URL to check what the APP actually sees
const internalUrl = "postgresql://postgres:viGBSjKkkpvbNsDwtWWAzgAzynpJvduy@postgres.railway.internal:5432/railway";
const publicUrl = "postgresql://postgres:viGBSjKkkpvbNsDwtWWAzgAzynpJvduy@reseau.proxy.rlwy.net:50268/railway";

async function checkDb(url, label) {
  const p = new PrismaClient({ datasources: { db: { url } } });
  try {
    const r = await p.$queryRaw`SELECT 1 as ok`;
    console.log(`${label}: Connected, result=${r[0]?.ok}`);
    
    // Check kits columns
    const kits = await p.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'kits'
      ORDER BY ordinal_position
    `;
    const kitCols = kits.map(c => c.column_name);
    console.log(`${label} kits columns: ${kitCols.join(', ')}`);
    console.log(`${label} has ageRange: ${kitCols.includes('ageRange')}`);
    console.log(`${label} has agerange: ${kitCols.includes('agerange')}`);
    
  } catch(e) {
    console.log(`${label}: ERROR - ${e.message?.split('\n')[0] || e}`);
  }
  await p.$disconnect();
}

async function main() {
  await checkDb(internalUrl, "INTERNAL");
  await checkDb(publicUrl, "PUBLIC");
}

main().catch(e => console.error(e));
