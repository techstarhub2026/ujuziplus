"use client";

/**
 * DbCourseDetail — course detail page for real DB courses.
 * Handles enrollment via server action, shows real curriculum.
 */

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Clock, Users, Play, BookOpen, ChevronDown, ChevronUp, Loader2, ShoppingCart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { formatCurrency } from "@/lib/utils";
import { enrollInCourse } from "@/lib/actions/enrollments";
import { useCartStore } from "@/store/cartStore";
import { NewDiscussionForm } from "@/components/community/NewDiscussionForm";
import { DiscussionList } from "@/components/community/DiscussionList";
import { CourseWishlistButton } from "@/components/courses/CourseWishlistButton";
import { staggerContainer, fadeUp, easeOut } from "@/lib/motion";
import { RevealStagger, RevealItem } from "@/components/motion/RevealStagger";

// ─── Types (mirroring Prisma return) ─────────────────────────────────────────

type LessonSummary = {
  id: string;
  slug: string;
  title: string;
  type: string;
  isFreePreview: boolean;
  durationSeconds: number | null;
};

type ModuleWithLessons = {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonSummary[];
};

type Instructor = {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  username: string;
  bio: string | null;
};

type CourseDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  level: string;
  language: string;
  category: string | null;
  isFree: boolean;
  price: number | null;
  discountPrice: number | null;
  durationHours: number;
  whatYouLearn: unknown;
  enableCert: boolean;
  status?: string;
  instructor: Instructor;
  modules: ModuleWithLessons[];
  _count: { enrollments: number };
};

type EnrollmentData = {
  id: string;
  completedAt: Date | null;
  progress: { lessonId: string }[];
} | null;

// ─── Curriculum accordion ─────────────────────────────────────────────────────

