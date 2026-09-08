"use client";

import { Children, isValidElement, type ReactNode } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { HomeCarousel } from "@/components/home/HomeCarousel";

export function CourseDiscoveryRail({
  title,
  subtitle,
  seeAllHref,
  children,
  className,
  itemWidth = 260,
}: {
  title: string;
  subtitle?: string;
  seeAllHref?: string;
  children: ReactNode;
  className?: string;
  itemWidth?: number;
}) {
  const items = Children.toArray(children).filter(isValidElement);
  if (items.length === 0) return null;

  return (
    <section className={cn("course-discovery-rail", className)}>
      <div className="course-discovery-rail__head">
        <div className="min-w-0 flex-1">
          <h3 className="course-discovery-rail__title">{title}</h3>
          {subtitle && <p className="course-discovery-rail__subtitle">{subtitle}</p>}
        </div>
        {seeAllHref && (
          <Link href={seeAllHref} className="course-discovery-rail__link">
            Show all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <HomeCarousel
        itemWidth={itemWidth}
        gap={16}
        autoScroll
        speed={0.45}
      >
        {items}
      </HomeCarousel>
    </section>
  );
}
