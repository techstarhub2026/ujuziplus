import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seed/users";
import { seedKits } from "./seed/kits";
import { seedCourses } from "./seed/courses";
import { seedOrganizations } from "./seed/organizations";
import { seedPlatformContent } from "./seed/platform-content";
import { clearPlatformData } from "./seed/clear-database";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  console.log("\n1. Seeding users...");
  const userIds = await seedUsers(db);

  console.log("\n2. Seeding kits...");
  const kitIds = await seedKits(db);

  console.log("\n3. Seeding courses...");
  const courseIds = await seedCourses(db, userIds["instructor@ujuzilab.com"]);

  console.log("\n4. Seeding organizations...");
  const orgIds = await seedOrganizations(db, userIds, kitIds);

  console.log("\n5. Seeding platform content...");
  await seedPlatformContent(db, userIds, courseIds);

  console.log("\n✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
