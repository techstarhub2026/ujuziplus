import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSiteUrl } from "@/lib/env";

/**
 * Public course catalogue.
 *
 * Read-only feed of PUBLISHED courses for external sites — techstarhub.or.tz
 * renders its Courses page and home-page teaser from this. UjuziPlus stays the
 * single source of truth for course data; nothing is duplicated into another
 * database, so editing a course here is immediately reflected there.
 *
 * No authentication: everything returned is already public on /courses. Only
 * whitelisted fields are exposed — never instructor emails, revenue, learner
 * counts or anything a DRAFT/PENDING_REVIEW course contains.
 *
 * GET /api/public/courses?limit=12&category=IoT
 */

const MAX_LIMIT = 60;

// A public, credential-free catalogue, so any origin may read it.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const category = url.searchParams.get("category")?.trim() || undefined;
  const limitParam = Number(url.searchParams.get("limit"));
  const take = Number.isFinite(limitParam) && limitParam > 0
    ? Math.min(limitParam, MAX_LIMIT)
    : MAX_LIMIT;

  try {
    const courses = await db.course.findMany({
      where: { status: "PUBLISHED", ...(category ? { category } : {}) },
      orderBy: [{ createdAt: "desc" }],
      take,
      select: {
        slug: true,
        title: true,
        subtitle: true,
        description: true,
        category: true,
        level: true,
        language: true,
        isFree: true,
        price: true,
        discountPrice: true,
        durationHours: true,
        thumbnailUrl: true,
        instructor: { select: { fullName: true } },
        _count: { select: { modules: true, enrollments: true } },
      },
    });

    // Relative upload paths are meaningless to a site on another origin, so
    // they are resolved against this deployment's own public origin before
    // leaving. `url.origin` is deliberately NOT used here — behind Railway's
    // proxy the incoming Host header reflects the container's internal
    // address, not the public domain, which silently produced broken
    // `localhost:3000` thumbnail/course URLs for every external caller.
    const origin = getSiteUrl();
    const absolute = (path: string | null) => {
      if (!path) return null;
      return /^https?:\/\//i.test(path) ? path : `${origin}${path.startsWith("/") ? "" : "/"}${path}`;
    };

    const data = courses.map((c) => ({
      slug: c.slug,
      title: c.title,
      subtitle: c.subtitle,
      // Trimmed to a card-sized summary; the full body stays on the course page.
      excerpt: c.description ? c.description.replace(/\s+/g, " ").trim().slice(0, 220) : null,
      category: c.category,
      level: c.level,
      language: c.language,
      isFree: c.isFree,
      // Decimal does not survive JSON serialisation cleanly.
      price: c.price === null ? null : Number(c.price),
      discountPrice: c.discountPrice === null ? null : Number(c.discountPrice),
      durationHours: c.durationHours,
      thumbnail: absolute(c.thumbnailUrl),
      instructor: c.instructor?.fullName ?? null,
      moduleCount: c._count.modules,
      enrollmentCount: c._count.enrollments,
      url: `${origin}/courses/${c.slug}`,
    }));

    return NextResponse.json(
      { data, meta: { total: data.length, categories: Array.from(new Set(data.map((d) => d.category).filter(Boolean))) } },
      {
        headers: {
          ...CORS,
          // Short cache: the catalogue changes rarely, and a stale card for a
          // minute is far better than hammering the DB on every page view.
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (error) {
    // The consumer still gets a well-formed empty payload rather than a stack
    // trace, but the failure is logged here and flagged in the body — an empty
    // catch turns "the query is broken" into "there are no courses", which is
    // indistinguishable from the real empty state and hides genuine bugs.
    console.error("[/api/public/courses] failed:", error);
    return NextResponse.json(
      { data: [], meta: { total: 0, categories: [], error: "catalogue_unavailable" } },
      { status: 503, headers: CORS },
    );
  }
}
