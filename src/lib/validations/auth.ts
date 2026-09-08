/**
 * Zod schemas for auth forms.
 * Shared between server actions and client-side form validation.
 */
import { z } from "zod";

export const InstructorCredentialInputSchema = z.object({
  title: z.string().min(2, "Certification title is required").max(191),
  issuer: z.string().max(191).optional(),
  issueDate: z.string().optional(),
  credentialUrl: z.string().url("Enter a valid URL").optional().or(z.literal("")),
  fileUrl: z.string().optional(),
});

export const RegisterSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100),
  role: z.enum(["STUDENT", "INSTRUCTOR"]).default("STUDENT"),
});

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
