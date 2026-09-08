import Link from "next/link";
import { ArrowRight, Award, BookOpen, MessageSquare, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/shared/StatCard";
import { getStudentDashboard } from "@/lib/actions/student";
import { db } from "@/lib/db";
import { Reveal } from "@/components/motion/Reveal";
import {
  ContinueLearningCard,
  FeaturedContinueCourse,
} from "@/components/dashboard/ContinueLearningCards";
import {
  DashboardAchievementsPanel,
  DashboardDiscussionsPanel,
  DashboardNotificationsPanel,
  DashboardProjectsPanel,
  DashboardQuickActions,
  DashboardTeamPanel,
} from "@/components/dashboard/DashboardPanels";
import { LearningStreak } from "@/components/dashboard/LearningStreak";
import { getNotifications, getUnreadCount } from "@/lib/actions/notifications";
import { getLearnerCohorts } from "@/lib/actions/mentors";

export async function DashboardContent({ userId }: { userId: string }) {
  const [data, recentDiscussions, userProjects, notifications, unreadCount, cohorts] = await Promise.all([
    getStudentDashboard(userId),
    db.discussion.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        title: true,
        channel: true,
        createdAt: true,
        _count: { select: { replies: true } },
      },
    }),
    db.project.findMany({
      where: { creatorId: userId },
      orderBy: { updatedAt: "desc" },
      take: 3,
      select: { id: true, slug: true, title: true, status: true, likesCount: true },
    }),
    getNotifications(userId, 3),
    getUnreadCount(userId),
    getLearnerCohorts(userId).catch(() => []),
  ]);

  const { inProgress, stats, certificates, streak } = data;
  const featured = inProgress[0];
  const restCourses = inProgress.slice(1, 4);

  const summaryCards = [
    {
      label: "In progress",
      value: stats.activeCourses,
      icon: <BookOpen className="h-6 w-6" />,
      theme: "brand" as const,
    },
    {
      label: "Completed",
      value: stats.completedCourses,
      icon: <Trophy className="h-6 w-6" />,
      theme: "blue" as const,
    },
    {
      label: "Certificates",
      value: stats.certificates,
      icon: <Award className="h-6 w-6" />,
      theme: "amber" as const,
    },
    {
      label: "Your posts",
      value: data.discussions,
      icon: <MessageSquare className="h-6 w-6" />,
      theme: "purple" as const,
    },
  ];

  return (
    <div className="learner-dashboard">
      <div className="learner-dashboard__stats">
        {summaryCards.map((s, i) => (
          <StatCard
            key={s.label}
            label={s.label}
            value={s.value}
            icon={s.icon}
            theme={s.theme}
            delay={i * 40}
            className="learner-dashboard__stat"
          />
        ))}
      </div>

      <div className="learner-dashboard__grid">
        <div className="learner-dashboard__main">
          <Reveal delay={0.06}>
            <div className="learner-dashboard__section-head">
              <div>
                <h2 className="learner-dashboard__section-title">Continue learning</h2>
                <p className="learner-dashboard__section-desc">
                  {inProgress.length > 0
                    ? `${inProgress.length} course${inProgress.length === 1 ? "" : "s"} waiting for you`
                    : "Start your STEM journey today"}
                </p>
              </div>
              {inProgress.length > 0 && (
                <Button asChild variant="outline" size="sm" className="shrink-0">
                  <Link href="/dashboard/my-courses">
                    All courses
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              )}
            </div>
          </Reveal>

          {inProgress.length === 0 ? (
            <Reveal delay={0.08}>
              <div className="learner-dashboard__empty">
                <div className="learner-dashboard__empty-icon">
                  <BookOpen className="h-8 w-8 text-brand" />
                </div>
                <h3 className="font-display text-lg font-bold text-navy">No courses yet</h3>
                <p className="mt-1 max-w-sm text-sm text-gray-500">
                  Explore African STEM courses — from PCB design to solar and robotics.
                </p>
                <Button asChild className="mt-5">
                  <Link href="/courses">Browse catalog</Link>
                </Button>
              </div>
            </Reveal>
          ) : (
            <div className="space-y-6">
              {featured && <FeaturedContinueCourse course={featured} />}
              {restCourses.length > 0 && (
                <div className="learner-dashboard__course-grid">
                  {restCourses.map((course, i) => (
                    <ContinueLearningCard key={course.id} course={course} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="learner-dashboard__aside">
          <LearningStreak streakDays={streak.streakDays} activeLast7={streak.activeLast7} />
          <DashboardQuickActions />
          <DashboardNotificationsPanel unreadCount={unreadCount} recent={notifications} />
          <DashboardAchievementsPanel
            certificates={certificates}
            completedCourses={stats.completedCourses}
          />
          <DashboardProjectsPanel projects={userProjects} />
          <DashboardTeamPanel cohorts={cohorts} />
          <DashboardDiscussionsPanel discussions={recentDiscussions} />
        </aside>
      </div>
    </div>
  );
}

function DashboardStatsSkeleton() {
  return (
    <div className="learner-dashboard space-y-8" aria-hidden>
      <div className="learner-dashboard__stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
      <div className="learner-dashboard__grid">
        <div className="h-80 animate-pulse rounded-3xl bg-gray-100" />
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl bg-gray-100" />
          <div className="h-48 animate-pulse rounded-2xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

export { DashboardStatsSkeleton };
