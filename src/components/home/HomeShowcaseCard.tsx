import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

export function HomeShowcaseCard({
  title,
  tagline,
  thumbnailUrl,
  track,
  authorName,
}: {
  title: string;
  tagline: string | null;
  thumbnailUrl: string | null;
  track: string | null;
  authorName?: string | null;
}) {
  return (
    <Link href="/showcase" className="block h-full w-[280px]">
      <Card hover className="flex h-full flex-col overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
        <div className="relative h-32 w-full shrink-0 overflow-hidden bg-gray-100">
          {thumbnailUrl ? (
            <Image
              src={thumbnailUrl}
              alt={title}
              fill
              sizes="280px"
              className="object-cover"
              unoptimized={thumbnailUrl.startsWith("/content/")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Trophy className="h-8 w-8 text-gray-300" />
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          {track && (
            <Badge variant="muted" size="sm" className="w-fit">
              {track}
            </Badge>
          )}
          <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-900">{title}</h3>
          {tagline && <p className="mt-2 line-clamp-2 text-xs text-gray-500">{tagline}</p>}
          {authorName && <p className="mt-auto pt-3 text-xs font-medium text-gray-400">by {authorName}</p>}
        </div>
      </Card>
    </Link>
  );
}
