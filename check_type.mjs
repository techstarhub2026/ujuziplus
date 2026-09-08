import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  // Check if CourseLevel exists
  const r = await prisma.$queryRaw`SELECT typname FROM pg_type WHERE typname = 'CourseLevel'`;
  console.log('CourseLevel exists:', r.length > 0, JSON.stringify(r));

  await prisma.$disconnect();
}

main();
