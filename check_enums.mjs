import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  // Check what type 'level' column has in courses
  try {
    const r = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'courses' AND column_name = 'level'
    `;
    console.log('courses.level:', JSON.stringify(r));
  } catch(e) {
    console.log('Error:', e.message.split('\n')[0]);
  }

  // Check all enum types that exist
  try {
    const r = await prisma.$queryRaw`
      SELECT typname FROM pg_type WHERE typcategory = 'E' ORDER BY typname
    `;
    console.log('Existing enums:', r.map(x => x.typname).join(', '));
  } catch(e) {
    console.log('Enum list error:', e.message.split('\n')[0]);
  }

  await prisma.$disconnect();
}

main();
