import type { MetadataRoute } from "next";
import { PLATFORM } from "@/lib/constants";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? PLATFORM.url;

/**
 * There was no robots.txt at all, so /robots.txt returned the 404 page —
 * crawlers got HTML where they expected directives, and no pointer to a
 * sitemap.
 *
 * Everything public is open. What is disallowed is either private (a
 * learner's dashboard, an org portal), or a page that would waste crawl
 * budget without ever being a useful search result: endless search-result
 * permutations, auth screens, the API.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/instructor/",
          "/moderator/",
          "/org/",
          "/dashboard/",
          "/auth/",
          "/search?",
          "/_next/",
          "/uploads/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
