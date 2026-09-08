"use client";

import { useState } from "react";
import Link from "next/link";
import { ContentImage } from "@/components/shared/ContentImage";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { formatCurrency } from "@/lib/utils";
import { KitPurchaseActions } from "@/components/kits/KitPurchaseActions";
import { Check, BookOpen, Play, FileText, Lightbulb, ClipboardList } from "lucide-react";

const TABS = ["Overview", "What's in the box", "Learning materials", "Projects", "Gallery"] as const;

type KitDetail = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  difficulty: string;
  ageRange: string | null;
  price: number;
  isFree: boolean;
  inventoryCount: number;
  learningOutcomes: string[];
  projectIdeas: string[];
  relatedCourseSlugs: string[];
  components: { id: string; name: string; quantity: number; description: string | null }[];
  materials: {
    id: string;
    title: string;
    type: string;
    description: string | null;
    url: string | null;
    durationMinutes: number | null;
  }[];
  gallery: { id: string; url: string; caption: string | null; isPrimary: boolean }[];
};

function materialIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return <Play className="h-4 w-4 text-brand" />;
    case "PDF":
      return <FileText className="h-4 w-4 text-brand" />;
    case "PROJECT":
      return <Lightbulb className="h-4 w-4 text-brand" />;
    case "WORKSHEET":
      return <ClipboardList className="h-4 w-4 text-brand" />;
    default:
      return <BookOpen className="h-4 w-4 text-brand" />;
  }
}

export function KitDetailView({
  kit,
  owned,
  relatedCourses,
}: {
  kit: KitDetail;
  owned: boolean;
  relatedCourses: { slug: string; title: string }[];
}) {
  const [tab, setTab] = useState(0);
  const hero = kit.gallery.find((g) => g.isPrimary) ?? kit.gallery[0];
  const heroUrl = hero?.url || kit.thumbnailUrl || "";

  return (
    <div className="learner-canvas pb-12">
      <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row sm:px-6">
          <div className="relative h-72 w-full shrink-0 overflow-hidden rounded-2xl bg-gray-100 shadow-card ring-1 ring-gray-100 md:w-[420px]">
            {heroUrl && (
              <ContentImage src={heroUrl} alt={kit.title} fill className="object-cover" priority sizes="420px" />
            )}
          </div>
          <div className="flex-1">
            <Breadcrumbs
              className="mb-3"
              items={[{ label: "Kits", href: "/kits" }, { label: kit.title }]}
            />
            {kit.category && <Badge className="mb-2">{kit.category}</Badge>}
            <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">{kit.title}</h1>
            {kit.subtitle && <p className="mt-2 text-gray-500">{kit.subtitle}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="capitalize">{kit.difficulty.toLowerCase()}</Badge>
              {kit.ageRange && <Badge variant="outline">Ages {kit.ageRange}</Badge>}
              <Badge variant="outline">{kit.components.length} components</Badge>
            </div>
            <p className="mt-4 text-xl font-bold text-brand">
              {kit.isFree ? "Free" : formatCurrency(kit.price)}
            </p>
            <div className="mt-4 flex flex-col gap-3">
              <KitPurchaseActions kit={kit} owned={owned} />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <div className="flex gap-2 overflow-x-auto rounded-2xl bg-gray-100 p-1">
          {TABS.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setTab(i)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === i ? "bg-brand text-white shadow-sm" : "text-gray-600 hover:bg-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 0 && (
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 md:col-span-2">
                <h2 className="section-accent-title mb-3 text-base">About this kit</h2>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{kit.description}</p>
                {kit.learningOutcomes.length > 0 && (
                  <>
                    <h3 className="font-semibold mt-6 mb-2">What you will learn</h3>
                    <ul className="space-y-2">
                      {kit.learningOutcomes.map((o) => (
                        <li key={o} className="flex gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
              <Card className="p-6 h-fit">
                <h3 className="font-semibold mb-2">Kit details</h3>
                <p className="text-sm text-gray-500">
                  {kit.inventoryCount > 0
                    ? `${kit.inventoryCount} in stock`
                    : "Contact for availability"}
                </p>
                {relatedCourses.length > 0 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-400 mb-2">Related courses</p>
                    {relatedCourses.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/courses/${c.slug}`}
                        className="block text-sm text-brand hover:underline"
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          )}

          {tab === 1 && (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3">Component</th>
                    <th className="p-3 text-center">Qty</th>
                    <th className="text-left p-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {kit.components.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="p-3 font-medium">{c.name}</td>
                      <td className="p-3 text-center">{c.quantity}</td>
                      <td className="p-3 text-gray-500">{c.description || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </Card>
          )}

          {tab === 2 && (
            <div className="space-y-3">
              {kit.materials.map((m, idx) => (
                <Card key={m.id} className="p-4 flex gap-3">
                  {materialIcon(m.type)}
                  <div className="flex-1">
                    <p className="font-medium">
                      {idx + 1}. {m.title}
                    </p>
                    <Badge variant="outline" className="mt-1 text-xs capitalize">
                      {m.type.toLowerCase()}
                    </Badge>
                    {m.description && (
                      <p className="text-sm text-gray-500 mt-1">{m.description}</p>
                    )}
                    {m.url && (
                      <a
                        href={m.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-brand mt-2 inline-block hover:underline"
                      >
                        Open resource →
                      </a>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {tab === 3 && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {kit.projectIdeas.map((p) => (
                <Card key={p} className="p-4">
                  <Lightbulb className="h-5 w-5 text-brand mb-2" />
                  <p className="font-semibold">{p}</p>
                </Card>
              ))}
            </div>
          )}

          {tab === 4 && (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {kit.gallery.map((img) => (
                <Card key={img.id} className="overflow-hidden p-0">
                  <div className="relative h-48">
                    <ContentImage src={img.url} alt={img.caption ?? ""} fill className="object-cover" sizes="33vw" />
                  </div>
                  {img.caption && (
                    <p className="p-2 text-xs text-gray-500">{img.caption}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
