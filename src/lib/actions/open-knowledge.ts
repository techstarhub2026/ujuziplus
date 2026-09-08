/**
 * Open Knowledge Resources catalog — coding tutorials, AI/IoT resources,
 * STEM teaching materials, open-source projects, innovation toolkits,
 * entrepreneurship guides, research publications, and digital learning
 * manuals, distinct from the hardware-focused Lab Resources catalog.
 */
"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { OpenKnowledgeCategory } from "@prisma/client";
import type { ActionResult } from "./courses";
import { requireAdmin } from "@/lib/auth-server";

const getOpenKnowledgeResourcesCached = unstable_cache(
  async (category?: OpenKnowledgeCategory) =>
    db.openKnowledgeResource.findMany({
      where: category ? { category } : undefined,
      orderBy: [{ isFeatured: "desc" }, { title: "asc" }],
    }),
  ["open-knowledge-resources"],
  { revalidate: 60, tags: ["open-knowledge-resources"] }
);

export async function getOpenKnowledgeResources(category?: OpenKnowledgeCategory) {
  return getOpenKnowledgeResourcesCached(category);
}

const getOpenKnowledgeResourceBySlugCached = unstable_cache(
  async (slug: string) => db.openKnowledgeResource.findUnique({ where: { slug } }),
  ["open-knowledge-resource-by-slug"],
  { revalidate: 60, tags: ["open-knowledge-resources"] }
);

export async function getOpenKnowledgeResourceBySlug(slug: string) {
  return getOpenKnowledgeResourceBySlugCached(slug);
}

const getFeaturedOpenKnowledgeResourcesCached = unstable_cache(
  async (limit: number) =>
    db.openKnowledgeResource.findMany({
      where: { isFeatured: true },
      orderBy: { title: "asc" },
      take: limit,
    }),
  ["featured-open-knowledge-resources"],
  { revalidate: 60, tags: ["open-knowledge-resources"] }
);

export async function getFeaturedOpenKnowledgeResources(limit = 4) {
  return getFeaturedOpenKnowledgeResourcesCached(limit);
}

export async function getAdminOpenKnowledgeResources() {
  await requireAdmin();
  return db.openKnowledgeResource.findMany({ orderBy: { title: "asc" } });
}

export async function adminUpsertOpenKnowledgeResource(input: {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  category: OpenKnowledgeCategory;
  authorName?: string;
  fileUrl?: string;
  externalUrl?: string;
  thumbnailUrl?: string | null;
  tags?: string[];
  isFeatured?: boolean;
}): Promise<ActionResult<{ slug: string }>> {
  await requireAdmin();

  const data = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    description: input.description?.trim() || null,
    category: input.category,
    authorName: input.authorName?.trim() || null,
    fileUrl: input.fileUrl?.trim() || null,
    externalUrl: input.externalUrl?.trim() || null,
    thumbnailUrl: input.thumbnailUrl ?? null,
    tags: input.tags ?? [],
    isFeatured: input.isFeatured ?? false,
  };

  if (input.id) {
    await db.openKnowledgeResource.update({ where: { id: input.id }, data });
  } else {
    await db.openKnowledgeResource.create({ data });
  }

  revalidatePath("/admin/content");
  revalidatePath("/open-knowledge");
  revalidatePath(`/open-knowledge/${data.slug}`);
  revalidateTag("open-knowledge-resources");
  return { success: true, data: { slug: data.slug } };
}

export async function adminDeleteOpenKnowledgeResource(id: string): Promise<ActionResult> {
  await requireAdmin();

  let resource;
  try {
    resource = await db.openKnowledgeResource.delete({ where: { id } });
  } catch {
    return { success: false, error: "Not found." };
  }

  revalidatePath("/admin/content");
  revalidatePath("/open-knowledge");
  revalidatePath(`/open-knowledge/${resource.slug}`);
  revalidateTag("open-knowledge-resources");
  return { success: true, data: undefined };
}
