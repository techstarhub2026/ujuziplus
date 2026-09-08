import { NextResponse } from "next/server";
import { sendMentorSessionReminders } from "@/lib/actions/mentors";

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await sendMentorSessionReminders();
  return NextResponse.json(result);
}
