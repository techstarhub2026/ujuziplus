/**
 * Learning kits — admin CRUD
 */
"use server";

import { revalidatePath, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import { KitDifficulty, KitMaterialType, KitStatus } from "@prisma/client";
import type { ActionResult } from "./courses";
import { requireAdmin, requireUser, assertSelfOrAdmin } from "@/lib/auth-server";
import { toKitCatalogItem } from "@/components/kits/KitCatalogItem";
import { revalidateKitCatalog } from "@/lib/revalidate-catalog";

function slugify(text: string) {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "kit"
  );
}

async function uniqueKitSlug(title: string, excludeId?: string) {
  const base = slugify(title);
  let slug = base;
  let i = 0;
  while (true) {
    const existing = await db.kit.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    i++;
    slug = `${base}-${i}`;
  }
  return slug;
}

const kitInclude = {
  components: { orderBy: { orderIndex: "asc" as const } },
  materials: { orderBy: { orderIndex: "asc" as const } },
  gallery: { orderBy: { orderIndex: "asc" as const } },
};

export async function getAdminKits() {
  await requireAdmin();
  return db.kit.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { components: true, materials: true } } },
  });
}

export async function getPublishedKits() {
  return getPublishedKitsCached();
}

const getPublishedKitsCached = unstable_cache(
  async () => {
    const kits = await db.kit.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { title: "asc" },
      include: { _count: { select: { components: true, materials: true } } },
    });
    return kits.map(toKitCatalogItem);
  },
  ["published-kits"],
  { revalidate: 60, tags: ["published-kits"] }
);

const getPublishedKitCategoriesCached = unstable_cache(
  async () => {
    const rows = await db.kit.findMany({
      where: { status: "PUBLISHED", category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });
    return rows.map((r) => r.category!).filter(Boolean);
  },
  ["published-kit-categories"],
  { revalidate: 60, tags: ["published-kits"] }
);

export async function getPublishedKitCategories() {
  return getPublishedKitCategoriesCached();
}

export async function getKitById(kitId: string) {
  await requireAdmin();
  return db.kit.findUnique({ where: { id: kitId }, include: kitInclude });
}

export async function getKitBySlug(slug: string) {
  return db.kit.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: kitInclude,
  });
}

export async function getUserPurchasedKits(userId: string) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  return db.kitPurchase.findMany({
    where: { userId },
    orderBy: { purchasedAt: "desc" },
    include: {
      kit: {
        include: {
          _count: { select: { components: true, materials: true } },
        },
      },
    },
  });
}

export type KitSaveInput = {
  title: string;
  subtitle?: string;
  description?: string;
  thumbnailUrl?: string;
  category?: string;
  difficulty: KitDifficulty;
  ageRange?: string;
  price: number;
  isFree: boolean;
  status: KitStatus;
  learningOutcomes: string[];
  projectIdeas: string[];
  relatedCourseSlugs: string[];
  inventoryCount: number;
  components: { name: string; quantity: number; description?: string; imageUrl?: string }[];
  materials: {
    title: string;
    type: KitMaterialType;
    description?: string;
    url?: string;
    durationMinutes?: number;
  }[];
  gallery: { url: string; caption?: string; isPrimary?: boolean }[];
};

