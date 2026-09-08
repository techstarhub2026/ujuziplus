"use client";

import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import { ImageContainer, OptimizedImage } from "@/components/shared/OptimizedImage";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import type { Course } from "@/types/app";

export function WishlistCourseCard({ course }: { course: Course }) {
  const router = useRouter();
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const enrollFree = useAppStore((s) => s.enrollFree);
  const isEnrolled = useAppStore((s) => s.isEnrolled);
  const addToCart = useCartStore((s) => s.addItem);
  const enrolled = isEnrolled(course.id);

  const handleEnroll = (e: React.MouseEvent) => {
    e.preventDefault();
    if (enrolled) {
      router.push(`/learn/${course.slug}/introduction`);
      return;
    }
    if (course.isFree) {
      enrollFree(course.id, course.slug);
      router.push(`/learn/${course.slug}/introduction`);
    } else {
      addToCart({
        kind: "course",
        courseId: course.id,
        title: course.title,
        price: course.discountPrice ?? course.price,
        thumbnailUrl: course.thumbnailUrl,
      });
      router.push("/cart");
    }
  };

  return (
    <Card className="overflow-hidden p-0">
      <Link href={`/courses/${course.slug}`} className="block">
        <ImageContainer>
          <OptimizedImage src={course.thumbnailUrl} alt={course.title} fill sizes="(max-width: 768px) 100vw, 33vw" />
          {course.isFree && (
            <Badge variant="success" className="absolute left-3 top-3">
              Free
            </Badge>
          )}
        </ImageContainer>
      </Link>
      <div className="p-4">
        <Link href={`/courses/${course.slug}`}>
          <h3 className="font-semibold line-clamp-2 hover:text-brand">{course.title}</h3>
        </Link>
        <p className="mt-1 text-sm text-gray-500">{course.instructor.fullName}</p>
        <p className="mt-2 font-bold text-brand">
          {course.isFree ? "Free" : formatCurrency(course.discountPrice ?? course.price)}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={handleEnroll}>
            {enrolled ? "Continue" : course.isFree ? "Enroll free" : "Add to cart"}
          </Button>
          {!course.isFree && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                addToCart({
                  kind: "course",
                  courseId: course.id,
                  title: course.title,
                  price: course.discountPrice ?? course.price,
                  thumbnailUrl: course.thumbnailUrl,
                });
                useAppStore.getState().showToast("Added to cart", "success");
              }}
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(course.id);
            }}
          >
            <Heart className="h-4 w-4 fill-red-500 text-red-500" /> Remove
          </Button>
        </div>
      </div>
    </Card>
  );
}
