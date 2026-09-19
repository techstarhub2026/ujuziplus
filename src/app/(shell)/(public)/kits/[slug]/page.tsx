import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAuthSession } from "@/lib/auth-server";
import { getKitBySlug } from "@/lib/actions/kits";
import { userOwnsKit } from "@/lib/actions/orders";
import { db } from "@/lib/db";
import { KitDetailView } from "@/components/kits/KitDetailView";
import { PLATFORM } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? PLATFORM.url;

function summarise(text: string | null, fallback: string) {
  const clean = (text ?? "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!clean) return fallback;
  if (clean.length <= 155) return clean;
  return `${clean.slice(0, 152).replace(/\s+\S*$/, "")}…`;
}

/** Each kit carries its own title and description — see the course page. */
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const kit = await db.kit
    .findUnique({
      where: { slug: params.slug },
      select: { title: true, description: true, thumbnailUrl: true, status: true },
    })
    .catch(() => null);

  if (!kit || kit.status !== "PUBLISHED") {
    return { title: "Learning kit", robots: { index: false, follow: true } };
  }

  const description = summarise(
    kit.description,
    `${kit.title} — a hands-on STEM and IoT learning kit from UjuziPlus, delivered across Tanzania.`,
  );
  const canonical = `/kits/${params.slug}`;

  return {
    title: `${kit.title} — Learning Kit`,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      url: `${siteUrl}${canonical}`,
      title: `${kit.title} | UjuziPlus`,
      description,
      images: kit.thumbnailUrl ? [{ url: kit.thumbnailUrl, alt: kit.title }] : undefined,
    },
  };
}

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
