import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ count: 0 });
  }

  const count = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return NextResponse.json(
    { count },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
