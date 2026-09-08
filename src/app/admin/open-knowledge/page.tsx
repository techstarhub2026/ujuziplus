import Image from "next/image";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAdminOpenKnowledgeResources } from "@/lib/actions/open-knowledge";
import { AdminOpenKnowledgeRowActions } from "@/components/admin/AdminOpenKnowledgeRowActions";
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

export default async function AdminOpenKnowledgePage() {
  const resources = await getAdminOpenKnowledgeResources();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Open Knowledge</h1>
          <p className="text-sm text-gray-500">
            {resources.length} resource{resources.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/open-knowledge/new">
            <Plus className="mr-1 h-4 w-4" /> Create resource
          </Link>
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card className="py-14 text-center text-sm text-gray-400">
          No open knowledge resources yet.{" "}
          <Link href="/admin/open-knowledge/new" className="text-brand underline">
            Create your first one
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {resources.map((r) => {
            const tags = Array.isArray(r.tags) ? (r.tags as string[]) : [];
            return (
              <Card key={r.id} className="flex items-center gap-4 p-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {r.thumbnailUrl ? (
                    <Image
                      src={r.thumbnailUrl}
                      alt=""
                      fill
                      sizes="64px"
                      className="object-cover"
                      unoptimized={r.thumbnailUrl.startsWith("/content/")}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <BookOpen className="h-6 w-6 text-gray-300" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate font-semibold">{r.title}</h3>
                    <Badge variant="muted" size="sm">
                      {CATEGORY_LABELS[r.category]}
                    </Badge>
                    {r.isFeatured && (
                      <Badge variant="accent" size="sm">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    /{r.slug} · {tags.length} tag{tags.length !== 1 ? "s" : ""} · created{" "}
                    {r.createdAt.toLocaleDateString()}
                  </p>
                </div>

                <AdminOpenKnowledgeRowActions
                  id={r.id}
                  slug={r.slug}
                  title={r.title}
                  viewHref={r.externalUrl ?? r.fileUrl ?? `/open-knowledge/${r.slug}`}
                />
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
