import Link from "next/link";
import { getAuthSession } from "@/lib/auth-server";
import { getShowcaseProjects, toggleShowcaseLike } from "@/lib/actions/showcase";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { ShowcaseGallery } from "@/components/showcase/ShowcaseGallery";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trophy, Rocket, Star, Upload } from "lucide-react";

export default async function ShowcasePage() {
  const [session, projects] = await Promise.all([
    getAuthSession(),
    getShowcaseProjects().catch(() => []),
  ]);

  const isAuthenticated = !!session?.user;

  async function handleLike(projectId: string) {
    "use server";
    const res = await toggleShowcaseLike(projectId);
    return { success: res.success, liked: res.success ? res.data?.liked : undefined };
  }

  const stats = {
    total: projects.length,
    featured: projects.filter((p) => p.isFeatured).length,
    tracks: new Set(projects.map((p) => p.track).filter(Boolean)).size,
  };

  return (
    <div className="learner-canvas mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <LearnerPageHero
        banner="showcase"
        title="Innovation Showcase"
        subtitle="Real projects built by UjuziPlus Lab learners — from robotics and IoT systems to AI tools, mobile apps, and startup prototypes. Every project here started as a curious mind with access to a course and a mentor."
        eyebrow={`${stats.total} projects · ${stats.featured} featured · ${stats.tracks} tracks`}
        panel={
          isAuthenticated ? (
            <Button asChild>
              <Link href="/dashboard/showcase/submit">
                <Upload className="h-4 w-4 mr-1.5" />Submit your project
              </Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/auth/login?callbackUrl=/dashboard/showcase/submit">Submit a project</Link>
            </Button>
          )
        }
      />

      {/* Why the showcase exists */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: <Rocket className="h-5 w-5 text-brand" />, title: "Real-world impact", body: "These projects solve actual problems in African communities — agriculture, health, education, and more." },
          { icon: <Star className="h-5 w-5 text-amber-500" />, title: "Inspire the next learner", body: "Seeing what others built tells you what's possible. Your project can be someone else's 'aha' moment." },
          { icon: <Trophy className="h-5 w-5 text-violet-500" />, title: "Build your portfolio", body: "Featured projects are promoted to industry partners, mentors, and hiring managers in our network." },
        ].map((item) => (
          <Card key={item.title} className="flex gap-3 p-5">
            <div className="shrink-0 mt-0.5">{item.icon}</div>
            <div>
              <p className="font-semibold text-sm mb-1">{item.title}</p>
              <p className="text-xs text-gray-500 leading-relaxed">{item.body}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12">
        {projects.length === 0 ? (
          <Card className="py-20 text-center">
            <p className="text-gray-400 mb-4">No projects published yet. Be the first to submit!</p>
            {isAuthenticated ? (
              <Button asChild>
                <Link href="/dashboard/showcase/submit">Submit your project</Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/auth/login">Sign in to submit</Link>
              </Button>
            )}
          </Card>
        ) : (
          <ShowcaseGallery
            projects={projects}
            isAuthenticated={isAuthenticated}
            onLike={handleLike}
          />
        )}
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-2xl bg-gradient-to-br from-brand/10 to-violet-50 border border-brand/20 px-8 py-10 text-center">
        <h2 className="font-display text-xl font-bold mb-2">Built something? Show the world.</h2>
        <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
          Whether it&apos;s a first LED circuit or a full IoT system, your project matters. Submit it, get mentor feedback, and earn recognition.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {isAuthenticated ? (
            <Button asChild>
              <Link href="/dashboard/showcase/submit">
                <Upload className="h-4 w-4 mr-1.5" />Submit my project
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/auth/register">Create free account</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/courses">Start learning first</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
