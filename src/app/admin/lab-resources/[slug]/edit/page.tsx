import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { LabResourceEditorForm } from "@/components/lab/LabResourceEditorForm";
import type { LabResourceType } from "@prisma/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EditLabResourcePage({ params }: { params: { slug: string } }) {
  const item = await db.labResource.findUnique({ where: { slug: params.slug } });
  if (!item) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
            <Link href="/admin/content">← Content</Link>
          </Button>
          <h1 className="text-2xl font-bold">Edit: {item.title}</h1>
          <p className="mt-1 text-sm text-gray-500">/{item.slug}</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href={`/lab-resources/${item.slug}`} target="_blank" rel="noopener noreferrer">Preview</a>
        </Button>
      </div>
      <LabResourceEditorForm
        id={item.id}
        initial={{
          slug: item.slug,
          title: item.title,
          description: item.description ?? "",
          content: item.content ?? "",
          type: item.type as LabResourceType,
          category: item.category ?? "",
          fileUrl: item.fileUrl ?? "",
          pdfUrls: Array.isArray(item.pdfUrls) ? (item.pdfUrls as string[]) : [],
          imageUrls: Array.isArray(item.imageUrls) ? (item.imageUrls as string[]) : [],
          thumbnailUrl: item.thumbnailUrl ?? "",
          externalUrl: item.externalUrl ?? "",
          tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
        }}
      />
    </div>
  );
}
