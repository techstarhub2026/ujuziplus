import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

/** Reliable auth for /api/upload — getToken reads cookies from the request directly. */
export async function getUploadUserId(req: NextRequest): Promise<string | null> {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (token) {
    if (token.isActive === false) return null;
    const id = (token.id as string | undefined) ?? token.sub;
    if (id) return id;
  }

  // Fallback for environments where getToken misses the cookie
  const session = await getServerSession(authOptions);
  return session?.user?.id ?? null;
}
