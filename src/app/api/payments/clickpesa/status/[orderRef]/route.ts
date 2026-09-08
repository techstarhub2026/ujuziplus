import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { queryPayments } from "@/lib/clickpesa";

export async function GET(
  _req: NextRequest,
  { params }: { params: { orderRef: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderRef } = params;

  try {
    // Check our DB first — if already COMPLETED the webhook beat us here
    const order = await db.order.findFirst({
      where: { id: orderRef, userId: session.user.id },
      select: { status: true, paymentRef: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (order.status === "COMPLETED") {
      return NextResponse.json({ status: "COMPLETED" });
    }

    if (order.status === "FAILED" || order.status === "REFUNDED") {
      return NextResponse.json({ status: "FAILED" });
    }

    // Query ClickPesa for live status
    const records = await queryPayments(orderRef);

    if (records.length === 0) {
      return NextResponse.json({ status: "PENDING" });
    }

    const latest = records.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )[0];

    return NextResponse.json(
      { status: latest.status, paymentReference: latest.paymentReference },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: unknown) {
    console.error("[clickpesa/status]", err);
    return NextResponse.json({ error: "Status check failed." }, { status: 500 });
  }
}
