/**
 * Auth server actions.
 * Called from client forms — run only on the server.
 */
"use server";

import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { assertActor } from "@/lib/auth-server";
import { sendEmail, passwordResetEmail, welcomeEmail } from "@/lib/email";
import {
  RegisterSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  InstructorCredentialInputSchema,
} from "@/lib/validations/auth";

export type UserProfileData = {
  fullName: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  linkedin: string | null;
  github: string | null;
};

export type UserPrivacyData = {
  publicProfile: boolean;
  showCoursesOnProfile: boolean;
  showCertificatesOnProfile: boolean;
};

function optionalText(value: FormDataEntryValue | null): string | null {
  const trimmed = String(value ?? "").trim();
  return trimmed || null;
}

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerUser(formData: FormData) {
  const raw = {
    fullName: formData.get("fullName") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: (formData.get("role") as string) || "STUDENT",
  };

  const result = RegisterSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { fullName, email, password, role } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  // Check duplicate email
  const existing = await db.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  // Auto-generate unique username from email prefix
  const base = normalizedEmail.split("@")[0].replace(/[^a-z0-9_]/gi, "_").toLowerCase();
  let username = base;
  let attempt = 0;
  while (await db.user.findUnique({ where: { username } })) {
    attempt++;
    username = `${base}${attempt}`;
  }

  const passwordHash = await hash(password, 12);
  const isInstructor = role === "INSTRUCTOR";

  const user = await db.user.create({
    data: {
      fullName,
      email: normalizedEmail,
      username,
      passwordHash,
      role,
      instructorStatus: isInstructor ? "PENDING" : undefined,
    },
  });

  // Send welcome email (non-blocking — don't fail registration if email fails)
  sendEmail({
    to: normalizedEmail,
    subject: "Welcome to UjuziLab!",
    html: welcomeEmail(fullName),
  }).then((result) => {
    if (!result.ok) console.error("Welcome email failed:", result.error);
  });

  if (isInstructor) {
    const credentialToken = await issueSignupCredentialToken(user.id);
    return { success: true, pendingInstructorApproval: true, credentialToken };
  }

  return { success: true, pendingInstructorApproval: false };
}

// ─── Signup certification upload (pre-approval instructor step 2) ─────────────

async function issueSignupCredentialToken(userId: string) {
  await db.signupCredentialToken.deleteMany({ where: { userId } });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour to complete step 2

  await db.signupCredentialToken.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

async function getUserIdForSignupCredentialToken(token: string) {
  if (!token) return null;
  const record = await db.signupCredentialToken.findUnique({ where: { token } });
  if (!record || record.usedAt || record.expiresAt < new Date()) return null;
  return record.userId;
}

export async function submitSignupCredentials(
  token: string,
  credentials: {
    title: string;
    issuer?: string;
    issueDate?: string;
    credentialUrl?: string;
    fileUrl?: string;
  }[]
) {
  const userId = await getUserIdForSignupCredentialToken(token);
  if (!userId) {
    return { error: "This session has expired. Please sign up again." };
  }

  const parsed = z.array(InstructorCredentialInputSchema).safeParse(
    credentials.filter((c) => c.title.trim().length > 0)
  );
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const cleaned = parsed.data.map((c) => ({ ...c, title: c.title.trim() }));

  if (cleaned.length === 0) {
    return { error: "Add at least one certification so admins can review your application." };
  }

  await db.instructorCredential.createMany({
    data: cleaned.map((c, index) => ({
      userId,
      title: c.title,
      issuer: c.issuer?.trim() || null,
      issueDate: c.issueDate ? new Date(c.issueDate) : null,
      credentialUrl: c.credentialUrl?.trim() || null,
      fileUrl: c.fileUrl?.trim() || null,
      orderIndex: index,
    })),
  });

  await db.signupCredentialToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  return { success: true };
}

// ─── Forgot password ──────────────────────────────────────────────────────────

export async function forgotPassword(formData: FormData) {
  const raw = { email: formData.get("email") as string };
  const result = ForgotPasswordSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const email = result.data.email.toLowerCase().trim();
  const user = await db.user.findUnique({ where: { email } });

  // Always return success to prevent email enumeration
  if (!user) return { success: true };

  // Invalidate old tokens for this user
  await db.passwordResetToken.deleteMany({ where: { userId: user.id } });

  // Create a new token valid for 1 hour
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

  const emailResult = await sendEmail({
    to: email,
    subject: "Reset your UjuziLab password",
    html: passwordResetEmail(resetUrl),
  });
  if (!emailResult.ok) {
    console.error("Password reset email failed:", emailResult.error);
  }

  // In development — return the URL so devs can test without email
  if (process.env.NODE_ENV === "development") {
    return { success: true, devResetUrl: resetUrl };
  }

  return { success: true };
}

// ─── Reset password ───────────────────────────────────────────────────────────

export async function resetPassword(formData: FormData) {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirm: formData.get("confirm") as string,
  };

  const result = ResetPasswordSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  const { token, password } = result.data;

  const record = await db.passwordResetToken.findUnique({ where: { token } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }

  const passwordHash = await hash(password, 12);

  // Update password and mark token as used in one transaction
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    db.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
  ]);

  return { success: true };
}

