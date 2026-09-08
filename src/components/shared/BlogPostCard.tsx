import { Calendar, User } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function BlogPostCard({
  href,
  title,
  excerpt,
  category,
  publishedAt,
  authorName,
  className,
}: {
  href: string;
  title: string;
  excerpt?: string | null;
  category: string;
  publishedAt?: string;
  authorName?: string | null;
  className?: string;
}) {
  return (
    <Link href={href} className={cn("group block", className)}>
      <Card hover padding="md" variant="elevated" className="relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-1 scale-y-0 bg-gradient-to-b from-brand-glow via-brand to-brand-dark transition-transform duration-300 group-hover:scale-y-100" />
        <div className="pl-2">
          <Badge variant="default" size="sm">
            {category}
          </Badge>
          <h2 className="mt-3 font-display text-xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-brand line-clamp-2">
            {title}
          </h2>
          {excerpt && (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{excerpt}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-medium text-gray-500">
            {publishedAt && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
                <Calendar className="h-3.5 w-3.5 text-brand" />
                {publishedAt}
              </span>
            )}
            {authorName && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-light/60 px-2.5 py-1">
                <User className="h-3.5 w-3.5 text-brand" />
                {authorName}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
