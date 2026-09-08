"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";
import type { OpenKnowledgeCategory } from "@prisma/client";

const CATEGORY_LABELS: Record<OpenKnowledgeCategory, string> = {
  CODING_TUTORIALS: "Coding tutorials",
  AI_IOT_RESOURCES: "AI & IoT resources",
  STEM_TEACHING_MATERIALS: "STEM teaching materials",
  OPEN_SOURCE_PROJECTS: "Open-source projects",
  INNOVATION_TOOLKITS: "Innovation toolkits",
  ENTREPRENEURSHIP_GUIDES: "Entrepreneurship guides",
  RESEARCH_PUBLICATIONS: "Research publications",
  DIGITAL_LEARNING_MANUALS: "Digital learning manuals",
};

type ResourceItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: OpenKnowledgeCategory;
  authorName: string | null;
  fileUrl: string | null;
  externalUrl: string | null;
  thumbnailUrl: string | null;
  isFeatured: boolean;
};

export function OpenKnowledgeClient({ resources }: { resources: ResourceItem[] }) {
  const [categoryFilter, setCategoryFilter] = useState<OpenKnowledgeCategory | null>(null);

  const filtered = categoryFilter
    ? resources.filter((r) => r.category === categoryFilter)
    : resources;

  const categories = Object.keys(CATEGORY_LABELS) as OpenKnowledgeCategory[];

  return (
    <div className="learner-canvas px-4 py-6 sm:px-6 lg:px-8">
      <LearnerPageHero
        banner="knowledge"
        title="Open Knowledge Resources"
        subtitle="A free digital knowledge hub: tutorials, AI & IoT resources, STEM teaching materials, entrepreneurship guides, and research — open to every learner and innovator."
      />

        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <Card className="h-fit w-full shrink-0 p-4 lg:w-56">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Filter by category
            </p>
            <div className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => setCategoryFilter(null)}
                className={cn(
                  "block w-full rounded-lg px-3 py-2 text-left text-sm transition",
                  !categoryFilter ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategoryFilter(c)}
                  className={cn(
                    "block w-full rounded-lg px-3 py-2 text-left text-sm transition",
                    categoryFilter === c ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {CATEGORY_LABELS[c]}
                </button>
              ))}
            </div>
          </Card>

          <div className="flex-1">
            <p className="mb-4 text-sm text-gray-500">
              Showing {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </p>

            {filtered.length === 0 ? (
              <Card className="py-16 text-center text-sm text-gray-400">No resources found.</Card>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((item) => {
                  const href = item.externalUrl ?? item.fileUrl ?? `/open-knowledge/${item.slug}`;
                  const isExternal = Boolean(item.externalUrl || item.fileUrl);

                  return (
                    <Card
                      key={item.slug}
                      hover
                      className="flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover sm:flex-row"
                    >
                      <div className="relative h-32 w-full shrink-0 overflow-hidden bg-gray-100 sm:h-auto sm:w-40">
                        {item.thumbnailUrl ? (
                          <Image
                            src={item.thumbnailUrl}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 100vw, 160px"
                            className="object-cover"
                            unoptimized={item.thumbnailUrl.startsWith("/content/")}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen className="h-8 w-8 text-gray-300" />
                          </div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark">
                            <BookOpen className="h-3.5 w-3.5" />
                          </span>
                          <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                          {item.isFeatured && (
                            <Badge variant="accent" size="sm">
                              Featured
                            </Badge>
                          )}
                        </div>

                        {item.description && (
                          <p className="mt-2 line-clamp-2 text-sm text-gray-500">{item.description}</p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-1.5">
                          <Badge variant="muted" size="sm">
                            {CATEGORY_LABELS[item.category]}
                          </Badge>
                          {item.authorName && (
                            <Badge variant="outline" size="sm">
                              {item.authorName}
                            </Badge>
                          )}
                        </div>

                        <div className="mt-auto pt-4">
                          <Link
                            href={href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            className="text-sm font-medium text-brand hover:underline"
                          >
                            {isExternal ? "Open resource →" : "Learn more →"}
                          </Link>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
