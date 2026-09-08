import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  // Test basic ALTER
  console.log('Testing CREATE TYPE...');
  try {
    const r = await prisma.$executeRawUnsafe(`
      DO $$ BEGIN
        CREATE TYPE "CourseLevel" AS ENUM ('BEGINNER','INTERMEDIATE','ADVANCED');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
    console.log('DO block result:', r);
  } catch (err) {
    console.log('Error:', JSON.stringify(err, null, 2));
  }

  await prisma.$disconnect();
}

main();
