import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(1),
  NEXTAUTH_URL: z.string().url().optional(),
  /** When true (default), payments complete instantly without a real PSP. */
  PAYMENT_SANDBOX: z
    .string()
    .optional()
    .transform((v) => v !== "false" && v !== "0"),
  GMAIL_USER: z.string().optional(),
  GMAIL_APP_PASSWORD: z.string().optional(),
  CONTACT_INBOX: z.string().email().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

let cached: AppEnv | null = null;

/** Validated server env — call from server code only. */
export function getEnv(): AppEnv {
  if (cached) return cached;
  cached = envSchema.parse(process.env);
  return cached;
}

export function isPaymentSandbox(): boolean {
  return getEnv().PAYMENT_SANDBOX;
}

export function getSiteUrl(): string {
  const env = getEnv();
  if (env.NEXTAUTH_URL) return env.NEXTAUTH_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
