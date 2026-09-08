"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { getBannerImage, type BannerSection } from "@/lib/banner-images";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function LearnerPageHero({
  title,
  subtitle,
  children,
  panel,
  className,
  eyebrow,
  size = "default",
  banner = "default",
}: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** Optional right-rail panel rendered inside the hero (e.g. continue learning). */
  panel?: React.ReactNode;
  className?: string;
  eyebrow?: string | false;
  size?: "default" | "large";
  banner?: BannerSection;
}) {
  const reduceMotion = useReducedMotion();

  const titleClass = cn(
    "font-display font-bold tracking-tight text-balance text-white drop-shadow-md",
    size === "large"
      ? "text-3xl md:text-4xl lg:text-5xl leading-[1.1]"
      : "text-2xl md:text-3xl lg:text-4xl leading-tight"
  );

  const subtitleClass = cn(
    "mt-3 max-w-2xl leading-relaxed text-white/90",
    size === "large" ? "text-base md:text-lg" : "text-sm md:text-base"
  );

  const eyebrowText =
    typeof eyebrow === "string" ? eyebrow : "UjuziLab · STEM for Africa";

  const mainBlock = (
    <>
      {eyebrow !== false && <p className="hero-eyebrow">{eyebrowText}</p>}
      <h1 className={titleClass}>{title}</h1>
      {subtitle && <p className={subtitleClass}>{subtitle}</p>}
      {children}
    </>
  );

  const shellClass = panel ? "home-hero-split" : "relative z-10";

  const inner = panel ? (
    <div className={shellClass}>
      <div className="home-hero-split__main">{mainBlock}</div>
      <div className="home-hero-split__panel">{panel}</div>
    </div>
  ) : (
    <div className={shellClass}>{mainBlock}</div>
  );

  const paddingClass =
    className?.includes("home-hero--compact")
      ? ""
      : size === "large"
        ? "p-8 md:p-12 lg:p-14"
        : "p-6 md:p-8 lg:p-10";

  return (
    <div
      className={cn(
        "learner-hero learner-hero--photo relative",
        paddingClass,
        panel && "home-hero--with-panel",
        className
      )}
      style={
        {
          "--hero-banner-image": `url(${getBannerImage(banner)})`,
        } as React.CSSProperties
      }
    >
      {reduceMotion ? (
        inner
      ) : (
        <motion.div
          className={shellClass}
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {panel ? (
            <>
              <motion.div className="home-hero-split__main" variants={fadeUp}>
                {eyebrow !== false && <p className="hero-eyebrow">{eyebrowText}</p>}
                <h1 className={titleClass}>{title}</h1>
                {subtitle && <p className={subtitleClass}>{subtitle}</p>}
                {children}
              </motion.div>
              <motion.div className="home-hero-split__panel" variants={fadeUp}>
                {panel}
              </motion.div>
            </>
          ) : (
            <motion.div variants={fadeUp}>
              {eyebrow !== false && <p className="hero-eyebrow">{eyebrowText}</p>}
              <h1 className={titleClass}>{title}</h1>
              {subtitle && <p className={subtitleClass}>{subtitle}</p>}
              {children}
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export function HeroActions({
  primary,
  links = [],
}: {
  primary?: { href: string; label: string };
  links?: { href: string; label: string }[];
}) {
  return (
    <div className="hero-actions">
      {primary && (
        <Link href={primary.href} className="hero-action-primary">
          {primary.label}
        </Link>
      )}
      {links.length > 0 && (
        <nav className="hero-action-nav" aria-label="Related pages">
          {links.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}

export function QuickActionPill({
  href,
  label,
  variant = "link",
}: {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: "primary" | "link";
}) {
  if (variant === "primary") {
    return (
      <Link href={href} className="hero-action-primary">
        {label}
      </Link>
    );
  }
  return (
    <Link href={href} className="hero-action-nav-link">
      {label}
    </Link>
  );
}

export function TrustStrip() {
  return (
    <p className="hero-note">
      Free courses · Classroom kits · Certificates when you complete a path
    </p>
  );
}

export function SectionBanner({
  banner,
  className,
  children,
}: {
  banner: BannerSection;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn("learner-hero learner-hero--photo relative", className)}
      style={
        {
          "--hero-banner-image": `url(${getBannerImage(banner)})`,
        } as React.CSSProperties
      }
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}
