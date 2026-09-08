import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  // Fix kits.ageRange
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE kits RENAME COLUMN "ageRange" TO "ageRange"');
    console.log('OK kits.ageRange');
  } catch(e) {
    const m = e.message.split('\n')[0];
    console.log('kits.ageRange:', m);
  }

  try {
    await prisma.$executeRawUnsafe('ALTER TABLE kits RENAME COLUMN agerange TO "ageRange"');
    console.log('OK kits.agerange -> ageRange');
  } catch(e) {
    const m = e.message.split('\n')[0];
    console.log('kits.agerange:', m);
  }

  // Check enum types
  try {
    const r = await prisma.$queryRaw`SELECT typname FROM pg_type WHERE typname = 'CourseLevel'`;
    console.log('CourseLevel exists:', r.length > 0);
  } catch(e) {
    console.log('Enum check error:', e.message.split('\n')[0]);
  }

  try {
    const r = await prisma.$queryRaw`SELECT typname FROM pg_type WHERE typname = 'CourseStatus'`;
    console.log('CourseStatus exists:', r.length > 0);
  } catch(e) {
    console.log('Enum check error:', e.message.split('\n')[0]);
  }

  await prisma.$disconnect();
}

main();