// ─── Login failure messaging ───────────────────────────────────────────────────

export async function getLoginFailureHint(
  email: string
): Promise<"pending_instructor" | "rejected_instructor" | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await db.user.findUnique({
    where: { email: normalizedEmail },
    select: { role: true, instructorStatus: true },
  });

  if (!user || user.role !== "INSTRUCTOR") return null;
  if (user.instructorStatus === "PENDING") return "pending_instructor";
  if (user.instructorStatus === "REJECTED") return "rejected_instructor";
  return null;
}

// ─── Profile read / update ─────────────────────────────────────────────────────

const profileSelect = {
  fullName: true,
  username: true,
  avatarUrl: true,
  bio: true,
  location: true,
  website: true,
  linkedin: true,
  github: true,
} as const;

const privacySelect = {
  publicProfile: true,
  showCoursesOnProfile: true,
  showCertificatesOnProfile: true,
} as const;

export async function getUserProfile(userId: string): Promise<UserProfileData | null> {
  await assertActor(userId);
  return db.user.findUnique({
    where: { id: userId },
    select: profileSelect,
  });
}

export async function getUserPrivacySettings(userId: string): Promise<UserPrivacyData | null> {
  await assertActor(userId);
  return db.user.findUnique({
    where: { id: userId },
    select: privacySelect,
  });
}

export async function updateProfile(userId: string, formData: FormData) {
  await assertActor(userId);

  const fullName = String(formData.get("fullName") ?? "").trim();
  const bio = optionalText(formData.get("bio"));
  const location = optionalText(formData.get("location"));
  const website = optionalText(formData.get("website"));
  const linkedin = optionalText(formData.get("linkedin"));
  const github = optionalText(formData.get("github"));
  const avatarUrl = optionalText(formData.get("avatarUrl"));

  if (!fullName || fullName.length < 2) {
    return { error: "Name must be at least 2 characters." };
  }

  const updated = await db.user.update({
    where: { id: userId },
    data: { fullName, bio, location, website, linkedin, github, avatarUrl },
    select: profileSelect,
  });

  revalidatePath("/dashboard/settings/profile");
  revalidatePath(`/profile/${updated.username}`);

  return { success: true, profile: updated };
}

export async function updatePrivacySettings(
  userId: string,
  prefs: UserPrivacyData
): Promise<{ success: true } | { error: string }> {
  await assertActor(userId);

  const updated = await db.user.update({
    where: { id: userId },
    data: {
      publicProfile: prefs.publicProfile,
      showCoursesOnProfile: prefs.showCoursesOnProfile,
      showCertificatesOnProfile: prefs.showCertificatesOnProfile,
    },
    select: { username: true },
  });

  revalidatePath("/dashboard/settings/privacy");
  revalidatePath(`/profile/${updated.username}`);

  return { success: true };
}

export async function changePassword(
  userId: string,
  input: { currentPassword: string; newPassword: string }
) {
  await assertActor(userId);

  const { compare, hash } = await import("bcryptjs");
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return { error: "User not found." };

  const valid = await compare(input.currentPassword, user.passwordHash);
  if (!valid) return { error: "Current password is incorrect." };

  if (input.newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  const passwordHash = await hash(input.newPassword, 12);
  await db.user.update({ where: { id: userId }, data: { passwordHash } });
  return { success: true };
}
