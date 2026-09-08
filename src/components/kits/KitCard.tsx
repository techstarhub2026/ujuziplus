"use client";

import { ContentImage } from "@/components/shared/ContentImage";
import { Package, Users, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MediaCard, MediaCardPrice } from "@/components/shared/MediaCard";
import { formatCurrency } from "@/lib/utils";
import type { KitCatalogItem } from "@/components/kits/KitCatalogItem";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop";

export function KitCard({ kit }: { kit: KitCatalogItem }) {
  const thumb = kit.thumbnailUrl || PLACEHOLDER;

  return (
    <MediaCard
      href={`/kits/${kit.slug}`}
      aspect="wide"
      title={kit.title}
      subtitle={kit.subtitle ?? undefined}
      badges={
        <>
          {kit.isFree && <Badge variant="success" size="sm">Free</Badge>}
          <Badge variant="outline" size="sm" className="capitalize bg-white/95 backdrop-blur-sm">
            {kit.difficulty}
          </Badge>
        </>
      }
      image={
        <>
          <ContentImage
            src={thumb}
            alt={kit.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 80vw, 320px"
          />
          <div className="kit-card-bom" aria-hidden>
            <div className="kit-card-bom__inner">
              <span className="kit-card-bom__item">
                <Package className="h-4 w-4" />
                {kit.componentCount} components
              </span>
              <span className="kit-card-bom__item">
                <BookOpen className="h-4 w-4" />
                {kit.materialCount} guides
              </span>
              {kit.ageRange && (
                <span className="kit-card-bom__item">
                  <Users className="h-4 w-4" />
                  Ages {kit.ageRange}
                </span>
              )}
            </div>
          </div>
        </>
      }
      meta={
        <>
          {kit.category && (
            <Badge variant="muted" size="sm" className="mb-0">
              {kit.category}
            </Badge>
          )}
          <span className="flex items-center gap-1">
            <Package className="h-3.5 w-3.5" /> {kit.componentCount} parts
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> {kit.materialCount} materials
          </span>
          {kit.ageRange && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Ages {kit.ageRange}
            </span>
          )}
        </>
      }
      footer={
        <div className="flex items-center justify-between gap-3">
          <MediaCardPrice isFree={kit.isFree} price={kit.isFree ? undefined : formatCurrency(kit.price)} />
          <span className="inline-flex h-9 shrink-0 items-center rounded-lg border-2 border-brand/70 px-4 text-xs font-semibold text-brand transition-colors group-hover:bg-brand-light">
            Explore
          </span>
        </div>
      }
    />
  );
}