function CurriculumAccordion({
  modules,
  courseSlug,
  isEnrolled,
}: {
  modules: ModuleWithLessons[];
  courseSlug: string;
  isEnrolled: boolean;
}) {
  const [open, setOpen] = useState<Set<string>>(
    new Set(modules.slice(0, 1).map((m) => m.id))
  );

  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);

  function toggle(id: string) {
    setOpen((prev) => {
      const n = new Set(Array.from(prev));
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  return (
    <Card className="mt-6 overflow-hidden">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="section-accent-title text-lg">Course curriculum</h2>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          {modules.length} modules · {totalLessons} lessons
        </span>
      </div>
      <div className="space-y-2">
        {modules.map((mod) => (
          <div key={mod.id} className="overflow-hidden rounded-xl border border-gray-100">
            <button
              type="button"
              onClick={() => toggle(mod.id)}
              className="flex w-full items-center justify-between bg-gray-50/80 px-4 py-3.5 text-left transition hover:bg-gray-100/80"
            >
              <span className="font-medium text-sm">{mod.title}</span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-gray-400">{mod.lessons.length} lessons</span>
                {open.has(mod.id)
                  ? <ChevronUp className="h-4 w-4 text-gray-400" />
                  : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {open.has(mod.id) && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <ul>
                    {mod.lessons.map((lesson) => (
                      <li
                        key={lesson.id}
                        className="flex items-center justify-between border-t border-gray-50 px-4 py-2.5 text-sm transition-colors hover:bg-brand/5"
                      >
                        <span className="flex items-center gap-2">
                          <Play className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                          <span>{lesson.title}</span>
                          {lesson.isFreePreview && (
                            <Badge variant="success" className="text-[10px]">Preview</Badge>
                          )}
                        </span>
                        {isEnrolled || lesson.isFreePreview ? (
                          <Link
                            href={`/learn/${courseSlug}/${lesson.slug || lesson.id}`}
                            className="shrink-0 text-brand hover:underline text-xs font-medium"
                          >
                            {isEnrolled ? "Open" : "Preview"}
                          </Link>
                        ) : (
                          <span className="text-xs text-gray-400 shrink-0">
                            {lesson.durationSeconds
                              ? `${Math.round(lesson.durationSeconds / 60)} min`
                              : "–"}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type QnAPost = {
  id: string;
  title: string;
  channel: string;
  isPinned: boolean;
  isResolved: boolean;
  createdAt: Date;
  author: { id: string; fullName: string; username: string; avatarUrl: string | null };
  _count: { replies: number; likes: number };
};

export function DbCourseDetail({
  course,
  userId,
  enrollment,
  courseDiscussions = [],
  wishlisted = false,
}: {
  course: CourseDetail;
  userId: string | null;
  enrollment: EnrollmentData;
  courseDiscussions?: QnAPost[];
  wishlisted?: boolean;
}) {
  const router = useRouter();
  const { addItem, items: cartItems } = useCartStore();
  const [activeTab, setActiveTab] = useState<"overview" | "qna">("overview");
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");
  const [addedToCart, setAddedToCart] = useState(false);

  const isEnrolled = !!enrollment;
  const objectives: string[] = Array.isArray(course.whatYouLearn)
    ? (course.whatYouLearn as string[]).filter(Boolean)
    : [];
  const price = Number(course.price ?? 0);
  const discountPrice = course.discountPrice ? Number(course.discountPrice) : null;
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const effectivePrice = discountPrice ?? price;
  const isDraftPreview = course.status && course.status !== "PUBLISHED";

  const firstLesson = course.modules[0]?.lessons[0];
  const inCart = cartItems.some(
    (i) => i.kind === "course" && i.courseId === course.id
  );

  function handleAddToCart() {
    if (!userId) {
      router.push(`/auth/login?callbackUrl=/courses/${course.slug}`);
      return;
    }
    addItem({
      kind: "course",
      courseId: course.id,
      title: course.title,
      price: effectivePrice,
      thumbnailUrl: course.thumbnailUrl ?? "",
    });
    setAddedToCart(true);
    setTimeout(() => router.push("/cart"), 600);
  }

  async function handleEnroll() {
    if (!userId) {
      router.push(`/auth/login?callbackUrl=/courses/${course.slug}`);
      return;
    }
    if (isEnrolled) {
      if (firstLesson) {
        router.push(`/learn/${course.slug}/${firstLesson.slug || firstLesson.id}`);
      }
      return;
    }
    if (!course.isFree) {
      handleAddToCart();
      return;
    }
    setEnrolling(true);
    setEnrollError("");
    const res = await enrollInCourse(userId, course.id);
    setEnrolling(false);
    if (!res.success) { setEnrollError(res.error); return; }
    if (firstLesson) {
      router.push(`/learn/${course.slug}/${firstLesson.slug || firstLesson.id}`);
    } else {
      router.push(`/dashboard/my-courses`);
    }
  }

  return (
    <div className="learner-canvas pb-24 lg:pb-8">
      {isDraftPreview && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-900">
          Preview mode — this course is not public yet ({course.status?.replace("_", " ").toLowerCase()}).
        </div>
      )}

      {/* Hero banner */}
      <div className="relative overflow-hidden bg-gray-900">
        {course.thumbnailUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={course.thumbnailUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/90 to-gray-900/70" />
        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumbs
            theme="dark"
            className="mb-4"
            items={[
              { label: "Courses", href: "/courses" },
              { label: course.title },
            ]}
          />
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="bg-brand/20 text-white border-0 shadow-none backdrop-blur-none">
              {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
            </Badge>
            {course.category && (
              <Badge variant="outline" className="border-white/30 text-white/90 bg-white/10">
                {course.category}
              </Badge>
            )}
            {course.isFree && (
              <Badge variant="success">Free</Badge>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl text-balance">
            {course.title}
          </h1>
          {course.subtitle && (
            <p className="mt-3 max-w-2xl text-lg text-white/80">{course.subtitle}</p>
          )}
          <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {course._count.enrollments.toLocaleString()} students
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {course.durationHours > 0 ? `${course.durationHours}h` : `${totalLessons} lessons`}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4" />
              {course.language}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tab bar */}
            <div className="mb-6 flex w-fit gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
              {(["overview", "qna"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab
                      ? "bg-brand text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                  }`}
                >
                  {tab === "overview" ? (
                    <><BookOpen className="h-3.5 w-3.5" />Overview</>
                  ) : (
                    <><MessageSquare className="h-3.5 w-3.5" />Q&amp;A
                      {courseDiscussions.length > 0 && (
                        <span className="ml-1 rounded-full bg-brand/10 px-1.5 py-0.5 text-xs text-brand">
                          {courseDiscussions.length}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: easeOut }}
            >
              {activeTab === "overview" ? (<>
                {objectives.length > 0 && (
                  <Card className="mt-0">
                    <h2 className="section-accent-title mb-4 text-lg">What you&apos;ll learn</h2>
                    <motion.ul
                      className="grid gap-2 sm:grid-cols-2"
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                    >
                      {objectives.map((item, i) => (
                        <motion.li key={i} variants={fadeUp} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                          {item}
                        </motion.li>
                      ))}
                    </motion.ul>
                  </Card>
                )}

                {course.description && (
                  <Card className="mt-6">
                    <h2 className="section-accent-title mb-3 text-lg">About this course</h2>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{course.description}</p>
                  </Card>
                )}

                <CurriculumAccordion
                  modules={course.modules}
                  courseSlug={course.slug}
                  isEnrolled={isEnrolled}
                />

                <Card className="mt-6 transition-all duration-300 hover:shadow-md">
                  <h2 className="section-accent-title mb-4 text-lg">Instructor</h2>
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={course.instructor.avatarUrl ?? undefined}
                      alt={course.instructor.fullName}
                      size="lg"
                    />
                    <div>
                      <Link
                        href={`/profile/${course.instructor.username}`}
                        className="font-semibold hover:text-brand transition-colors"
                      >
                        {course.instructor.fullName}
                      </Link>
                      {course.instructor.bio && (
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {course.instructor.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </>) : (
                /* Q&A tab */
                <div className="space-y-5">
                  {userId ? (
                    <NewDiscussionForm
                      channel="qna"
                      userId={userId}
                      courseId={course.id}
                      compact
                    />
                  ) : (
                    <p className="text-sm text-gray-500">
                      <Link href={`/auth/login?callbackUrl=/courses/${course.slug}`} className="text-brand underline">
                        Sign in
                      </Link>{" "}
                      to ask a question.
                    </p>
                  )}
                  <DiscussionList
                    items={courseDiscussions}
                    channel="qna"
                    userId={userId ?? ""}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          </div>

          {/* Sticky enrollment card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24 overflow-hidden p-0 shadow-card-hover ring-1 ring-gray-100">
              {course.thumbnailUrl && (
                <div className="relative aspect-video overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
              <div className="mb-4 text-center">
                {course.isFree ? (
                  <div className="text-3xl font-bold text-green-600">Free</div>
                ) : (
                  <>
                    {discountPrice && (
                      <div className="text-sm text-gray-400 line-through">
                        {formatCurrency(price)}
                      </div>
                    )}
                    <div className="text-3xl font-bold text-brand">
                      {formatCurrency(discountPrice ?? price)}
                    </div>
                  </>
                )}
              </div>

              {enrollError && (
                <p className="mb-3 text-sm text-red-600 text-center">{enrollError}</p>
              )}

              {!course.isFree && !isEnrolled ? (
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleAddToCart}
                    disabled={addedToCart}
                  >
                    {addedToCart ? (
                      <><Check className="h-4 w-4 mr-2" />Added to cart</>
                    ) : inCart ? (
                      <><ShoppingCart className="h-4 w-4 mr-2" />Go to cart</>
                    ) : (
                      <><ShoppingCart className="h-4 w-4 mr-2" />Add to cart</>
                    )}
                  </Button>
                  {inCart && !addedToCart && (
                    <Button asChild variant="outline" className="w-full" size="lg">
                      <Link href="/checkout">Checkout now</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Enrolling…</>
                    : isEnrolled
                    ? "Go to course"
                    : "Enroll free"}
                </Button>
              )}

              {userId && !isEnrolled && (
                <div className="mt-2">
                  <CourseWishlistButton
                    userId={userId}
                    courseId={course.id}
                    initialWishlisted={wishlisted}
                  />
                </div>
              )}

              <ul className="mt-6 space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Full lifetime access
                </li>
                {course.enableCert && (
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" /> Certificate of completion
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" /> Mobile & desktop access
                </li>
              </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 p-4 backdrop-blur-md lg:hidden">
        <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling}>
          {isEnrolled
            ? "Go to course"
            : course.isFree
            ? "Enroll free"
            : formatCurrency(discountPrice ?? price)}
        </Button>
      </div>
    </div>
  );
}
