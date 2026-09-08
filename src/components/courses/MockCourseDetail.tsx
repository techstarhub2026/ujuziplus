"use client";

/**
 * MockCourseDetail — wraps the original course detail UI for mock/demo courses.
 * Keeps the existing Zustand enrollment flow unchanged.
 */

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { notFound } from "next/navigation";
import { Star, Clock, Users, Play, Check, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ImageContainer, OptimizedImage } from "@/components/shared/OptimizedImage";
import { reviews } from "@/data/mock/extended";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/store/cartStore";
import { useAppStore } from "@/store/appStore";

// Minimal types matching the mock data shape
type MockCourse = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  thumbnailUrl: string;
  level: string;
  category: string;
  durationHours: number;
  isFree: boolean;
  price: number;
  discountPrice: number | null;
  rating: number;
  totalReviews: number;
  totalEnrollments: number;
  whatYouLearn: string[];
  instructor: { fullName: string; avatarUrl?: string | null; username: string };
};

type MockLesson = {
  id: string;
  slug: string;
  title: string;
  type: string;
  isFreePreview?: boolean;
  durationMinutes?: number;
};

type MockModule = {
  id: string;
  title: string;
  lessons: MockLesson[];
};

export function MockCourseDetail({
  course,
  curriculum,
  userId: _userId,
}: {
  course: MockCourse;
  curriculum: MockModule[];
  userId: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isPreview = searchParams.get("preview") === "instructor";
  const addItem = useCartStore((s) => s.addItem);
  const enrollFree = useAppStore((s) => s.enrollFree);
  const isEnrolled = useAppStore((s) => s.isEnrolled);
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const isWishlisted = useAppStore((s) => s.isWishlisted);

  if (!course) notFound();

  const enrolled = isEnrolled(course.id);
  const wishlisted = isWishlisted(course.id);

  const handleEnroll = () => {
    if (enrolled) { router.push(`/learn/${course.slug}/introduction`); return; }
    if (course.isFree) {
      enrollFree(course.id, course.slug);
      router.push(`/learn/${course.slug}/introduction`);
      return;
    }
    addItem({
      kind: "course",
      courseId: course.id,
      title: course.title,
      price: course.discountPrice ?? course.price,
      thumbnailUrl: course.thumbnailUrl,
    });
    router.push("/cart");
  };

  return (
    <div className="bg-surface-muted pb-24 lg:pb-8">
      {isPreview && (
        <div className="bg-amber-500 text-amber-950 text-center py-2 text-sm font-medium">
          Instructor preview — <Link href="/instructor/courses" className="underline">Back to editor</Link>
        </div>
      )}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <ImageContainer className="mb-6 rounded-xl">
              <OptimizedImage
                src={course.thumbnailUrl}
                alt={course.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 66vw"
                className="opacity-90"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-brand shadow-lg"
                >
                  <Play className="h-8 w-8 fill-brand" />
                </button>
              </div>
            </ImageContainer>

            <h1 className="font-display text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="mt-2 text-lg text-gray-600">{course.subtitle}</p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {course.rating} ({course.totalReviews} reviews)
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />{course.totalEnrollments.toLocaleString()} students
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />{course.durationHours} hours
              </span>
              <Badge>{course.level}</Badge>
            </div>

            <Card className="mt-8">
              <h2 className="mb-4 text-xl font-semibold">What you&apos;ll learn</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {course.whatYouLearn.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />{item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="mt-6">
              <h2 className="mb-4 text-xl font-semibold">Course curriculum</h2>
              <div className="space-y-4">
                {curriculum.map((mod) => (
                  <div key={mod.id} className="rounded-lg border border-gray-100">
                    <div className="bg-gray-50 px-4 py-3 font-medium text-sm">{mod.title}</div>
                    <ul>
                      {mod.lessons.map((lesson) => (
                        <li key={lesson.id} className="flex items-center justify-between border-t border-gray-50 px-4 py-3 text-sm">
                          <span className="flex items-center gap-2">
                            <Play className="h-4 w-4 text-gray-400" />
                            {lesson.title}
                            {lesson.isFreePreview && (
                              <Badge variant="success" className="text-[10px]">Preview</Badge>
                            )}
                          </span>
                          {enrolled || lesson.isFreePreview ? (
                            <Link href={`/learn/${course.slug}/${lesson.slug}`} className="text-brand hover:underline text-xs">
                              {enrolled ? "Open" : "Preview"}
                            </Link>
                          ) : (
                            <span className="text-gray-400 text-xs">{lesson.durationMinutes} min</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="mt-6">
              <h2 className="mb-4 text-xl font-semibold">Reviews</h2>
              {reviews.map((r) => (
                <div key={r.id} className="mb-4 border-b pb-4 last:border-0">
                  <div className="flex gap-1 text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-2 text-sm">{r.comment}</p>
                  <p className="text-xs text-gray-500 mt-1">{r.user} · {r.date}</p>
                </div>
              ))}
            </Card>

            <Card className="mt-6">
              <h2 className="mb-4 text-xl font-semibold">Instructor</h2>
              <div className="flex items-center gap-4">
                <Avatar src={course.instructor.avatarUrl ?? undefined} alt={course.instructor.fullName} size="lg" />
                <div>
                  <Link href={`/profile/${course.instructor.username}`} className="font-semibold hover:text-brand">
                    {course.instructor.fullName}
                  </Link>
                  <p className="text-sm text-gray-500">STEM Instructor · {course.category}</p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <div className="mb-4 text-center">
                {course.isFree ? (
                  <div className="text-3xl font-bold text-green-600">Free</div>
                ) : (
                  <>
                    {course.discountPrice && (
                      <div className="text-sm text-gray-400 line-through">{formatCurrency(course.price)}</div>
                    )}
                    <div className="text-3xl font-bold text-brand">
                      {formatCurrency(course.discountPrice ?? course.price)}
                    </div>
                  </>
                )}
              </div>
              <Button className="w-full" size="lg" onClick={handleEnroll}>
                {enrolled ? "Go to course" : course.isFree ? "Enroll Free" : "Add to Cart"}
              </Button>
              <Button variant="outline" className="mt-2 w-full" onClick={() => toggleWishlist(course.id)}>
                <Heart className={`h-4 w-4 mr-2 ${wishlisted ? "fill-red-500 text-red-500" : ""}`} />
                {wishlisted ? "In wishlist" : "Add to Wishlist"}
              </Button>
              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li>✓ Full lifetime access</li>
                <li>✓ Certificate of completion</li>
                <li>✓ Mobile and desktop access</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-4 lg:hidden">
        <Button className="w-full" size="lg" onClick={handleEnroll}>
          {enrolled ? "Go to course" : course.isFree ? "Enroll Free" : formatCurrency(course.discountPrice ?? course.price)}
        </Button>
      </div>
    </div>
  );
}
