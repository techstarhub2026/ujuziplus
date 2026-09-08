#!/usr/bin/env node

const { PrismaClient } = require("@prisma/client");

async function resolveMigrations() {
  const prisma = new PrismaClient();

  try {
    console.log("🔧 Checking for failed migrations...");

    const failedMigrations = await prisma.$queryRaw`
      SELECT migration_name FROM _prisma_migrations
      WHERE finished_at IS NULL AND rolled_back_at IS NULL
    `;

    if (!Array.isArray(failedMigrations) || failedMigrations.length === 0) {
      console.log("✅ No failed migrations found");
      return;
    }

    console.log(`⚠️  Found ${failedMigrations.length} failed migration(s):`);
    failedMigrations.forEach((m) => console.log(`   - ${m.migration_name}`));

    await prisma.$executeRaw`
      UPDATE _prisma_migrations
      SET rolled_back_at = NOW()
      WHERE finished_at IS NULL AND rolled_back_at IS NULL
    `;
    console.log("✓ Marked as rolled back");

    const tablesToDrop = [
      "mentor_cohort_members",
      "mentor_cohorts",
      "mentor_group_session_attendees",
      "mentor_group_sessions",
      "mentor_office_hours",
      "mentor_sessions",
      "mentor_requests",
      "mentor_profiles",
      "showcase_likes",
      "showcase_projects",
    ];

    for (const table of tablesToDrop) {
      try {
        await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS \`${table}\``);
        console.log(`   ✓ Dropped ${table}`);
      } catch (_) {}
    }

    console.log("✅ Migration resolution complete!");
  } catch (error) {
    console.error("❌ Error resolving migrations:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

resolveMigrations();
