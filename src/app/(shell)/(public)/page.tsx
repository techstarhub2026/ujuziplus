import { getAuthSession } from "@/lib/auth-server";
import { getPublishedCourses } from "@/lib/actions/enrollments";
import { getPublishedKits } from "@/lib/actions/kits";
import { getPrograms } from "@/lib/actions/programs";
import { getCompetitions } from "@/lib/actions/competitions";
import { getAllOrganizations } from "@/lib/actions/organizations";
import {
  getHomeContinueCourse,
  getHomePendingProgram,
} from "@/lib/actions/student";
import { getFeaturedMentors } from "@/lib/actions/mentors";
import { getPublishedBlogPosts } from "@/lib/actions/blog";
import { getShowcaseProjects } from "@/lib/actions/showcase";
import { getPublishedProjects } from "@/lib/actions/projects";
import { getPlatformSettings } from "@/lib/actions/platform-settings";
import { formatDateTz } from "@/lib/utils";
import { HomePageClient } from "./HomePageClient";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getAuthSession();
  const userId = session?.user?.id;

  const [
    programs,
    courses,
    kits,
    competitions,
    organizations,
    continueCourse,
    pendingProgram,
    mentors,
    blogPosts,
    showcaseProjects,
    innovationProjects,
    platformSettings,
  ] =
    await Promise.all([
      getPrograms().catch(() => []),
      getPublishedCourses().catch(() => []),
      getPublishedKits().catch(() => []),
      getCompetitions().catch(() => []),
      getAllOrganizations().catch(() => []),
      userId ? getHomeContinueCourse(userId).catch(() => null) : Promise.resolve(null),
      userId ? getHomePendingProgram(userId).catch(() => null) : Promise.resolve(null),
      getFeaturedMentors(10).catch(() => []),
      getPublishedBlogPosts().catch(() => []),
      getShowcaseProjects().catch(() => []),
      getPublishedProjects().catch(() => []),
      getPlatformSettings().catch(() => null),
    ]);

  const kitItems = kits.slice(0, 12);

  const stemUpdates = blogPosts.filter((p) => p.category === "STEM Update").slice(0, 6);
  const womenInTechStories = blogPosts.filter((p) => p.category === "Women in Tech").slice(0, 6);
  const communityNews = blogPosts.filter((p) => p.category === "Community News").slice(0, 6);
  const studentShowcase = showcaseProjects.slice(0, 8);
  const featuredInnovationProjects = innovationProjects.slice(0, 8);
  const aiRoboticsCourses = courses
    .filter((c) => c.category === "AI" || c.category === "Robotics")
    .slice(0, 10);

  return (
    <HomePageClient
      isAuthenticated={!!userId}
      homeSectionBackgroundUrl={platformSettings?.homeSectionBackgroundUrl ?? null}
      homeSectionBackgroundMode={platformSettings?.homeSectionBackgroundMode ?? "tile"}
      particlesEnabled={platformSettings?.particlesEnabled ?? false}
      particlesColors={platformSettings?.particlesColors ?? "#f39223,#00004D,#1a1a6b,#e0831a"}
      particlesRainbowMode={platformSettings?.particlesRainbowMode ?? false}
      particlesSpeed={platformSettings?.particlesSpeed ?? 1}
      particlesConnectDistance={platformSettings?.particlesConnectDistance ?? 140}
      particlesLineThickness={platformSettings?.particlesLineThickness ?? 1}
      particlesInteraction={platformSettings?.particlesInteraction ?? "repel"}
      particlesScope={platformSettings?.particlesScope ?? "full"}
      particlesIntensity={platformSettings?.particlesIntensity ?? 1}
      stats={{
        programCount: programs.length,
        courseCount: courses.length,
        kitCount: kits.length,
        mentorCount: mentors.length,
      }}
      continueCourse={continueCourse}
      pendingProgram={pendingProgram}
      organizations={organizations.map((o) => ({
        id: o.id,
        name: o.name,
        logoUrl: o.logoUrl,
        type: o.type,
        isVerified: o.isVerified,
        memberCount: o.memberCount,
      }))}
      programs={programs.slice(0, 8).map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title,
        type: p.type,
        thumbnailUrl: p.thumbnailUrl,
        startDate: formatDateTz(p.startDate),
        endDate: formatDateTz(p.endDate),
        format: p.format,
        enrolledCount: p.enrolledCount,
        seats: p.seats,
      }))}
      courses={courses.slice(0, 12).map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        instructorName: c.instructor.fullName,
        durationHours: c.durationHours,
        level: c.level,
        category: c.category,
        isFree: c.isFree,
      }))}
      kits={kitItems}
      competitions={competitions
        .filter((c) => c.status !== "COMPLETED")
        .slice(0, 8)
        .map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          thumbnailUrl: c.thumbnailUrl,
          startDate: formatDateTz(c.startDate),
          prize: c.prize,
          status: c.status,
          teamsCount: c.teamsCount,
        }))}
      mentors={mentors}
      stemUpdates={stemUpdates.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
      }))}
      womenInTechStories={womenInTechStories.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
      }))}
      communityNews={communityNews.map((p) => ({
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
      }))}
      studentShowcase={studentShowcase.map((p) => ({
        title: p.title,
        tagline: p.tagline,
        thumbnailUrl: p.thumbnailUrl,
        track: p.track,
        authorName: p.user?.fullName ?? null,
      }))}
      featuredInnovationProjects={featuredInnovationProjects.map((p) => ({
        slug: p.slug,
        title: p.title,
        description: p.description,
        thumbnailUrl: p.thumbnailUrl,
        category: p.category,
      }))}
      aiRoboticsCourses={aiRoboticsCourses.map((c) => ({
        id: c.id,
        slug: c.slug,
        title: c.title,
        thumbnailUrl: c.thumbnailUrl,
        instructorName: c.instructor.fullName,
        durationHours: c.durationHours,
        level: c.level,
        category: c.category,
        isFree: c.isFree,
      }))}
    />
  );
}
