import { BlogPostCard } from "@/components/shared/BlogPostCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { getPublishedBlogPosts } from "@/lib/actions/blog";
import { formatDate } from "@/lib/utils";
import { Newspaper } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <div className="learner-canvas mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <LearnerPageHero
        banner="blog"
        title="UjuziLab Blog"
        subtitle="Articles, tutorials, and ecosystem updates from our community."
      />

      <div className="mt-8 space-y-4">
        {posts.map((p, i) => (
          <div key={p.id} className={`animate-fade-in stagger-${Math.min(i + 1, 4)}`}>
            <BlogPostCard
              href={`/blog/${p.slug}`}
              title={p.title}
              excerpt={p.excerpt}
              category={p.category}
              publishedAt={p.publishedAt ? formatDate(p.publishedAt) : undefined}
              authorName={p.author?.fullName}
            />
          </div>
        ))}
        {posts.length === 0 && (
          <EmptyState
            icon={<Newspaper className="h-8 w-8 text-brand" />}
            title="No posts yet"
            description="Check back soon for tutorials, stories, and platform updates."
            actionLabel="Explore courses"
            actionHref="/courses"
          />
        )}
      </div>
    </div>
  );
}
