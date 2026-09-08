import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionBanner } from "@/components/shared/LearnerPageHero";
import { getBlogPostBySlug } from "@/lib/actions/blog";
import { formatDate } from "@/lib/utils";

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getBlogPostBySlug(params.slug);
  if (!post) notFound();

  return (
    <article className="learner-canvas pb-16">
      <SectionBanner banner="blog" className="px-4 py-12 sm:px-6 md:py-16">
        <div className="mx-auto max-w-3xl">
          <Button asChild variant="ghost" size="sm" className="mb-6 text-white/70 hover:bg-white/10 hover:text-white">
            <Link href="/blog">← Blog</Link>
          </Button>
          <Badge variant="outline" className="border-0 bg-white/20 text-white shadow-none backdrop-blur-none">
            {post.category}
          </Badge>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl text-balance drop-shadow-lg">
            {post.title}
          </h1>
          <p className="mt-4 text-sm text-white/85">
            {post.publishedAt ? formatDate(post.publishedAt) : ""}
            {post.author ? ` · ${post.author.fullName}` : ""}
          </p>
        </div>
      </SectionBanner>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {post.excerpt && (
          <p className="mb-8 border-l-4 border-brand pl-4 text-lg leading-relaxed text-gray-600">
            {post.excerpt}
          </p>
        )}
        <div className="prose prose-gray max-w-none whitespace-pre-wrap leading-relaxed text-gray-700">
          {post.body}
        </div>
      </div>
    </article>
  );
}
