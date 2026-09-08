import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function HomeNewsCard({
  slug,
  title,
  excerpt,
  category,
}: {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
}) {
  return (
    <Link href={`/blog/${slug}`} className="block h-full w-[280px]">
      <Card hover className="flex h-full flex-col p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover">
        <Badge variant="muted" size="sm" className="w-fit">
          {category}
        </Badge>
        <h3 className="mt-2 line-clamp-2 text-sm font-semibold text-gray-900">{title}</h3>
        {excerpt && <p className="mt-2 line-clamp-3 text-xs text-gray-500">{excerpt}</p>}
      </Card>
    </Link>
  );
}
