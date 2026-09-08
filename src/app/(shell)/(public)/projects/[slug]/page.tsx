import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProjectBySlug, hasUserLikedProject } from "@/lib/actions/projects";
import { ProjectLikeButton } from "@/components/projects/ProjectLikeButton";
import { ImageContainer, OptimizedImage } from "@/components/shared/OptimizedImage";
import { getAuthSession } from "@/lib/auth-server";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const session = await getAuthSession();
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const tags = (project.tags as string[] | null) ?? [];
  const mediaGallery =
    (project.mediaGallery as { url: string; type: "image" | "video"; caption?: string }[] | null) ?? [];
  const liked = session?.user?.id
    ? await hasUserLikedProject(session.user.id, project.id)
    : false;

  return (
    <div className="learner-canvas pb-12">
      <div className="relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/40 via-gray-900/10 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <Breadcrumbs
            theme="dark"
            className="mb-4"
            items={[{ label: "Projects", href: "/projects" }, { label: project.title }]}
          />
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-0 bg-brand/30 text-white shadow-none backdrop-blur-none">
              {project.category}
            </Badge>
            <Badge variant="outline" className="border-white/30 bg-white/10 capitalize text-white/90">
              {project.status.toLowerCase()}
            </Badge>
            {tags.map((t) => (
              <Badge key={t} variant="outline" className="border-white/20 bg-white/5 text-white/80">
                {t}
              </Badge>
            ))}
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
            {project.title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-stretch">
          {project.thumbnailUrl && (
            <ImageContainer className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl shadow-md lg:sticky lg:top-24 lg:aspect-auto lg:h-auto lg:w-72 lg:self-stretch">
              <OptimizedImage
                src={project.thumbnailUrl}
                alt={project.title}
                fill
                sizes="(max-width: 1024px) 100vw, 288px"
                className="object-cover"
              />
            </ImageContainer>
          )}
          <div className="min-w-0 flex-1">
        <p className="whitespace-pre-wrap text-gray-600 leading-relaxed">{project.description}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Image
            src={
              project.creator.avatarUrl ??
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.creator.username}`
            }
            alt=""
            width={44}
            height={44}
            className="rounded-full ring-2 ring-brand/20"
            unoptimized={!project.creator.avatarUrl}
          />
          <Link href={`/profile/${project.creator.username}`} className="font-semibold hover:text-brand">
            {project.creator.fullName}
          </Link>
          <span className="text-gray-400">· {project.likesCount} likes</span>
          {session?.user?.id && (
            <ProjectLikeButton
              userId={session.user.id}
              projectId={project.id}
              initialLiked={liked}
              initialCount={project.likesCount}
            />
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {project.githubUrl && (
            <Button asChild variant="secondary">
              <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                View on GitHub
              </a>
            </Button>
          )}
          {project.demoUrl && (
            <Button asChild variant="outline">
              <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                Live demo
              </a>
            </Button>
          )}
        </div>

        {project.organization && (
          <div className="mt-6 flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3">
            {project.organization.logoUrl ? (
              <Image
                src={project.organization.logoUrl}
                alt={project.organization.name}
                width={36}
                height={36}
                className="rounded-lg bg-white"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand/10 text-sm font-bold text-brand">
                {project.organization.name.charAt(0)}
              </div>
            )}
            <div className="text-sm">
              <p className="text-gray-500">Built in partnership with</p>
              <Link
                href={`/organizations/${project.organization.slug}`}
                className="font-semibold text-brand hover:underline"
              >
                {project.organization.name}
              </Link>
            </div>
          </div>
        )}

        {project.objectives && (
          <div className="mt-8">
            <h2 className="section-accent-title text-base">Objectives</h2>
            <p className="mt-2 whitespace-pre-wrap text-gray-600 leading-relaxed">{project.objectives}</p>
          </div>
        )}

        {project.teamMembers.length > 0 && (
          <div className="mt-8">
            <h2 className="section-accent-title text-base">Team</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {project.teamMembers.map((m) => (
                <div key={m.id} className="flex items-center gap-2 rounded-full border border-gray-100 bg-gray-50 py-1.5 pl-1.5 pr-3">
                  <Image
                    src={
                      m.user?.avatarUrl ??
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.user?.username ?? m.name}`
                    }
                    alt=""
                    width={28}
                    height={28}
                    className="rounded-full"
                    unoptimized={!m.user?.avatarUrl}
                  />
                  <span className="text-sm font-medium">{m.user?.fullName ?? m.name}</span>
                  <Badge variant="muted" size="sm" className="capitalize">
                    {m.role.toLowerCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {mediaGallery.length > 0 && (
          <div className="mt-8">
            <h2 className="section-accent-title text-base">Gallery</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {mediaGallery.map((m, i) =>
                m.type === "video" ? (
                  <a
                    key={i}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex aspect-video items-center justify-center rounded-lg bg-gray-900 text-sm font-medium text-white"
                  >
                    ▶ Watch video
                  </a>
                ) : (
                  <div key={i} className="relative aspect-video overflow-hidden rounded-lg">
                    <Image
                      src={m.url}
                      alt={m.caption ?? ""}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover"
                      unoptimized={m.url.startsWith("/content/")}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {project.documentation && (
          <div className="mt-8">
            <h2 className="section-accent-title text-base">Documentation</h2>
            <p className="mt-2 whitespace-pre-wrap text-gray-600 leading-relaxed">{project.documentation}</p>
          </div>
        )}

        {project.impact && (
          <div className="mt-8">
            <h2 className="section-accent-title text-base">Impact assessment</h2>
            <p className="mt-2 whitespace-pre-wrap text-gray-600 leading-relaxed">{project.impact}</p>
          </div>
        )}

        <Card className="mt-8 p-6">
          <h2 className="section-accent-title text-base">Share this project</h2>
          <p className="mt-2 text-sm text-gray-500">
            Found this inspiring? Sign in to like and showcase your own work.
          </p>
          {!session?.user && (
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href="/auth/login">Sign in</Link>
            </Button>
          )}
        </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
