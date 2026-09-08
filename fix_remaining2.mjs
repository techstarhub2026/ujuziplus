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

  // 2. Convert mentor_profiles.status -> MentorStatus
  const enumConversions = [
    { table: 'mentor_profiles', column: 'status', enumType: 'MentorStatus', defaultVal: 'DRAFT' },
    { table: 'mentor_requests', column: 'status', enumType: 'MentorRequestStatus', defaultVal: 'PENDING' },
    { table: 'mentor_sessions', column: 'status', enumType: 'MentorSessionStatus', defaultVal: 'REQUESTED' },
    { table: 'mentor_sessions', column: 'type', enumType: 'MentorSessionType', defaultVal: 'GUIDANCE' },
    { table: 'mentor_group_sessions', column: 'sessionMode', enumType: 'GroupSessionMode', defaultVal: 'VIRTUAL' },
    { table: 'showcase_projects', column: 'status', enumType: 'ShowcaseStatus', defaultVal: 'DRAFT' },
  ];

  for (const c of enumConversions) {
    // Drop default
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "${c.table}" ALTER COLUMN "${c.column}" DROP DEFAULT;`);
    } catch (e) { /* ignore */ }

    // Convert to enum
    try {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "${c.table}" ALTER COLUMN "${c.column}" TYPE "${c.enumType}" USING "${c.column}"::"${c.enumType}";`
      );
      console.log(`OK ${c.table}.${c.column} -> ${c.enumType}`);
    } catch (err) {
      console.log(`~ ${c.table}.${c.column}: ${err.message?.split('\n')[0] || err}`);
      continue;
    }

    // Re-add default
    try {
      const def = c.defaultVal.includes('"') ? c.defaultVal : `"${c.defaultVal}"`;
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "${c.table}" ALTER COLUMN "${c.column}" SET DEFAULT ${def}::"${c.enumType}";`
      );
    } catch (e) { /* ignore */ }
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
