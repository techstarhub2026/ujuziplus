"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Package,
  Rocket,
  Trophy,
  Users,
  ArrowRight,
} from "lucide-react";
import { HomeCarousel } from "@/components/home/HomeCarousel";
import { MarqueeRow } from "@/components/home/MarqueeRow";
import type { DiscoveryItem } from "@/components/home/discovery";

export type { DiscoveryItem };

const KIND_CONFIG = {
  course: { label: "Course", icon: BookOpen, accent: "course" },
  kit: { label: "Kit", icon: Package, accent: "kit" },
  program: { label: "Bootcamp", icon: Rocket, accent: "program" },
  competition: { label: "Competition", icon: Trophy, accent: "competition" },
} as const;

function DiscoveryCard({ item }: { item: DiscoveryItem }) {
  const cfg = KIND_CONFIG[item.kind];
  const Icon = cfg.icon;

  return (
    <Link
      href={item.href}
      className={`discovery-card discovery-card--${cfg.accent} group`}
    >
      <div className="discovery-card__media">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt=""
            fill
            className="discovery-card__image"
            sizes="280px"
            unoptimized={item.imageUrl.startsWith("/content/")}
          />
        ) : (
          <div className="discovery-card__media-fallback">
            <Icon className="h-9 w-9" strokeWidth={1.25} aria-hidden />
          </div>
        )}
        {item.highlight && (
          <span className="discovery-card__highlight">{item.highlight}</span>
        )}
      </div>

      <div className="discovery-card__body">
        <span className="discovery-card__kind">
          <Icon className="h-3 w-3" aria-hidden />
          {cfg.label}
        </span>
        <h3 className="discovery-card__title">{item.title}</h3>
        <p className="discovery-card__meta">
          {item.metaPrimary}
          {item.metaSecondary && (
            <>
              <span aria-hidden> · </span>
              {item.metaSecondary}
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

/**
 * The platform-wide catalog sampler.
 *
 * This was previously two rows scrolling in opposite directions at once —
 * the single strongest nausea trigger on the page, because opposing motion
 * vectors give the eye no stable frame of reference. It is now one
 * reader-driven rail.
 */
export function HomeDiscoveryMarquee({ items }: { items: DiscoveryItem[] }) {
  if (items.length < 4) return null;

  return (
    <section className="discovery-section" aria-labelledby="discovery-heading">
      <div className="discovery-section__head">
        <h2 id="discovery-heading" className="discovery-section__title">
          Courses, kits, bootcamps &amp; competitions — all in one place
        </h2>
        <p className="discovery-section__desc">
          A snapshot of everything happening across the platform right now.
        </p>
      </div>

      <HomeCarousel
        itemWidth={272}
        gap={20}
        ariaLabel="Featured across the platform"
      >
        {items.slice(0, 16).map((item) => (
          <DiscoveryCard key={item.key} item={item} />
        ))}
      </HomeCarousel>

      <div className="discovery-section__links">
        <Link href="/courses">
          All courses <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <Link href="/kits">
          All kits <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <Link href="/programs">
          All programs <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
        <Link href="/competitions">
          Competitions <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>
    </section>
  );
}

export function OrgMarqueeItem({
  name,
  logoUrl,
  type,
  isVerified,
  memberCount,
}: {
  name: string;
  logoUrl: string | null;
  type: string;
  isVerified: boolean;
  memberCount: number;
}) {
  const monogram = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="org-chip" title={name}>
      <span className="org-chip__logo">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={48}
            height={48}
            className="h-11 w-11 rounded-xl object-cover sm:h-12 sm:w-12"
            unoptimized={logoUrl.startsWith("/content/")}
          />
        ) : (
          <span className="org-chip__monogram">{monogram}</span>
        )}
      </span>
      <span className="min-w-0">
        <span className="org-chip__name">
          {name}
          {isVerified && (
            <span className="org-chip__verified" title="Verified">
              ✓
            </span>
          )}
        </span>
        <span className="org-chip__meta">
          {type.toLowerCase().replace(/_/g, " ")}
          {memberCount > 0 && (
            <>
              {" · "}
              <Users className="inline h-3 w-3 -mt-px" aria-hidden /> {memberCount}
            </>
          )}
        </span>
      </span>
    </div>
  );
}

/**
 * Partner logos. This is the one place a continuous strip earns its keep:
 * small, low-detail, non-interactive marks that read as texture rather than
 * content. It runs slowly and pauses on hover.
 */
export function OrgMarquee({
  orgs,
}: {
  orgs: {
    id: string;
    name: string;
    logoUrl: string | null;
    type: string;
    isVerified: boolean;
    memberCount: number;
  }[];
}) {
  if (orgs.length < 3) return null;

  return (
    <section className="org-marquee-section" aria-label="Partner organizations">
      <p className="org-marquee-section__label">
        Trusted by schools, universities &amp; innovation hubs across Africa
      </p>
      <MarqueeRow
        duration={Math.max(70, orgs.length * 11)}
        gap={20}
        ariaLabel="Partner organizations"
      >
        {orgs.map((org) => (
          <OrgMarqueeItem
            key={org.id}
            name={org.name}
            logoUrl={org.logoUrl}
            type={org.type}
            isVerified={org.isVerified}
            memberCount={org.memberCount}
          />
        ))}
      </MarqueeRow>
    </section>
  );
}
