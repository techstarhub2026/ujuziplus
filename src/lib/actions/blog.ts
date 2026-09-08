/**
 * Blog posts
 */
"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { BlogPostStatus } from "@prisma/client";
import type { ActionResult } from "./courses";
import { requireAdmin } from "@/lib/auth-server";

const getPublishedBlogPostsCached = unstable_cache(
  async () =>
    db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { publishedAt: "desc" },
      include: { author: { select: { fullName: true } } },
    }),
  ["published-blog-posts"],
  { revalidate: 60, tags: ["published-blog-posts"] }
);

export async function getPublishedBlogPosts() {
  return getPublishedBlogPostsCached();
}

const getBlogPostBySlugCached = unstable_cache(
  async (slug: string) =>
    db.blogPost.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: { author: { select: { fullName: true, avatarUrl: true } } },
    }),
  ["blog-post-by-slug"],
  { revalidate: 60, tags: ["published-blog-posts"] }
);

export async function getBlogPostBySlug(slug: string) {
  return getBlogPostBySlugCached(slug);
}

export async function getAdminBlogPosts() {
  await requireAdmin();
  return db.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { fullName: true } } },
  });
}

export async function adminUpsertBlogPost(input: {
  id?: string;
  slug: string;
  title: string;
  excerpt?: string;
  body: string;
  category: string;
  status: BlogPostStatus;
  authorId?: string;
}): Promise<ActionResult> {
  await requireAdmin();

  const publishedAt =
    input.status === "PUBLISHED" ? new Date() : undefined;

  const data = {
    slug: input.slug.trim(),
    title: input.title.trim(),
    excerpt: input.excerpt?.trim() ?? null,
    body: input.body.trim(),
    category: input.category.trim(),
    status: input.status,
    authorId: input.authorId ?? null,
    ...(input.status === "PUBLISHED" ? { publishedAt } : {}),
  };

  if (input.id) {
    await db.blogPost.update({ where: { id: input.id }, data });
  } else {
    await db.blogPost.create({ data: { ...data, publishedAt: publishedAt ?? null } });
  }

  revalidatePath("/admin/content");
  revalidatePath("/blog");
  revalidateTag("published-blog-posts");
  return { success: true, data: undefined };
}
