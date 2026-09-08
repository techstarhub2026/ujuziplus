"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MediaCard, MediaCardPrice } from "@/components/shared/MediaCard";
import { formatCurrency } from "@/lib/utils";
import { toggleWishlist } from "@/lib/actions/wishlist";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/appStore";

type WishlistItem = {
  courseId: string;
  course: {
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string | null;
    isFree: boolean;
    price: unknown;
    discountPrice: unknown;
    instructor: { fullName: string };
  };
};

export function WishlistGrid({
  items,
  userId,
}: {
  items: WishlistItem[];
  userId: string;
}) {
  const router = useRouter();
  const addToCart = useCartStore((s) => s.addItem);
  const showToast = useAppStore((s) => s.showToast);

  async function remove(courseId: string) {
    const res = await toggleWishlist(userId, courseId);
    if (res.success) {
      showToast("Removed from wishlist", "info");
      router.refresh();
    }
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ course }) => {
        const price = Number(course.price ?? 0);
        const discount = course.discountPrice ? Number(course.discountPrice) : null;
        const effective = discount ?? price;

        return (
          <MediaCard
            key={course.id}
            title={course.title}
            subtitle={course.instructor.fullName}
            badges={
              course.isFree ? (
                <Badge variant="success" size="sm">
                  Free
                </Badge>
              ) : undefined
            }
            image={
              course.thumbnailUrl ? (
                <Image
                  src={course.thumbnailUrl}
                  alt={course.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  unoptimized={course.thumbnailUrl.startsWith("/content/")}
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gray-100 text-sm text-gray-400">
                  No image
                </div>
              )
            }
            footer={
              <MediaCardPrice
                isFree={course.isFree}
                price={course.isFree ? undefined : formatCurrency(effective)}
              />
            }
            actions={
              <>
                <Button asChild size="sm" variant="secondary">
                  <Link href={`/courses/${course.slug}`}>View course</Link>
                </Button>
                {!course.isFree && (
                  <Button
                    size="sm"
                    onClick={() => {
                      addToCart({
                        kind: "course",
                        courseId: course.id,
                        title: course.title,
                        price: effective,
                        thumbnailUrl: course.thumbnailUrl ?? "",
                      });
                      showToast("Added to cart", "success");
                    }}
                  >
                    <ShoppingCart className="mr-1 h-4 w-4" /> Add to cart
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(course.id)}
                >
                  <Heart className="mr-1 h-4 w-4 fill-red-500 text-red-500" /> Remove
                </Button>
              </>
            }
          />
        );
      })}
    </div>
  );
}
