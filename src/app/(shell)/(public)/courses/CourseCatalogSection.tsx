import { getAuthSession } from "@/lib/auth-server";
import { getPublishedCourses } from "@/lib/actions/enrollments";
import { CourseCatalog } from "@/components/courses/CourseCatalog";
import { getPageParticleSettings } from "@/components/home/PageParticleBackground";

export async function CourseCatalogSection() {
  const [session, dbCourses, particleSettings] = await Promise.all([
    getAuthSession(),
    getPublishedCourses(),
    getPageParticleSettings(),
  ]);

  const courses = dbCourses.map((c) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    subtitle: c.subtitle ?? "",
    description: c.description ?? "",
    thumbnailUrl: c.thumbnailUrl ?? "/placeholder-course.jpg",
    category: c.category ?? "General",
    level: c.level.charAt(0) + c.level.slice(1).toLowerCase(),
    durationHours: c.durationHours,
    isFree: c.isFree,
    price: Number(c.price ?? 0),
    discountPrice: c.discountPrice ? Number(c.discountPrice) : null,
    instructor: {
      fullName: c.instructor.fullName,
      avatarUrl: c.instructor.avatarUrl ?? "",
      username: c.instructor.username,
    },
    totalEnrollments: c._count.enrollments,
    rating: 0,
    totalReviews: 0,
  }));

  return (
    <CourseCatalog
      courses={courses}
      userId={session?.user?.id ?? null}
      particleSettings={particleSettings}
    />
  );
}
