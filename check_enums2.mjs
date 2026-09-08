import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  const checks = [
    ['lessons', 'type'],
    ['assignments', 'status'],
    ['instructor_payouts', 'status'],
    ['kits', 'status'],
    ['kits', 'difficulty'],
    ['kit_materials', 'type'],
    ['programs', 'format'],
    ['competitions', 'status'],
    ['organizations', 'type'],
    ['org_invites', 'role'],
    ['org_invites', 'status'],
    ['org_kit_requests', 'status'],
    ['projects', 'status'],
    ['solutions', 'level'],
    ['solutions', 'status'],
    ['lab_resources', 'type'],
    ['blog_posts', 'status'],
    ['mentor_profiles', 'status'],
    ['mentor_requests', 'status'],
    ['mentor_sessions', 'status'],
    ['mentor_group_sessions', 'sessionMode'],
    ['showcase_projects', 'status'],
  ];

  let allGood = true;
  for (const [table, col] of checks) {
    try {
      const r = await prisma.$queryRaw`
        SELECT udt_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${col}
      `;
      const type = r.length > 0 ? r[0].udt_name : 'MISSING';
      const status = type === 'MISSING' ? '✗' : (type.startsWith('_') ? '~ enum' : '✓');
      if (type === 'MISSING' || type.startsWith('_')) allGood = false;
      console.log(`${status} ${table}.${col} = ${type}`);
    } catch (e) {
      console.log(`✗ ${table}.${col}: ${e.message?.split('\n')[0] || e}`);
      allGood = false;
    }
  }

  console.log(allGood ? '\n✓ All enums converted!' : '\n✗ Some enums still need fixing');
  await prisma.$disconnect();
}

main();