export async function createKit(input: KitSaveInput): Promise<ActionResult<{ kitId: string }>> {
  await requireAdmin();
  if (!input.title.trim()) return { success: false, error: "Title is required." };

  const slug = await uniqueKitSlug(input.title);
  const kit = await db.kit.create({
    data: {
      slug,
      title: input.title.trim(),
      subtitle: input.subtitle?.trim() ?? null,
      description: input.description?.trim() ?? null,
      thumbnailUrl: input.thumbnailUrl ?? null,
      category: input.category ?? null,
      difficulty: input.difficulty,
      ageRange: input.ageRange ?? null,
      price: input.isFree ? 0 : input.price,
      isFree: input.isFree,
      status: input.status,
      learningOutcomes: input.learningOutcomes.filter(Boolean),
      projectIdeas: input.projectIdeas.filter(Boolean),
      relatedCourseSlugs: input.relatedCourseSlugs,
      inventoryCount: input.inventoryCount,
      components: {
        create: input.components.map((c, i) => ({
          name: c.name,
          quantity: c.quantity,
          description: c.description ?? null,
          imageUrl: c.imageUrl ?? null,
          orderIndex: i,
        })),
      },
      materials: {
        create: input.materials.map((m, i) => ({
          title: m.title,
          type: m.type,
          description: m.description ?? null,
          url: m.url ?? null,
          durationMinutes: m.durationMinutes ?? null,
          orderIndex: i,
        })),
      },
      gallery: {
        create: input.gallery.map((g, i) => ({
          url: g.url,
          caption: g.caption ?? null,
          isPrimary: g.isPrimary ?? i === 0,
          orderIndex: i,
        })),
      },
    },
  });

  revalidatePath("/admin/kits");
  revalidateKitCatalog(kit.slug);
  return { success: true, data: { kitId: kit.id } };
}

export async function updateKit(
  kitId: string,
  input: KitSaveInput
): Promise<ActionResult> {
  await requireAdmin();
  if (!input.title.trim()) return { success: false, error: "Title is required." };

  const existing = await db.kit.findUnique({ where: { id: kitId } });
  if (!existing) return { success: false, error: "Kit not found." };

  const slug =
    slugify(input.title) === existing.slug
      ? existing.slug
      : await uniqueKitSlug(input.title, kitId);

  await db.$transaction([
    db.kitComponent.deleteMany({ where: { kitId } }),
    db.kitMaterial.deleteMany({ where: { kitId } }),
    db.kitGalleryImage.deleteMany({ where: { kitId } }),
    db.kit.update({
      where: { id: kitId },
      data: {
        slug,
        title: input.title.trim(),
        subtitle: input.subtitle?.trim() ?? null,
        description: input.description?.trim() ?? null,
        thumbnailUrl: input.thumbnailUrl ?? null,
        category: input.category ?? null,
        difficulty: input.difficulty,
        ageRange: input.ageRange ?? null,
        price: input.isFree ? 0 : input.price,
        isFree: input.isFree,
        status: input.status,
        learningOutcomes: input.learningOutcomes.filter(Boolean),
        projectIdeas: input.projectIdeas.filter(Boolean),
        relatedCourseSlugs: input.relatedCourseSlugs,
        inventoryCount: input.inventoryCount,
        components: {
          create: input.components.map((c, i) => ({
            name: c.name,
            quantity: c.quantity,
            description: c.description ?? null,
            imageUrl: c.imageUrl ?? null,
            orderIndex: i,
          })),
        },
        materials: {
          create: input.materials.map((m, i) => ({
            title: m.title,
            type: m.type,
            description: m.description ?? null,
            url: m.url ?? null,
            durationMinutes: m.durationMinutes ?? null,
            orderIndex: i,
          })),
        },
        gallery: {
          create: input.gallery.map((g, i) => ({
            url: g.url,
            caption: g.caption ?? null,
            isPrimary: g.isPrimary ?? i === 0,
            orderIndex: i,
          })),
        },
      },
    }),
  ]);

  revalidatePath("/admin/kits");
  revalidatePath(`/admin/kits/${kitId}/edit`);
  revalidateKitCatalog(slug);
  return { success: true, data: undefined };
}

export async function deleteKit(kitId: string): Promise<ActionResult> {
  await requireAdmin();
  const kit = await db.kit.findUnique({ where: { id: kitId }, select: { slug: true } });
  await db.kit.delete({ where: { id: kitId } });
  revalidatePath("/admin/kits");
  if (kit) revalidateKitCatalog(kit.slug);
  return { success: true, data: undefined };
}
