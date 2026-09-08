"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Box, Typography } from "@mui/material";
import { LearnerPageHero, HeroActions, TrustStrip } from "@/components/shared/LearnerPageHero";
import { KitCard } from "@/components/kits/KitCard";
import { toKitCatalogItem } from "@/components/kits/KitCatalogItem";
import { Button } from "@/components/ui/button";
import { PLATFORM } from "@/lib/constants";
import { DossierSection } from "@/components/motion/DossierSection";
import { Reveal } from "@/components/motion/Reveal";
import { PlatformPulse } from "@/components/motion/StemDisciplineTicker";
import { HomeHeroSearch } from "@/components/home/HomeHeroSearch";
import { HomeTopicExplorer } from "@/components/home/HomeTopicExplorer";
import { HomeFeaturedSpotlight } from "@/components/home/HomeFeaturedSpotlight";
import { HomeCatalogRail } from "@/components/home/HomeCatalogRail";
import { HomeProgramCard } from "@/components/home/HomeProgramCard";
import { HomeCompetitionCard } from "@/components/home/HomeCompetitionCard";
import { HomeContinueCompact } from "@/components/home/HomeContinueCompact";
import { HomeNewsCard } from "@/components/home/HomeNewsCard";
import { HomeShowcaseCard } from "@/components/home/HomeShowcaseCard";
import { HomeCourseCard } from "@/components/home/HomeCourseCard";
import type { SerializedMentor } from "@/lib/actions/mentors";

const OrgMarquee = dynamic(
  () => import("@/components/home/HomeDiscoveryMarquee").then((m) => ({ default: m.OrgMarquee })),
  { loading: () => <div className="h-24 animate-pulse rounded-2xl bg-gray-100" /> }
);
const HomeQuickCoursePeek = dynamic(
  () => import("@/components/home/HomeQuickCoursePeek").then((m) => ({ default: m.HomeQuickCoursePeek })),
  { loading: () => <div className="h-48 animate-pulse rounded-2xl bg-gray-100" /> }
);
const HomeMentorRail = dynamic(
  () => import("@/components/home/HomeMentorRail").then((m) => ({ default: m.HomeMentorRail })),
  { loading: () => <div className="h-96 animate-pulse rounded-2xl bg-gray-100" /> }
);
const ParticleNetworkBackground = dynamic(
  () => import("@/components/home/ParticleNetworkBackground").then((m) => ({ default: m.ParticleNetworkBackground })),
  { ssr: false }
);

type ContinueCourse = {
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  instructorName: string;
  durationHours: number;
  firstLessonSlug: string;
  progressPct: number;
};

type ProgramItem = {
  id: string;
  slug: string;
  title: string;
  type: string;
  thumbnailUrl: string | null;
  startDate: string | null;
  endDate: string | null;
  format: string;
  enrolledCount: number;
  seats: number;
};

type CourseItem = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  instructorName: string;
  durationHours: number;
  level: string;
  category: string | null;
  isFree: boolean;
};

type CompetitionItem = {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  startDate: string | null;
  prize: string | null;
  status: string;
  teamsCount: number;
};

type KitItem = ReturnType<typeof toKitCatalogItem>;

type OrgItem = {
  id: string;
  name: string;
  logoUrl: string | null;
  type: string;
  isVerified: boolean;
  memberCount: number;
};

type NewsItem = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
};

type ShowcaseItem = {
  title: string;
  tagline: string | null;
  thumbnailUrl: string | null;
  track: string | null;
  authorName: string | null;
};

type InnovationProjectItem = {
  slug: string;
  title: string;
  description: string;
  thumbnailUrl: string | null;
  category: string;
};

const contentShellSx = {
  maxWidth: 1280,
  mx: "auto",
  px: { xs: 2, sm: 3 },
} as const;

