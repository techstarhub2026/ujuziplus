import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

async function main() {
  // Check if Assignment model has an enum status field
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf-8');
  const assignmentMatch = schema.match(/model Assignment\s*\{([^}]+)\}/);
  if (assignmentMatch) {
    const hasEnum = /AssignmentSubmissionStatus/.test(assignmentMatch[0]);
    console.log('Assignment model has enum status:', hasEnum);
    console.log('Assignment body:', assignmentMatch[0].substring(0, 300));
  }

  // Find what table has missing status columns
  const checks = [
    ['assignments', 'status'],
    ['assignment_submissions', 'status'],
  ];
  for (const [t, c] of checks) {
    try {
      const r = await prisma.$queryRaw`
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ${t} AND column_name = ${c}
      `;
      console.log(`${t}.${c}:`, r.length ? `${r[0].data_type}` : 'MISSING');
    } catch (e) {
      console.log(`${t}.${c}: ${e.message?.split('\n')[0] || e}`);
    }
  }

  await prisma.$disconnect();
}

main();
