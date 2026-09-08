/**
 * /checkout/success/[orderId] — Order confirmation page
 */

import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { getOrder } from "@/lib/actions/orders";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionBanner } from "@/components/shared/LearnerPageHero";
import { CheckCircle2, BookOpen, Package, ArrowRight } from "lucide-react";
import { getAuthSession } from "@/lib/auth-server";

interface Props {
  params: { orderId: string };
}

export default async function OrderSuccessPage({ params }: Props) {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");

  const order = await getOrder(params.orderId, session.user.id);
  if (!order) notFound();

  const totalPaid = Number(order.total);
  const courseItems = order.items.filter((i) => i.course);
  const kitItems = order.items.filter((i) => i.kit);

  return (
    <div className="learner-canvas mx-auto max-w-xl px-4 py-12">
      <SectionBanner banner="checkout" className="mb-8 p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
          <CheckCircle2 className="h-10 w-10 text-white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-white drop-shadow-md">Payment confirmed!</h1>
        <p className="mt-2 text-sm text-white/90">
          Thank you for your purchase.
          {courseItems.length > 0 && kitItems.length > 0
            ? " Your courses and kits are ready."
            : courseItems.length > 0
              ? ` You have been enrolled in ${courseItems.length === 1 ? "your course" : `${courseItems.length} courses`}.`
              : ` Your ${kitItems.length === 1 ? "kit is" : "kits are"} now in your library.`}
        </p>
      </SectionBanner>

      <Card className="mb-6 shadow-card-hover ring-1 ring-gray-100">
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>
            Order ID:{" "}
            <span className="font-mono text-gray-700">{order.id.slice(-8).toUpperCase()}</span>
          </span>
          <span>{formatDate(order.createdAt)}</span>
        </div>

        <ul className="space-y-4">
          {order.items.map((item) => {
            const title = item.course?.title ?? item.kit?.title ?? "Item";
            const thumb = item.course?.thumbnailUrl ?? item.kit?.thumbnailUrl;
            const sub = item.course
              ? `by ${item.course.instructor?.fullName ?? "Instructor"}`
              : "Learning kit";
            const href = item.course
              ? `/courses/${item.course.slug}`
              : item.kit
                ? `/kits/${item.kit.slug}`
                : "#";

            return (
              <li key={item.id} className="flex gap-3 items-start">
                <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {thumb ? (
                    <Image src={thumb} alt={title} fill className="object-cover" sizes="80px" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      {item.kit ? (
                        <Package className="h-5 w-5 text-gray-300" />
                      ) : (
                        <BookOpen className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  )}
                </div>
                <div className="flex flex-1 justify-between">
                  <div>
                    <Link href={href} className="font-medium line-clamp-2 hover:text-brand">
                      {title}
                    </Link>
                    <p className="text-xs text-gray-400">{sub}</p>
                  </div>
                  <span className="shrink-0 font-medium text-sm ml-2">
                    {formatCurrency(Number(item.price))}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-4 border-t border-gray-100 pt-4 text-sm space-y-1">
          {Number(order.discountAmount) > 0 && (
            <>
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                <span>− {formatCurrency(Number(order.discountAmount))}</span>
              </div>
            </>
          )}
          <div className="flex justify-between font-bold text-base">
            <span>Total paid</span>
            <span className="text-brand">{formatCurrency(totalPaid)}</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col gap-3">
        {courseItems.length === 1 && courseItems[0].course && (
          <Button asChild size="lg" className="w-full">
            <Link href={`/courses/${courseItems[0].course.slug}`}>
              Start learning <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
        {courseItems.length > 1 && (
          <Button asChild size="lg" className="w-full">
            <Link href="/dashboard/my-courses">
              Go to My Courses <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
        {kitItems.length > 0 && (
          <Button asChild variant={courseItems.length > 0 ? "outline" : "primary"} size="lg" className="w-full">
            <Link href={kitItems.length === 1 && kitItems[0].kit ? `/kits/${kitItems[0].kit.slug}` : "/kits"}>
              View your kit{kitItems.length !== 1 ? "s" : ""}
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="w-full">
          <Link href="/courses">Continue browsing</Link>
        </Button>
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        A receipt has been sent to {session.user.email}. Need help?{" "}
        <Link href="/contact" className="underline hover:text-brand">
          Contact support
        </Link>
      </p>
    </div>
  );
}
