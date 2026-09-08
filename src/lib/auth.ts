/**
 * NextAuth configuration.
 * Strategy: JWT (no DB sessions in Phase 0 — fast, simple).
 * Provider: Email + password (credentials).
 */
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

/** How often JWT re-validates role / active status from DB */
const ROLE_CHECK_MS = 60_000;
/** How often JWT refreshes profile fields (name, avatar) from DB */
const PROFILE_SYNC_MS = 5 * 60_000;

export const authOptions: AuthOptions = {
  // ─── Provider ──────────────────────────────────────────────────────────────
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        if (!user || !user.isActive) return null;
        if (user.role === "INSTRUCTOR" && user.instructorStatus !== "APPROVED") return null;

        const passwordOk = await compare(credentials.password, user.passwordHash);
        if (!passwordOk) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          fullName: user.fullName,
          username: user.username,
          role: user.role,
          avatarUrl: user.avatarUrl ?? undefined,
        };
      },
    }),
  ],

  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },

  callbacks: {
    async jwt({ token, user, trigger }) {
      const now = Date.now();

      if (user) {
        token.id = user.id;
        token.role = (user as { role: Role }).role;
        token.fullName = (user as { fullName: string }).fullName;
        token.username = (user as { username: string }).username;
        token.avatarUrl = (user as { avatarUrl?: string }).avatarUrl;
        token.isActive = true;
        token.lastRoleCheck = now;
        token.lastProfileSync = now;
        return token;
      }

      if (!token.id) return token;

      const lastRoleCheck = (token.lastRoleCheck as number) ?? 0;
      const lastProfileSync = (token.lastProfileSync as number) ?? 0;
      const forceSync = trigger === "update";
      const needRoleCheck = forceSync || now - lastRoleCheck > ROLE_CHECK_MS;
      const needProfileSync = forceSync || now - lastProfileSync > PROFILE_SYNC_MS;

      if (!needRoleCheck && !needProfileSync) return token;

      const dbUser = await db.user.findUnique({
        where: { id: token.id as string },
        select: {
          isActive: true,
          role: true,
          fullName: true,
          username: true,
          avatarUrl: true,
          instructorStatus: true,
        },
      });

      if (!dbUser) {
        // Stale JWT after re-seed or deleted user — treat as signed out
        token.id = undefined;
        token.isActive = false;
        token.lastRoleCheck = now;
        return token;
      }

      // Revoke session if an approved instructor is later rejected/reverted
      const instructorRevoked =
        dbUser.role === "INSTRUCTOR" && dbUser.instructorStatus !== "APPROVED";

      token.isActive = dbUser.isActive && !instructorRevoked;
      token.role = dbUser.role;
      token.lastRoleCheck = now;

      if (needProfileSync) {
        token.fullName = dbUser.fullName;
        token.username = dbUser.username;
        token.avatarUrl = dbUser.avatarUrl ?? undefined;
        token.lastProfileSync = now;
      }

      return token;
    },
    async session({ session, token }) {
      if (!token.id || token.isActive === false) {
        return { ...session, user: undefined };
      }
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.fullName = token.fullName as string;
        session.user.username = token.username as string;
        session.user.avatarUrl = token.avatarUrl as string | undefined;
        session.user.isActive = true;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
