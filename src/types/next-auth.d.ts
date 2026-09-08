/**
 * Extend the NextAuth Session / JWT types with our custom fields.
 */
import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      fullName: string;
      username: string;
      avatarUrl?: string;
      isActive?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    fullName: string;
    username: string;
    avatarUrl?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role: Role;
    fullName: string;
    username: string;
    avatarUrl?: string;
    isActive?: boolean;
    lastRoleCheck?: number;
    lastProfileSync?: number;
  }
}
