import { ContentImage } from "@/components/shared/ContentImage";
import { Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { MediaCard } from "@/components/shared/MediaCard";

export function ProjectCard({
  slug,
  title,
  description,
  category,
  thumbnailUrl,
  creatorName,
  creatorAvatar,
  likeCount,
}: {
  slug: string;
  title: string;
  description: string;
  category: string;
  thumbnailUrl?: string | null;
  creatorName: string;
  creatorAvatar?: string | null;
  likeCount?: number;
}) {
  return (
    <MediaCard
      href={`/projects/${slug}`}
      title={title}
      subtitle={description}
      badges={
        <Badge variant="default" size="sm" className="bg-white/95 backdrop-blur-sm">
          {category}
        </Badge>
      }
      image={
        thumbnailUrl ? (
          <ContentImage
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50 text-sm text-gray-400">
            No preview
          </div>
        )
      }
      footer={
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar src={creatorAvatar} alt={creatorName} size="sm" ring />
            <span className="truncate text-xs text-gray-500">{creatorName}</span>
          </div>
          {likeCount !== undefined && likeCount > 0 && (
            <span className="inline-flex shrink-0 items-center gap-1 text-xs text-gray-400">
              <Heart className="h-3.5 w-3.5" />
              {likeCount}
            </span>
          )}
        </div>
      }
    />
  );
}
