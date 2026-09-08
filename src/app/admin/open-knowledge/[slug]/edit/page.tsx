import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { OpenKnowledgeEditorForm } from "@/components/knowledge/OpenKnowledgeEditorForm";
import type { OpenKnowledgeCategory } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditOpenKnowledgeResourcePage({ params }: { params: { slug: string } }) {
  const item = await db.openKnowledgeResource.findUnique({ where: { slug: params.slug } });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/admin/open-knowledge">← Open Knowledge</Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit: {item.title}</h1>
          <p className="mt-1 text-sm text-gray-500">/{item.slug}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a
            href={item.externalUrl ?? item.fileUrl ?? `/open-knowledge/${item.slug}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Preview
          </a>
        </Button>
      </div>
      <OpenKnowledgeEditorForm
        id={item.id}
        initial={{
          slug: item.slug,
          title: item.title,
          description: item.description ?? "",
          category: item.category as OpenKnowledgeCategory,
          authorName: item.authorName ?? "",
          fileUrl: item.fileUrl ?? "",
          externalUrl: item.externalUrl ?? "",
          thumbnailUrl: item.thumbnailUrl ?? "",
          tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
          isFeatured: item.isFeatured,
        }}
      />
    </div>
  );
}
