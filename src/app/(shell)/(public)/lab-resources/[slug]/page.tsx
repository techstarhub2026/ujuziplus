import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getLabResourceBySlug, getUserLabResourceIds } from "@/lib/actions/lab-resources";
import { LabResourceBookmarkButton } from "@/components/lab/LabResourceBookmarkButton";
import { LabResourceContentWithToc } from "@/components/lab/LabResourceContentWithToc";
import { getAuthSession } from "@/lib/auth-server";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { ExternalLink } from "lucide-react";

export default async function LabResourceDetailPage({ params }: { params: { slug: string } }) {
  const session = await getAuthSession();
  const item = await getLabResourceBySlug(params.slug);
  if (!item) notFound();

  const savedIds = session?.user?.id ? await getUserLabResourceIds(session.user.id) : [];
  const pdfUrls = Array.isArray(item.pdfUrls) ? (item.pdfUrls as string[]) : [];
  const imageUrls = Array.isArray(item.imageUrls) ? (item.imageUrls as string[]) : [];
  const tags = Array.isArray(item.tags) ? (item.tags as string[]) : [];
  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  return (
    <div className="pb-16">
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Breadcrumbs
          items={[
            { label: "Lab Resources", href: "/lab-resources" },
            { label: item.title },
          ]}
        />
      </div>

      {/* Hero */}
      {item.thumbnailUrl && (
        <div className="mx-auto mt-4 max-w-5xl px-4 sm:px-6">
          <div className="max-h-96 w-full overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              width={1200}
              height={630}
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="mx-auto h-auto max-h-96 w-auto object-contain"
              unoptimized={item.thumbnailUrl.startsWith("/content/")}
            />
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{item.title}</h1>
        {item.description && <p className="mt-2 max-w-2xl text-sm text-gray-600">{item.description}</p>}

        <div className="mt-4 flex flex-wrap gap-1.5">
          <Badge variant="outline" size="sm" className="capitalize">
            {item.type.toLowerCase()}
          </Badge>
          {item.category && (
            <Badge variant="muted" size="sm">
              {item.category}
            </Badge>
          )}
          {tags.map((t) => (
            <Badge key={t} variant="muted" size="sm">
              {t}
            </Badge>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          {session?.user?.id && (
            <LabResourceBookmarkButton
              userId={session.user.id}
              resourceId={item.id}
              initialSaved={savedIds.includes(item.id)}
              title={item.title}
            />
          )}
          {item.externalUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={item.externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                External resource
              </a>
            </Button>
          )}
          {item.fileUrl && (
            <Button asChild variant="outline" size="sm">
              <a href={item.fileUrl} download>Download file</a>
            </Button>
          )}
          {isAdmin && (
            <Button asChild variant="ghost" size="sm">
              <Link href={`/admin/lab-resources/${item.slug}/edit`}>Edit resource</Link>
            </Button>
          )}
        </div>

        <hr className="my-8 border-gray-200" />

        {/* Content with scroll-spy TOC */}
        {item.content ? (
          <LabResourceContentWithToc html={item.content} />
        ) : item.description ? (
          <p className="text-gray-600">{item.description}</p>
        ) : null}

        {/* Additional images */}
        {imageUrls.length > 0 && (
          <div className="mt-10 space-y-3">
            <h2 className="text-base font-semibold">Images</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {imageUrls.map((url, i) => (
                <div key={i} className="relative aspect-video overflow-hidden rounded-xl border border-gray-100 shadow-sm">
                  <Image
                    src={url}
                    alt={`${item.title} image ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized={url.startsWith("/content/")}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDFs */}
        {pdfUrls.length > 0 && (
          <div className="mt-10 space-y-4">
            <h2 className="text-base font-semibold">Documents & Datasheets</h2>
            {pdfUrls.map((url, i) => (
              <PdfViewer key={i} url={url} defaultExpanded={i === 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
