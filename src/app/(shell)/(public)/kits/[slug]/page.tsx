import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { getKitBySlug } from "@/lib/actions/kits";
import { userOwnsKit } from "@/lib/actions/orders";
import { db } from "@/lib/db";
import { KitDetailView } from "@/components/kits/KitDetailView";

function parseJsonList(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  return [];
}

export default async function KitDetailPage({ params }: { params: { slug: string } }) {
  const kit = await getKitBySlug(params.slug);
  if (!kit) notFound();

  const session = await getAuthSession();
  const owned = session?.user?.id ? await userOwnsKit(session.user.id, kit.id) : false;

  const slugs = parseJsonList(kit.relatedCourseSlugs);
  const relatedCourses =
    slugs.length > 0
      ? await db.course.findMany({
          where: { slug: { in: slugs }, status: "PUBLISHED" },
          select: { slug: true, title: true },
        })
      : [];

  return (
    <KitDetailView
      owned={owned}
      relatedCourses={relatedCourses}
      kit={{
        id: kit.id,
        slug: kit.slug,
        title: kit.title,
        subtitle: kit.subtitle,
        description: kit.description,
        thumbnailUrl: kit.thumbnailUrl,
        category: kit.category,
        difficulty: kit.difficulty,
        ageRange: kit.ageRange,
        price: Number(kit.price ?? 0),
        isFree: kit.isFree,
        inventoryCount: kit.inventoryCount,
        learningOutcomes: parseJsonList(kit.learningOutcomes),
        projectIdeas: parseJsonList(kit.projectIdeas),
        relatedCourseSlugs: slugs,
        components: kit.components,
        materials: kit.materials,
        gallery: kit.gallery,
      }}
    />
  );
}
