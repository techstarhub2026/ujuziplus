import { NextResponse } from "next/server";
import { db } from "@/lib/db";

async function handleHeartbeat(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  const querySecret = new URL(req.url).searchParams.get("secret");
  const authorized = auth === `Bearer ${secret}` || querySecret === secret;

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await db.$queryRaw`SELECT 1`;
  return NextResponse.json({ ok: true, timestamp: new Date().toISOString() });
}

export async function GET(req: Request) {
  return handleHeartbeat(req);
}

export async function POST(req: Request) {
  return handleHeartbeat(req);
}
