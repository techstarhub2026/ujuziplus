"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WAZILAB_LAB_FILTERS } from "@/lib/wazilab-theme";
import { toggleLabResourceBookmark } from "@/lib/actions/lab-resources";
import { useAppStore } from "@/store/appStore";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { FlaskConical } from "lucide-react";
import type { LabResourceType } from "@prisma/client";

type ResourceItem = {
  id: string;
  slug: string;
  title: string;
  type: string;
  category: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  tags: string[];
};

export function LabResourcesClient({
  resources,
  savedIds,
  userId,
}: {
  resources: ResourceItem[];
  savedIds: string[];
  userId: string | null;
}) {
  const [typeFilter, setTypeFilter] = useState<LabResourceType | null>(null);
  const [tab, setTab] = useState<0 | 1>(0);
  const [saved, setSaved] = useState(new Set(savedIds));
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();

  const filtered = resources.filter((r) => {
    if (tab === 1 && !saved.has(r.id)) return false;
    if (typeFilter && r.type !== typeFilter) return false;
    return true;
  });

  const toggleSave = (resourceId: string, title: string) => {
    if (!userId) {
      router.push("/auth/login?callbackUrl=/lab-resources");
      return;
    }
    startTransition(async () => {
      const res = await toggleLabResourceBookmark(userId, resourceId);
      if (res.success) {
        setSaved((prev) => {
          const next = new Set(prev);
          if (res.data.saved) next.add(resourceId);
          else next.delete(resourceId);
          return next;
        });
        showToast(res.data.saved ? `Saved ${title}` : `Removed ${title}`, "success");
      }
    });
  };

  return (
    <div className="learner-canvas px-4 py-6 sm:px-6 lg:px-8">
      <LearnerPageHero
        banner="lab-resources"
        title="Lab Resources"
        subtitle="Hardware components, guides, and reference materials for hands-on labs."
      />

      <div className="mt-6 flex gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab(0)}
          className={cn(
            "border-b-2 px-4 py-2.5 text-sm font-medium transition",
            tab === 0 ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          All resources
        </button>
        <button
          type="button"
          onClick={() => setTab(1)}
          className={cn(
            "border-b-2 px-4 py-2.5 text-sm font-medium transition",
            tab === 1 ? "border-brand text-brand" : "border-transparent text-gray-500 hover:text-gray-700"
          )}
        >
          My lab ({saved.size})
        </button>
      </div>

      <Reveal delay={0.06}>
        <div className="mt-6 flex flex-col gap-6 lg:flex-row">
          <Card className="h-fit w-full shrink-0 p-4 lg:w-52">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Filter by type
            </p>
            <div className="mt-2 space-y-1">
              <button
                type="button"
                onClick={() => setTypeFilter(null)}
                className={cn(
                  "block w-full rounded-lg px-3 py-2 text-left text-sm transition",
                  !typeFilter ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                All
              </button>
              {WAZILAB_LAB_FILTERS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setTypeFilter(f.value)}
                  className={cn(
                    "block w-full rounded-lg px-3 py-2 text-left text-sm transition",
                    typeFilter === f.value ? "bg-brand text-white" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </Card>

          <div className="flex-1">
            <p className="mb-4 text-sm text-gray-500">
              Showing {filtered.length} item{filtered.length !== 1 ? "s" : ""}
            </p>

            {filtered.length === 0 ? (
              <Card className="py-16 text-center text-sm text-gray-400">
                {tab === 1
                  ? "Nothing saved yet. Browse resources and add to My lab."
                  : "No resources found."}
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {filtered.map((item) => (
                  <Card
                    key={item.slug}
                    hover
                    className="flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover sm:flex-row"
                  >
                    <div className="relative h-40 w-full shrink-0 overflow-hidden bg-gray-100 sm:h-auto sm:w-48">
                      {item.thumbnailUrl ? (
                        <Image
                          src={item.thumbnailUrl}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 100vw, 192px"
                          className="object-cover"
                          unoptimized={item.thumbnailUrl.startsWith("/content/")}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <FlaskConical className="h-8 w-8 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand-dark">
                          <FlaskConical className="h-3.5 w-3.5" />
                        </span>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      </div>

                      {item.description && (
                        <p className="mt-2 line-clamp-2 text-sm text-gray-500">{item.description}</p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <Badge variant="outline" size="sm" className="capitalize">
                          {item.type.toLowerCase()}
                        </Badge>
                        {item.category && (
                          <Badge variant="muted" size="sm">
                            {item.category}
                          </Badge>
                        )}
                        {item.tags.slice(0, 2).map((t) => (
                          <Badge key={t} variant="muted" size="sm">
                            {t}
                          </Badge>
                        ))}
                      </div>

                      <div className="mt-auto flex items-center gap-2 pt-4">
                        <Button
                          size="sm"
                          variant={saved.has(item.id) ? "primary" : "outline"}
                          disabled={isPending}
                          onClick={() => toggleSave(item.id, item.title)}
                        >
                          {saved.has(item.id) ? "Saved" : "My lab"}
                        </Button>
                        <Button asChild size="sm" variant="ghost">
                          <Link href={`/lab-resources/${item.slug}`}>Learn more</Link>
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </Reveal>
    </div>
  );
}
