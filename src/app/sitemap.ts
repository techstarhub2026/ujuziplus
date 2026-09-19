import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { PLATFORM } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? PLATFORM.url;

/**
 * Built per request, then cached for an hour.
 *
 * `revalidate` alone let Next render this at build time, where there is no
 * database — every query failed, and the first hour of the sitemap shipped
 * with the static pages only and not one course. Forcing it dynamic means the
 * first crawl gets the real list.
 */
export const dynamic = "force-dynamic";
export const revalidate = 3600;

const url = (path: string) => `${siteUrl}${path}`;

/** The pages that exist whether or not anything has been published yet. */
const STATIC: Array<[string, number, MetadataRoute.Sitemap[number]["changeFrequency"]]> = [
  ["", 1.0, "daily"],
  ["/courses", 0.9, "daily"],
  ["/kits", 0.9, "daily"],
  ["/programs", 0.8, "weekly"],
  ["/mentors", 0.8, "weekly"],
  ["/competitions", 0.7, "weekly"],
  ["/projects", 0.7, "weekly"],
  ["/showcase", 0.7, "weekly"],
  ["/solutions", 0.7, "weekly"],
  ["/organizations", 0.6, "weekly"],
  ["/lab-resources", 0.6, "weekly"],
  ["/blog", 0.7, "daily"],
  ["/community", 0.6, "daily"],
  ["/about", 0.6, "monthly"],
  ["/contact", 0.6, "monthly"],
  ["/pricing", 0.6, "monthly"],
  ["/verify-certificate", 0.4, "monthly"],
  ["/terms", 0.2, "yearly"],
  ["/privacy", 0.2, "yearly"],
];

/**
 * A sitemap is how a site with no inbound links gets crawled at all: without
 * one Google finds only what it stumbles across from the home page. Every
 * published course, kit and post is listed here so each can rank on its own
 * subject rather than depending on the home page to carry them.
 *
 * Each query is allowed to fail on its own. A sitemap missing one section is
 * worth far more than a 500 that leaves crawlers with nothing.
 */
async function safely<T>(query: Promise<T>, fallback: T): Promise<T> {
  try {
    return await query;
  } catch {
    return fallback;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const [courses, kits, programs, competitions, projects, posts, solutions] = await Promise.all([
    safely(db.course.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }), []),
    safely(db.kit.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }), []),
    safely(db.program.findMany({
      select: { slug: true, updatedAt: true },
    }), []),
    safely(db.competition.findMany({
      select: { slug: true, updatedAt: true },
    }), []),
    safely(db.project.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }), []),
    safely(db.blogPost.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
    }), []),
    safely(db.solution.findMany({
      select: { slug: true, updatedAt: true },
    }), []),
  ]);

  const dynamic: MetadataRoute.Sitemap = [
    ...courses.map((c) => ({ url: url(`/courses/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...kits.map((k) => ({ url: url(`/kits/${k.slug}`), lastModified: k.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...programs.map((p) => ({ url: url(`/programs/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...competitions.map((c) => ({ url: url(`/competitions/${c.slug}`), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...projects.map((p) => ({ url: url(`/projects/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...posts.map((p) => ({ url: url(`/blog/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...solutions.map((s) => ({ url: url(`/solutions/${s.slug}`), lastModified: s.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];

  return [
    ...STATIC.map(([path, priority, changeFrequency]) => ({
      url: url(path),
      lastModified: now,
      changeFrequency,
      priority,
    })),
    ...dynamic,
  ];
}
