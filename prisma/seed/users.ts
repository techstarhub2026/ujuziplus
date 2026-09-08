import { PrismaClient, Role } from "@prisma/client";
import { hash } from "bcryptjs";

export type UserIdMap = Record<string, string>;

interface SeedUser {
  email: string;
  fullName: string;
  username: string;
  role: Role;
  location?: string;
  bio?: string;
}

const SEED_USERS: SeedUser[] = [
  {
    email: "student@ujuzilab.com",
    fullName: "William Mwangi",
    username: "william_mwangi",
    role: "STUDENT",
    location: "Nairobi, Kenya",
    bio: "Secondary school innovator building IoT prototypes for community water monitoring.",
  },
  {
    email: "instructor@ujuzilab.com",
    fullName: "Sarah Kamau",
    username: "sarah_kamau",
    role: "INSTRUCTOR",
    location: "Dar es Salaam, Tanzania",
    bio: "Electrical engineer and UjuziLab lead instructor specialising in robotics and embedded systems for African makerspaces.",
  },
  {
    email: "admin@ujuzilab.com",
    fullName: "Platform Admin",
    username: "ujuzi_admin",
    role: "ADMIN",
    location: "East Africa",
    bio: "UjuziLab platform administrator.",
  },
  {
    email: "orgadmin.dit@ujuzilab.com",
    fullName: "Grace Mushi",
    username: "grace_dit",
    role: "ORG_ADMIN",
    location: "Dar es Salaam, Tanzania",
    bio: "Lab coordinator at Dar es Salaam Institute of Technology.",
  },
  {
    email: "orgadmin.makerere@ujuzilab.com",
    fullName: "James Okello",
    username: "james_makerere",
    role: "ORG_ADMIN",
    location: "Kampala, Uganda",
    bio: "Innovation hub manager at Makerere Innovation Hub.",
  },
  {
    email: "orgadmin.kigali@ujuzilab.com",
    fullName: "Aline Uwase",
    username: "aline_kigali",
    role: "ORG_ADMIN",
    location: "Kigali, Rwanda",
    bio: "STEM programme director at Kigali STEM Academy.",
  },
  {
    email: "orgadmin.nairobi@ujuzilab.com",
    fullName: "Peter Ochieng",
    username: "peter_nairobi",
    role: "ORG_ADMIN",
    location: "Nairobi, Kenya",
    bio: "Learning centre lead at Nairobi TechStar.",
  },
];

export async function seedUsers(db: PrismaClient): Promise<UserIdMap> {
  const passwordHash = await hash("password123", 12);
  const userIds: UserIdMap = {};

  for (const account of SEED_USERS) {
    const instructorStatus = account.role === "INSTRUCTOR" ? "APPROVED" : undefined;
    const user = await db.user.upsert({
      where: { email: account.email },
      update: {
        fullName: account.fullName,
        username: account.username,
        role: account.role,
        passwordHash,
        location: account.location,
        bio: account.bio,
        emailVerified: true,
        isActive: true,
        instructorStatus,
      },
      create: {
        email: account.email,
        fullName: account.fullName,
        username: account.username,
        role: account.role,
        passwordHash,
        location: account.location,
        bio: account.bio,
        emailVerified: true,
        isActive: true,
        instructorStatus,
      },
    });
    userIds[account.email] = user.id;
    console.log(`  ✓ ${account.role}: ${account.email}`);
  }

  return userIds;
}
