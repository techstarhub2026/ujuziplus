import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  // Check current mentor_profiles columns
  const cols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'mentor_profiles'
    ORDER BY ordinal_position
  `;
  const names = cols.map(c => c.column_name);
  
  // Check if mentorType exists
  const hasMentorTypeCamel = names.includes('mentorType');
  const hasMentortypeLower = names.includes('mentortype');
  
  console.log('mentor_profiles columns:', names.join(', '));
  console.log('Has mentorType (camel):', hasMentorTypeCamel);
  console.log('Has mentortype (lower):', hasMentortypeLower);
  
  // Try both ways to rename
  if (hasMentortypeLower && !hasMentorTypeCamel) {
    try {
      await prisma.$executeRawUnsafe('ALTER TABLE "mentor_profiles" RENAME COLUMN "mentortype" TO "mentorType";');
      console.log('OK renamed using quoted mentortype');
    } catch (e1) {
      try {
        await prisma.$executeRawUnsafe('ALTER TABLE "mentor_profiles" RENAME COLUMN mentortype TO "mentorType";');
        console.log('OK renamed using unquoted mentortype');
      } catch (e2) {
        console.log('FAIL both rename methods');
      }
    }
  } else if (hasMentorTypeCamel) {
    console.log('Already has mentorType, no rename needed');
  }

  await prisma.$disconnect();
}

main();
