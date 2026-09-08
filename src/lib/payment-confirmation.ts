/**
 * Internal payment confirmation — no auth check.
 * Called from confirmPayment() server action (after auth) and the ClickPesa webhook handler.
 */
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { PaymentMethod, OrderStatus } from "@prisma/client";
import { createNotification } from "@/lib/actions/notifications";
import { sendEmail, paymentReceiptEmail, programRegistrationEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";

const APP_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

const VALID_METHODS = new Set<string>([
  "MPESA",
  "AIRTEL_MONEY",
  "TIGO_PESA",
  "HALOPESA",
  "CARD",
  "BANK_TRANSFER",
]);

export async function processPaymentConfirmation(
  orderId: string,
  userId: string,
  method: string,
  paymentRef: string
): Promise<{ success: boolean; error?: string }> {
  const order = await db.order.findFirst({
    where: { id: orderId, userId },
    include: { items: true },
  });

  if (!order) return { success: false, error: "Order not found." };

  // Idempotent — already completed means success
  if (order.status === "COMPLETED") return { success: true };

  if (!["PENDING", "PROCESSING"].includes(order.status)) {
    return { success: false, error: "Order cannot be confirmed in its current state." };
  }

  const pm = VALID_METHODS.has(method) ? (method as PaymentMethod) : null;

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        paymentMethod: pm ?? undefined,
        paymentRef,
      },
    });

    for (const item of order.items) {
      if (item.courseId) {
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId, courseId: item.courseId } },
          create: { userId, courseId: item.courseId },
          update: {},
        });
      }
      if (item.kitId) {
        await tx.kitPurchase.upsert({
          where: { userId_kitId: { userId, kitId: item.kitId } },
          create: { userId, kitId: item.kitId, orderId },
          update: { orderId },
        });
        await tx.kit.update({
          where: { id: item.kitId },
          data: { inventoryCount: { decrement: 1 } },
        });
      }
      if (item.programId) {
        const prog = await tx.program.findUnique({ where: { id: item.programId } });
        if (prog) {
          await tx.programRegistration.upsert({
            where: { userId_programId: { userId, programId: item.programId } },
            create: { userId, programId: item.programId, orderId },
            update: { orderId },
          });
          await tx.program.update({
            where: { id: item.programId },
            data: {
              enrolledCount: { increment: 1 },
              status: prog.enrolledCount + 1 >= prog.seats ? "FULL" : "OPEN",
            },
          });
        }
      }
    }
  });

  // Fetch completed order for notification / email
  const completed = await db.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: {
        include: {
          course: { select: { title: true } },
          kit: { select: { title: true } },
          program: { select: { title: true, type: true, startDate: true, format: true, slug: true } },
        },
      },
      user: { select: { fullName: true, email: true } },
    },
  });

  if (completed?.user.email) {
    const labels = completed.items.map(
      (i) => i.course?.title ?? i.kit?.title ?? i.program?.title ?? "Item"
    );
    const summary =
      labels.length <= 2
        ? labels.join(" and ")
        : `${labels.slice(0, 2).join(", ")} and ${labels.length - 2} more`;

    // Send dedicated program registration email for each program item
    for (const item of completed.items) {
      if (item.program) {
        const startDate = item.program.startDate
          ? new Date(item.program.startDate).toLocaleDateString("en-TZ", {
              day: "numeric", month: "long", year: "numeric",
            })
          : "TBD";
        await sendEmail({
          to: completed.user.email,
          subject: `[ujuziPlus] Registration confirmed — ${item.program.title}`,
          html: programRegistrationEmail({
            fullName: completed.user.fullName ?? "Learner",
            programTitle: item.program.title,
            programType: item.program.type,
            startDate,
            format: item.program.format.replace("_", " "),
            price: formatCurrency(Number(item.price)),
            programUrl: `${APP_URL}/programs/${item.program.slug}`,
            dashboardUrl: `${APP_URL}/dashboard/programs`,
          }),
        });
        await createNotification(userId, {
          type: "PROGRAM_REGISTERED",
          title: "Program registration confirmed",
          message: `Payment confirmed. You are now registered for "${item.program.title}".`,
          href: `/programs/${item.program.slug}`,
          prefCategory: "Program updates",
        });
      }
    }

    await createNotification(userId, {
      type: "SYSTEM",
      title: "Payment confirmed",
      message: `Your order of ${formatCurrency(Number(completed.total))} is complete.`,
      href: `/checkout/success/${orderId}`,
      prefCategory: "Payment receipts",
    });

    const emailResult = await sendEmail({
      to: completed.user.email,
      subject: `[UjuziLab] Payment receipt`,
      html: paymentReceiptEmail({
        fullName: completed.user.fullName,
        orderId,
        total: formatCurrency(Number(completed.total)),
        itemSummary: summary,
      }),
    });
    if (!emailResult.ok) {
      console.error("[payment-confirmation] Receipt email failed:", emailResult.error);
    }
  }

  revalidatePath("/dashboard/my-courses");
  revalidatePath("/dashboard/my-kits");
  revalidatePath("/dashboard/settings/billing");
  revalidatePath("/kits");

  return { success: true };
}