export function HomePageClient({
  continueCourse,
  pendingProgram,
  programs,
  courses,
  kits,
  competitions,
  organizations,
  mentors,
  isAuthenticated,
  stats,
  stemUpdates,
  womenInTechStories,
  communityNews,
  studentShowcase,
  featuredInnovationProjects,
  aiRoboticsCourses,
  homeSectionBackgroundUrl,
  homeSectionBackgroundMode,
  particlesEnabled,
  particlesColors,
  particlesRainbowMode,
  particlesSpeed,
  particlesConnectDistance,
  particlesLineThickness,
  particlesInteraction,
  particlesScope,
  particlesIntensity,
}: {
  continueCourse: ContinueCourse | null;
  pendingProgram: { title: string; slug: string; startDate: string; endDate: string; format: string } | null;
  programs: ProgramItem[];
  courses: CourseItem[];
  kits: KitItem[];
  competitions: CompetitionItem[];
  organizations: OrgItem[];
  mentors: SerializedMentor[];
  isAuthenticated: boolean;
  stats: { programCount: number; courseCount: number; kitCount: number; mentorCount?: number };
  stemUpdates: NewsItem[];
  womenInTechStories: NewsItem[];
  communityNews: NewsItem[];
  studentShowcase: ShowcaseItem[];
  featuredInnovationProjects: InnovationProjectItem[];
  aiRoboticsCourses: CourseItem[];
  homeSectionBackgroundUrl?: string | null;
  homeSectionBackgroundMode?: string;
  particlesEnabled?: boolean;
  particlesColors?: string;
  particlesRainbowMode?: boolean;
  particlesSpeed?: number;
  particlesConnectDistance?: number;
  particlesLineThickness?: number;
  particlesInteraction?: string;
  particlesScope?: string;
  particlesIntensity?: number;
}) {
  const spotlightCourse =
    courses.find((c) => c.thumbnailUrl) ?? courses[0] ?? null;
  const spotlightProgram = programs[0] ?? null;
  const spotlightKit = kits[0] ?? null;

  const spotlightMentor = mentors.find((m) => m.isFeatured) ?? mentors[0] ?? null;

  return (
    <Box className="learner-canvas home-landing" sx={{ pb: { xs: 2, md: 2.5 }, position: "relative" }}>
        {particlesEnabled && particlesScope === "full" && (
          <ParticleNetworkBackground
            enabled={particlesEnabled}
            colors={particlesColors ?? "#f39223,#00004D,#1a1a6b,#e0831a"}
            rainbowMode={!!particlesRainbowMode}
            speed={particlesSpeed ?? 1}
            connectDistance={particlesConnectDistance ?? 140}
            lineThickness={particlesLineThickness ?? 1}
            interaction={particlesInteraction ?? "repel"}
            intensity={particlesIntensity ?? 1}
          />
        )}
        <Box sx={{ position: "relative", zIndex: 1, pt: { xs: 2, md: 2.5 } }}>
        <Box sx={contentShellSx}>
        <div className="home-fold" style={{ position: "relative" }}>
          <LearnerPageHero
            size="default"
            banner="home"
            className="home-hero--compact"
            eyebrow={isAuthenticated ? "Your learning hub" : "STEM · Robotics · Innovation"}
            title={
              isAuthenticated
                ? "Welcome back"
                : `Learn by building with ${PLATFORM.name}`
            }
            subtitle={
              isAuthenticated
                ? "Search, resume, or browse what's new below."
                : "Courses, kits, bootcamps & competitions for African innovators."
            }
            panel={
              continueCourse ? (
                <HomeContinueCompact
                  {...continueCourse}
                  pendingProgram={pendingProgram}
                />
              ) : undefined
            }
          >
            <div className="home-hero--compact__search">
              <HomeHeroSearch />
            </div>
            <div className="home-hero--compact__meta">
              <PlatformPulse
                programCount={stats.programCount}
                courseCount={stats.courseCount}
                kitCount={stats.kitCount}
              />
            </div>
            <HeroActions
              primary={{ href: "/courses", label: "Browse courses" }}
              links={[
                { href: "/programs", label: "Programs" },
                { href: "/mentors", label: "Mentors" },
                { href: "/kits", label: "Kits" },
                { href: "/competitions", label: "Competitions" },
              ]}
            />
            {!isAuthenticated && <TrustStrip />}
          </LearnerPageHero>
        </div>
      </Box>

      {courses.length > 0 && (
        <Reveal className="mt-8">
          <Box sx={contentShellSx}>
            <div className="home-discover-panel home-discover-panel--transparent">
              <HomeQuickCoursePeek courses={courses} />
            </div>
          </Box>
        </Reveal>
      )}
      </Box>

      <Box sx={{ position: "relative" }}>
      {particlesEnabled && particlesScope === "belowFeatured" && (
        <ParticleNetworkBackground
          enabled={particlesEnabled}
          colors={particlesColors ?? "#f39223,#00004D,#1a1a6b,#e0831a"}
          rainbowMode={!!particlesRainbowMode}
          speed={particlesSpeed ?? 1}
          connectDistance={particlesConnectDistance ?? 140}
          lineThickness={particlesLineThickness ?? 1}
          interaction={particlesInteraction ?? "repel"}
          intensity={particlesIntensity ?? 1}
        />
      )}

      <DossierSection align="right">
        <Box sx={contentShellSx}>
          <div className="home-discover-panel">
            <HomeTopicExplorer />
          </div>
        </Box>
      </DossierSection>

      {(spotlightCourse || spotlightProgram || spotlightKit) && (
        <Reveal className="mt-8" delay={0.06}>
          <Box sx={contentShellSx}>
            <HomeFeaturedSpotlight
              course={spotlightCourse}
              program={spotlightProgram}
              kit={spotlightKit}
            />
          </Box>
        </Reveal>
      )}

      <Box
        sx={
          homeSectionBackgroundUrl
            ? homeSectionBackgroundMode === "cover"
              ? {
                  backgroundImage: `url(${homeSectionBackgroundUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "top center",
                  backgroundRepeat: "no-repeat",
                }
              : {
                  backgroundImage: `url(${homeSectionBackgroundUrl})`,
                  backgroundSize: "auto",
                  backgroundPosition: "top center",
                  backgroundRepeat: "repeat",
                }
            : undefined
        }
      >
      {mentors.length > 0 && (
        <DossierSection align="left" fullWidth>
          <Box sx={contentShellSx}>
            <HomeMentorRail mentors={mentors} featured={spotlightMentor} />
          </Box>
        </DossierSection>
      )}

      <div className="home-catalog-zone">
        {kits.length > 0 && (
          <DossierSection align="right" fullWidth>
            <Box sx={contentShellSx}>
              <HomeCatalogRail
                title="Hands-on learning kits"
                description="Hardware bundles with components, guides, and classroom materials."
                seeAllHref="/kits"
                seeAllLabel="All kits"
                itemWidth={300}
                autoScroll
              >
                {kits.map((kit) => (
                  <KitCard key={kit.id} kit={kit} />
                ))}
              </HomeCatalogRail>
            </Box>
          </DossierSection>
        )}

        {programs.length > 0 && (
          <DossierSection align="left" fullWidth>
            <Box sx={contentShellSx}>
              <HomeCatalogRail
                title="Bootcamps & programs"
                description="Cohort-based learning with fixed start dates and seat limits."
                seeAllHref="/programs"
                seeAllLabel="All programs"
                layout="grid"
              >
                {programs.map((p) => (
                  <HomeProgramCard key={p.id} {...p} />
                ))}
              </HomeCatalogRail>
            </Box>
          </DossierSection>
        )}

        {competitions.length > 0 && (
          <DossierSection align="right" fullWidth>
            <Box sx={contentShellSx}>
              <HomeCatalogRail
                title="Competitions & challenges"
                description="Build, compete, and showcase your skills with teams across the platform."
                seeAllHref="/competitions"
                seeAllLabel="All competitions"
                layout="grid"
              >
                {competitions.map((c) => (
                  <HomeCompetitionCard key={c.id} {...c} />
                ))}
              </HomeCatalogRail>
            </Box>
          </DossierSection>
        )}

        {aiRoboticsCourses.length > 0 && (
          <DossierSection align="right" fullWidth>
            <Box sx={contentShellSx}>
              <HomeCatalogRail
                title="AI & Robotics activities"
                description="Hands-on courses building AI, robotics, and automation skills."
                seeAllHref="/courses?category=AI"
                seeAllLabel="All AI & Robotics"
                itemWidth={280}
                autoScroll
                align="right"
              >
                {aiRoboticsCourses.map((c) => (
                  <HomeCourseCard key={c.id} {...c} />
                ))}
              </HomeCatalogRail>
            </Box>
          </DossierSection>
        )}

        {featuredInnovationProjects.length > 0 && (
          <DossierSection align="right" fullWidth>
            <Box sx={contentShellSx}>
              <HomeCatalogRail
                title="Featured innovation projects"
                description="Real prototypes and solutions built by the community."
                seeAllHref="/projects"
                seeAllLabel="All projects"
                itemWidth={280}
                autoScroll
              >
                {featuredInnovationProjects.map((p) => (
                  <HomeShowcaseCard
                    key={p.slug}
                    title={p.title}
                    tagline={p.description}
                    thumbnailUrl={p.thumbnailUrl}
                    track={p.category}
                  />
                ))}
              </HomeCatalogRail>
            </Box>
          </DossierSection>
        )}

        {studentShowcase.length > 0 && (
          <DossierSection align="left" fullWidth>
            <Box sx={contentShellSx}>
              <HomeCatalogRail
                title="Student innovation showcase"
                description="Competition and capstone projects from learners across the platform."
                seeAllHref="/showcase"
                seeAllLabel="All showcase projects"
                itemWidth={280}
                autoScroll
              >
                {studentShowcase.map((p, i) => (
                  <HomeShowcaseCard key={i} {...p} />
                ))}
              </HomeCatalogRail>
            </Box>
          </DossierSection>
        )}

        {stemUpdates.length > 0 && (
          <DossierSection align="right" fullWidth>
            <Box sx={contentShellSx}>
              <HomeCatalogRail
                title="Latest STEM & technology updates"
                description="News from TechStar UjuziLab and the innovation ecosystem."
                seeAllHref="/blog"
                seeAllLabel="All updates"
                itemWidth={280}
              >
                {stemUpdates.map((p) => (
                  <HomeNewsCard key={p.slug} {...p} />
                ))}
              </HomeCatalogRail>
            </Box>
          </DossierSection>
        )}

        {womenInTechStories.length > 0 && (
          <DossierSection align="left" fullWidth>
            <Box sx={contentShellSx}>
              <HomeCatalogRail
                title="Women in technology stories"
                description="Profiles of women mentors, founders, and innovators on the platform."
                seeAllHref="/blog"
                seeAllLabel="All stories"
                itemWidth={280}
              >
                {womenInTechStories.map((p) => (
                  <HomeNewsCard key={p.slug} {...p} />
                ))}
              </HomeCatalogRail>
            </Box>
          </DossierSection>
        )}

        {communityNews.length > 0 && (
          <DossierSection align="right" fullWidth>
            <Box sx={contentShellSx}>
              <HomeCatalogRail
                title="Community innovation news"
                description="What organizations and community innovators are building."
                seeAllHref="/blog"
                seeAllLabel="All community news"
                itemWidth={280}
              >
                {communityNews.map((p) => (
                  <HomeNewsCard key={p.slug} {...p} />
                ))}
              </HomeCatalogRail>
            </Box>
          </DossierSection>
        )}
      </div>

      {organizations.length >= 3 && (
        <Reveal className="mt-8" delay={0.05}>
          <OrgMarquee orgs={organizations} />
        </Reveal>
      )}

      {!isAuthenticated && (
        <Reveal className={organizations.length >= 3 ? "mt-4" : "mt-8"} delay={0.05}>
          <Box sx={contentShellSx}>
            <div className="cta-band cta-band--live mx-auto max-w-2xl">
              <Typography sx={{ fontWeight: 800, fontSize: "1.375rem", mb: 1, letterSpacing: "-0.02em" }}>
                Create a free account
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 480, mx: "auto", lineHeight: 1.6 }}>
                Enroll in courses, track progress, join discussions, and earn certificates.
              </Typography>
              <div className="flex flex-wrap justify-center gap-3">
                <Button asChild size="lg" className="cta-band__btn">
                  <Link href="/auth/register">Sign up</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/courses">View courses</Link>
                </Button>
              </div>
            </div>
          </Box>
        </Reveal>
      )}
      </Box>
      </Box>
    </Box>
  );
}
