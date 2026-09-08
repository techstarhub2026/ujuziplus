import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import type { BannerSection } from "@/lib/banner-images";

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  variant = "default",
  banner = "dashboard",
}: {
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  action?: React.ReactNode;
  variant?: "default" | "hero";
  banner?: BannerSection;
}) {
  if (variant === "hero") {
    return (
      <div className="mb-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-3 flex items-center gap-1 text-sm text-white/70">
            {breadcrumbs.map((b, i) => (
              <span key={b.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {b.href ? (
                  <Link href={b.href} className="hover:text-white">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-white">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <LearnerPageHero
            title={title}
            subtitle={description}
            banner={banner}
            eyebrow={false}
            className="flex-1"
          />
          {action && <div className="relative z-10 shrink-0 pb-1">{action}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center gap-1 text-sm text-gray-500">
            {breadcrumbs.map((b, i) => (
              <span key={b.label} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {b.href ? (
                  <Link href={b.href} className="hover:text-brand">
                    {b.label}
                  </Link>
                ) : (
                  <span className="text-gray-900">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-gray-500">{description}</p>}
      </div>
      {action && (
        <div className={cn("shrink-0")}>
          {action}
        </div>
      )}
    </div>
  );
}
