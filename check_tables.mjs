import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  const tables = ['mentor_profiles', 'kits', 'programs', 'showcase_projects'];
  for (const t of tables) {
    try {
      const cols = await prisma.$queryRaw`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${t} 
        ORDER BY ordinal_position
      `;
      console.log(`${t}: ${cols.map(c => c.column_name).join(', ')}`);
    } catch(e) {
      console.log(`${t}: ERROR - ${e.message?.split('\n')[0] || e}`);
    }
  }
  await prisma.$disconnect();
}

main();
