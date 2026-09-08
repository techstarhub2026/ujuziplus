import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const updates = [
  ["amina-mwakyusa", "/content/avatars/mentor-amina-mwakyusa.jpg"],
  ["james-okello", "/content/avatars/mentor-james-okello.jpg"],
  ["grace-mukamana", "/content/avatars/mentor-grace-mukamana.jpg"],
];

for (const [slug, avatarUrl] of updates) {
  const res = await db.mentorProfile.updateMany({ where: { slug }, data: { avatarUrl } });
  console.log(`${slug}: ${res.count} updated`);
}

await db.$disconnect();
