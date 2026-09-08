import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  // 1. Fix mentor_profiles.mentortype -> mentorType
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "mentor_profiles" RENAME COLUMN mentortype TO "mentorType";');
    console.log('OK mentor_profiles.mentortype -> mentorType');
  } catch (e) {
    console.log('mentor_profiles.mentortype:', e.message?.split('\n')[0] || e);
  }

  // 2. Fix kits.agerange -> ageRange
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE kits RENAME COLUMN agerange TO "ageRange";');
    console.log('OK kits.agerange -> ageRange');
  } catch (e) {
    console.log('kits.agerange:', e.message?.split('\n')[0] || e);
  }

  // 3. Add programs.posterUrl (missing column)
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE programs ADD COLUMN IF NOT EXISTS "posterUrl" VARCHAR(191);');
    console.log('OK programs.posterUrl added');
  } catch (e) {
    console.log('programs.posterUrl:', e.message?.split('\n')[0] || e);
  }

  // 4. Check if enum conversions stuck
  try {
    const r = await prisma.$queryRaw`
      SELECT table_name, column_name, udt_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name IN ('users','courses','enrollments','orders')
        AND column_name IN ('role','status','level','type')
      ORDER BY table_name, column_name
    `;
    console.log('\nEnum check:');
    for (const row of r) {
      console.log(`  ${row.table_name}.${row.column_name} = ${row.udt_name}`);
    }
  } catch (e) {
    console.log('Enum check error:', e.message?.split('\n')[0] || e);
  }

  await prisma.$disconnect();
}

main();
