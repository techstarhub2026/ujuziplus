import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { initiateUssdPush, generateCheckoutLink } from "@/lib/clickpesa";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as {
      orderId: string;
      method: string;
      phoneNumber?: string;
    };

    const { orderId, method, phoneNumber } = body;

    if (!orderId || !method) {
      return NextResponse.json({ error: "orderId and method are required" }, { status: 400 });
    }

    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId: session.user.id,
        status: { in: ["PENDING", "PROCESSING"] },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Order not found or already processed." },
        { status: 404 }
      );
    }

    const amount = Math.round(Number(order.total));
    // Use our order ID as the ClickPesa orderReference for easy status lookups
    const orderReference = orderId;

    if (method === "CARD") {
      const user = session.user as {
        id: string;
        email?: string | null;
        fullName?: string | null;
      };

      const result = await generateCheckoutLink({
        totalPrice: amount,
        orderReference,
        orderCurrency: "TZS",
        customerName: user.fullName ?? undefined,
        customerEmail: user.email ?? undefined,
        description: "UjuziLab course / kit purchase",
        callbackUrl: `${process.env.NEXTAUTH_URL}/api/payments/clickpesa/webhook`,
      });

      await db.order.update({
        where: { id: orderId },
        data: { status: "PROCESSING", paymentRef: `CP-CARD-${orderReference}` },
      });

      return NextResponse.json({ type: "checkout", checkoutLink: result.checkoutLink });
    }

    // Mobile money — USSD push
    if (!phoneNumber) {
      return NextResponse.json(
        { error: "phoneNumber is required for mobile money payments" },
        { status: 400 }
      );
    }

    // Normalize to 255XXXXXXXXX
    const digits = phoneNumber.replace(/\D/g, "");
    const normalized = digits.startsWith("255")
      ? digits
      : digits.startsWith("0")
      ? `255${digits.slice(1)}`
      : `255${digits}`;

    if (normalized.length !== 12) {
      return NextResponse.json({ error: "Invalid Tanzanian phone number." }, { status: 400 });
    }

    const result = await initiateUssdPush({
      amount,
      currency: "TZS",
      orderReference,
      phoneNumber: normalized,
    });

    await db.order.update({
      where: { id: orderId },
      data: { status: "PROCESSING", paymentRef: result.id },
    });

    return NextResponse.json({
      type: "ussd",
      transactionId: result.id,
      status: result.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment initiation failed.";
    console.error("[clickpesa/initiate]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
