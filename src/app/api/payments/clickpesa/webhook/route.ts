import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhookChecksum, channelToPaymentMethod } from "@/lib/clickpesa";
import { processPaymentConfirmation } from "@/lib/payment-confirmation";

export async function POST(req: NextRequest) {
  try {
    const payload = (await req.json()) as Record<string, unknown>;

    // Verify checksum when a webhook secret is configured
    const secret = process.env.CLICKPESA_WEBHOOK_SECRET;
    if (secret && payload.checksum) {
      const valid = verifyWebhookChecksum(
        payload,
        String(payload.checksum),
        secret
      );
      if (!valid) {
        return NextResponse.json({ error: "Invalid checksum" }, { status: 401 });
      }
    }

    const event = String(payload.event ?? "");

    // Only act on successful payments
    if (event !== "PAYMENT_RECEIVED") {
      return NextResponse.json({ received: true });
    }

    const orderReference = String(payload.orderReference ?? "");
    const paymentRef = String(
      payload.id ?? payload.paymentReference ?? `CP-WH-${Date.now()}`
    );
    const channel = String(payload.channel ?? "");

    if (!orderReference) {
      return NextResponse.json({ error: "Missing orderReference" }, { status: 400 });
    }

    // Find order by ID (we use our order ID as the ClickPesa orderReference)
    const order = await db.order.findFirst({
      where: {
        id: orderReference,
        status: { in: ["PENDING", "PROCESSING"] },
      },
      select: { id: true, userId: true },
    });

    if (!order) {
      // Already completed or not found — still acknowledge so ClickPesa stops retrying
      return NextResponse.json({ received: true });
    }

    const method = channelToPaymentMethod(channel);

    await processPaymentConfirmation(order.id, order.userId, method, paymentRef);

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    console.error("[clickpesa/webhook]", err);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
