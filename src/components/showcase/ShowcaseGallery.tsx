"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ExternalLink, Github, Play, Tag, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type ShowcaseProjectData = {
  id: string;
  title: string;
  tagline: string | null;
  description: string;
  thumbnailUrl: string | null;
  demoUrl: string | null;
  repoUrl: string | null;
  videoUrl: string | null;
  techStack: string[];
  track: string | null;
  isFeatured: boolean;
  viewCount: number;
  likeCount: number;
  isLiked?: boolean;
  createdAt: string;
  user: {
    fullName: string;
    username: string | null;
    avatarUrl: string | null;
  };
};

interface ShowcaseCardProps {
  project: ShowcaseProjectData;
  isAuthenticated: boolean;
  onLike?: (id: string) => Promise<{ success: boolean; liked?: boolean }>;
}

function ShowcaseCard({ project, isAuthenticated, onLike }: ShowcaseCardProps) {
  const [liked, setLiked] = useState(project.isLiked ?? false);
  const [likeCount, setLikeCount] = useState(project.likeCount);
  const [isPending, startTransition] = useTransition();

  function handleLike() {
    if (!isAuthenticated || !onLike) return;
    startTransition(async () => {
      const res = await onLike(project.id);
      if (res.success) {
        setLiked(res.liked ?? !liked);
        setLikeCount((c) => c + (res.liked ? 1 : -1));
      }
    });
  }

  return (
    <article className={cn(
      "group flex flex-col rounded-2xl border bg-white shadow-sm transition hover:shadow-lg overflow-hidden",
      project.isFeatured && "ring-2 ring-brand/30"
    )}>
      {/* Thumbnail */}
      <div className="relative h-44 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {project.thumbnailUrl ? (
          <Image
            src={project.thumbnailUrl}
            alt={project.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 400px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold text-gray-200 select-none">{project.title[0]}</span>
          </div>
        )}
        {project.isFeatured && (
          <div className="absolute top-2 left-2 rounded-full bg-brand px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
            Featured
          </div>
        )}
        {project.videoUrl && (
          <a
            href={project.videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
              <Play className="h-5 w-5 text-brand ml-0.5" />
            </span>
          </a>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display font-semibold text-gray-900 line-clamp-1">{project.title}</h3>
          {project.track && (
            <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
              {project.track}
            </span>
          )}
        </div>

        {project.tagline && (
          <p className="text-sm font-medium text-brand mb-1">{project.tagline}</p>
        )}
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 flex-1">{project.description}</p>

        {/* Tech stack */}
        {project.techStack.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {project.techStack.slice(0, 4).map((t) => (
              <span key={t} className="flex items-center gap-0.5 rounded bg-gray-50 px-1.5 py-0.5 text-[10px] font-mono text-gray-500">
                <Tag className="h-2.5 w-2.5" />{t}
              </span>
            ))}
            {project.techStack.length > 4 && (
              <span className="rounded bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-400">
                +{project.techStack.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Creator */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar src={project.user.avatarUrl} alt={project.user.fullName} size="xs" />
          <span className="text-xs text-gray-500">
            by <span className="font-medium text-gray-700">{project.user.fullName}</span>
          </span>
          <span className="ml-auto text-xs text-gray-400">
            {new Date(project.createdAt).toLocaleDateString("en-TZ", { month: "short", year: "numeric" })}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handleLike}
            disabled={isPending || !isAuthenticated}
            title={isAuthenticated ? (liked ? "Unlike" : "Like this project") : "Sign in to like"}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium transition",
              liked ? "text-red-500 bg-red-50 hover:bg-red-100" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-red-500")} />
            {likeCount}
          </button>

          <span className="flex items-center gap-1 text-xs text-gray-400 ml-1">
            <Eye className="h-3.5 w-3.5" />{project.viewCount}
          </span>

          <div className="ml-auto flex items-center gap-1.5">
            {project.repoUrl && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View source code"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition"
              >
                <Github className="h-4 w-4" />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg bg-brand px-2.5 py-1 text-xs font-medium text-white hover:bg-brand/90 transition"
              >
                Live demo <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

const TRACK_OPTIONS = [
  "All", "Robotics", "IoT & Sensors", "AI & Machine Learning", "Web Development",
  "Mobile Development", "Data Science", "Electronics", "3D Design", "Entrepreneurship",
];

interface Props {
  projects: ShowcaseProjectData[];
  isAuthenticated: boolean;
  onLike?: (id: string) => Promise<{ success: boolean; liked?: boolean }>;
}

export function ShowcaseGallery({ projects, isAuthenticated, onLike }: Props) {
  const [track, setTrack] = useState("All");
  const [query, setQuery] = useState("");
  const [showFeatured, setShowFeatured] = useState(false);

  const filtered = useMemo(() => {
    let list = projects;
    if (track !== "All") list = list.filter((p) => p.track === track);
    if (showFeatured) list = list.filter((p) => p.isFeatured);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline?.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.techStack.some((t) => t.toLowerCase().includes(q)) ||
          p.user.fullName.toLowerCase().includes(q)
      );
    }
    return list;
  }, [projects, track, query, showFeatured]);

  const tracksInUse = useMemo(() => {
    const set = new Set(projects.map((p) => p.track).filter((t): t is string => !!t));
    return ["All", ...Array.from(set).sort()];
  }, [projects]);

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-2 items-center">
          <input
            type="search"
            placeholder="Search projects, creators, technologies…"
            aria-label="Search projects, creators, technologies"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-48 rounded-xl border border-gray-200 px-4 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand/40 focus:outline-none"
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 select-none">
            <input
              type="checkbox"
              checked={showFeatured}
              onChange={(e) => setShowFeatured(e.target.checked)}
              className="rounded border-gray-300 text-brand focus:ring-brand"
            />
            Featured only
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {tracksInUse.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrack(t)}
              className={cn(
                "rounded-full border px-3 py-1 text-sm font-medium transition",
                track === t
                  ? "border-brand bg-brand text-white"
                  : "border-gray-200 text-gray-600 hover:border-brand/50 hover:text-brand"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-sm text-gray-400">No projects match your filters.</p>
          <button type="button" className="mt-2 text-sm text-brand hover:underline"
            onClick={() => { setTrack("All"); setQuery(""); setShowFeatured(false); }}>
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-gray-500">{filtered.length} project{filtered.length !== 1 ? "s" : ""}</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ShowcaseCard key={p.id} project={p} isAuthenticated={isAuthenticated} onLike={onLike} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
