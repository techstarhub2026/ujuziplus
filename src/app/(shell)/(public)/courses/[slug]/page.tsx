/**
 * /courses/[slug] — Course detail (DB only)
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { getCourseForDetail, getEnrollment } from "@/lib/actions/enrollments";
import { getCourseDiscussions } from "@/lib/actions/discussions";
import { isCourseWishlisted } from "@/lib/actions/wishlist";
import { DbCourseDetail } from "@/components/courses/DbCourseDetail";
import { db } from "@/lib/db";
import { PLATFORM } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? PLATFORM.url;

/** First ~155 characters of the course's own words, cut on a word boundary. */
function summarise(text: string | null, fallback: string) {
  const clean = (text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  if (clean.length <= 155) return clean;
  return `${clean.slice(0, 152).replace(/\s+\S*$/, "")}…`;
}

/**
 * Every course shared the site's generic title and description, so a search
 * for a subject one of them teaches had nothing to match, and all of them
 * competed as the same result. Each course now carries its own.
 */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const course = await db.course
    .findUnique({
      where: { slug: params.slug },
      select: { title: true, description: true, thumbnailUrl: true, category: true, status: true },
    })
    .catch(() => null);

  if (!course || course.status !== "PUBLISHED") {
    return { title: "Course", robots: { index: false, follow: true } };
  }

  const description = summarise(
    course.description,
    `Learn ${course.title} with UjuziPlus — hands-on STEM, IoT and robotics training for learners across Tanzania.`,
  );
  const canonical = `/courses/${params.slug}`;

  return {
    title: `${course.title} — Online Course`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: `${siteUrl}${canonical}`,
      title: `${course.title} | UjuziPlus`,
      description,
      images: course.thumbnailUrl ? [{ url: course.thumbnailUrl, alt: course.title }] : undefined,
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: { slug: string };
  searchParams: { preview?: string };
}) {
  const session = await getAuthSession();
  const viewer = session?.user?.id
    ? { id: session.user.id, role: session.user.role ?? "STUDENT" }
    : null;

  const dbCourse = await getCourseForDetail(params.slug, viewer);
  if (!dbCourse) notFound();

  const userId = session?.user?.id;
  const [enrollment, courseDiscussions, wishlisted] = await Promise.all([
    userId ? getEnrollment(userId, dbCourse.id) : Promise.resolve(null),
    getCourseDiscussions(dbCourse.id),
    userId ? isCourseWishlisted(userId, dbCourse.id) : Promise.resolve(false),
  ]);

  return (
    <DbCourseDetail
      course={dbCourse}
      userId={userId ?? null}
      enrollment={enrollment}
      courseDiscussions={courseDiscussions}
      wishlisted={wishlisted}
    />
  );
}
