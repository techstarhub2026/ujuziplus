/**
 * NextAuth configuration.
 * Strategy: JWT (no DB sessions in Phase 0 — fast, simple).
 * Providers: Email + password (credentials), and Google.
 */
import type { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import type { Role } from "@prisma/client";

/**
 * Builds a username that is free, from the local part of an email address.
 * Google gives us no username, but the column is unique and required, so a
 * taken handle gets a numeric suffix rather than failing the sign-in.
 */
async function uniqueUsername(email: string) {
  const base = (email.split("@")[0] || "user")
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "")
    .slice(0, 90) || "user";

  for (let i = 0; i < 50; i++) {
    const candidate = i === 0 ? base : `${base}${i}`;
    const taken = await db.user.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
  }
  return `${base}${Date.now().toString(36)}`;
}

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
        // Google-only account: no password was ever set, so there is nothing
        // to compare against and password sign-in cannot succeed.
        if (!user.passwordHash) return null;

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

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      // Always show the account chooser, so someone signed into several
      // Google accounts is not silently logged in as the wrong one.
      authorization: { params: { prompt: "select_account" } },
    }),
  ],

  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },

  callbacks: {
    /**
     * Google hands back a verified email and nothing else this app can use
     * directly, so the account is matched on that email: an existing user
     * keeps their courses and progress, and a new one is created on the
     * spot. Only Google reaches this — the credentials provider has already
     * done its own checks in authorize() and passes straight through.
     */
    async signIn({ user, account, profile }) {
      if (account?.provider !== "google") return true;

      const email = user.email?.toLowerCase().trim();
      // Google is the one confirming the address; an unverified one must not
      // be allowed to claim an existing account that uses it.
      if (!email || (profile as { email_verified?: boolean })?.email_verified === false) {
        return false;
      }

      const existing = await db.user.findUnique({ where: { email } });

      if (existing) {
        if (!existing.isActive) return false;
        if (existing.role === "INSTRUCTOR" && existing.instructorStatus !== "APPROVED") return false;
        // Take Google's picture only when the account has none of its own,
        // so an avatar someone uploaded here is never overwritten.
        if (!existing.avatarUrl && user.image) {
          await db.user.update({ where: { id: existing.id }, data: { avatarUrl: user.image } });
        }
        user.id = existing.id;
        return true;
      }

      const created = await db.user.create({
        data: {
          email,
          fullName: user.name?.trim() || email.split("@")[0],
          username: await uniqueUsername(email),
          passwordHash: null,
          avatarUrl: user.image ?? null,
          // Google has already verified the address, so there is nothing for
          // this app to send a confirmation email about.
          emailVerified: true,
        },
      });
      user.id = created.id;
      return true;
    },

    async jwt({ token, user, trigger }) {
      const now = Date.now();

      if (user) {
        token.id = user.id;
        token.isActive = true;
        token.lastRoleCheck = now;
        token.lastProfileSync = now;

        // authorize() returns these fields, but Google's user object carries
        // only id/name/email/image — so for a Google sign-in they are read
        // from the row signIn() just matched or created.
        const fromProvider = user as Partial<{
          role: Role; fullName: string; username: string; avatarUrl?: string;
        }>;

        if (fromProvider.role && fromProvider.username && fromProvider.fullName) {
          token.role = fromProvider.role;
          token.fullName = fromProvider.fullName;
          token.username = fromProvider.username;
          token.avatarUrl = fromProvider.avatarUrl;
          return token;
        }

        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true, fullName: true, username: true, avatarUrl: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.fullName = dbUser.fullName;
          token.username = dbUser.username;
          token.avatarUrl = dbUser.avatarUrl ?? undefined;
        }
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
