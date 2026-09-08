import { PrismaClient } from "@prisma/client";
import { KitIdMap } from "./kits";
import { UserIdMap } from "./users";

export type OrgIdMap = Record<string, string>;

export async function seedOrganizations(
  db: PrismaClient,
  userIds: UserIdMap,
  kitIds: KitIdMap
): Promise<OrgIdMap> {
  const orgIds: OrgIdMap = {};

  const orgs = [
    {
      slug: "dit-tanzania",
      name: "Dar es Salaam Institute of Technology",
      type: "UNIVERSITY" as const,
      logoUrl: "/content/orgs/org-dit-tanzania.png",
      adminEmail: "orgadmin.dit@ujuzilab.com",
      inventory: [
        { kitSlug: "arduino-stem-classroom-kit", quantityOnHand: 48, quantityAllocated: 12, reorderLevel: 10 },
        { kitSlug: "esp32-iot-field-kit", quantityOnHand: 20, quantityAllocated: 5, reorderLevel: 5 },
      ],
    },
    {
      slug: "makerere-innovation-hub",
      name: "Makerere Innovation Hub",
      type: "HUB" as const,
      logoUrl: "/content/orgs/org-makerere-hub.png",
      adminEmail: "orgadmin.makerere@ujuzilab.com",
      inventory: [
        { kitSlug: "arduino-stem-classroom-kit", quantityOnHand: 30, quantityAllocated: 8, reorderLevel: 8 },
        { kitSlug: "solar-learning-lab-kit", quantityOnHand: 12, quantityAllocated: 3, reorderLevel: 4 },
      ],
    },
    {
      slug: "kigali-stem-academy",
      name: "Kigali STEM Academy",
      type: "SCHOOL" as const,
      logoUrl: "/content/orgs/org-kigali-stem.png",
      adminEmail: "orgadmin.kigali@ujuzilab.com",
      inventory: [
        { kitSlug: "arduino-stem-classroom-kit", quantityOnHand: 25, quantityAllocated: 10, reorderLevel: 6 },
        { kitSlug: "esp32-iot-field-kit", quantityOnHand: 15, quantityAllocated: 4, reorderLevel: 5 },
      ],
    },
    {
      slug: "nairobi-techstar",
      name: "Nairobi TechStar Learning Centre",
      type: "HUB" as const,
      logoUrl: "/content/orgs/org-nairobi-techstar.png",
      adminEmail: "orgadmin.nairobi@ujuzilab.com",
      inventory: [
        { kitSlug: "esp32-iot-field-kit", quantityOnHand: 22, quantityAllocated: 6, reorderLevel: 6 },
        { kitSlug: "solar-learning-lab-kit", quantityOnHand: 10, quantityAllocated: 2, reorderLevel: 3 },
      ],
    },
  ];

  const instructorId = userIds["instructor@ujuzilab.com"];
  const studentId = userIds["student@ujuzilab.com"];

  for (const org of orgs) {
    const adminId = userIds[org.adminEmail];
    const memberCreates: { userId: string; role: "ADMIN" | "INSTRUCTOR" }[] = [
      { userId: adminId, role: "ADMIN" },
    ];

    if (org.slug === "dit-tanzania" && instructorId) {
      memberCreates.push({ userId: instructorId, role: "INSTRUCTOR" });
    }

    const orgRecord = await db.organization.upsert({
      where: { slug: org.slug },
      update: {
        name: org.name,
        type: org.type,
        logoUrl: org.logoUrl,
        isVerified: true,
        memberCount: memberCreates.length,
      },
      create: {
        slug: org.slug,
        name: org.name,
        type: org.type,
        logoUrl: org.logoUrl,
        isVerified: true,
        memberCount: memberCreates.length,
        members: { create: memberCreates },
        kitInventory: {
          create: org.inventory.map((inv) => ({
            kitId: kitIds[inv.kitSlug],
            quantityOnHand: inv.quantityOnHand,
            quantityAllocated: inv.quantityAllocated,
            reorderLevel: inv.reorderLevel,
          })),
        },
      },
    });

    orgIds[org.slug] = orgRecord.id;
    console.log(`  ✓ Organization: ${org.name}`);
  }

  // Student as MEMBER at 2 orgs: Nairobi TechStar and Kigali STEM Academy
  if (studentId) {
    for (const slug of ["nairobi-techstar", "kigali-stem-academy"]) {
      const orgId = orgIds[slug];
      if (orgId) {
        await db.organizationMember.upsert({
          where: { orgId_userId: { orgId, userId: studentId } },
          update: { role: "MEMBER" },
          create: { orgId, userId: studentId, role: "MEMBER" },
        });
      }
    }
    console.log("  ✓ Student memberships at Nairobi TechStar & Kigali STEM Academy");
  }

  return orgIds;
}
