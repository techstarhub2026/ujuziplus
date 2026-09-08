/**
 * Prisma client singleton.
 * Re-uses the same client across hot-reloads in development.
 */
import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync, writeFileSync } from "fs";
import os from "os";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// On Vercel the filesystem is read-only outside os.tmpdir(), and a committed
// .pem referenced only via a dynamic path isn't reliably bundled by Next's
// output file tracing. So the CA cert travels as an env var (DATABASE_CA_CERT)
// and gets written to a temp file at cold start instead of living on disk.
function resolveDatabaseUrl(): string {
  const base = process.env.DATABASE_URL ?? "";
  const caCert = process.env.DATABASE_CA_CERT;
  if (!caCert) return base;

  const certPath = path.join(os.tmpdir(), "db-ca.pem");
  if (!existsSync(certPath) || readFileSync(certPath, "utf8") !== caCert) {
    writeFileSync(certPath, caCert);
  }

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}sslcert=${certPath}`;
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: { db: { url: resolveDatabaseUrl() } },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
