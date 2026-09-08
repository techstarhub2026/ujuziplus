import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionBanner } from "@/components/shared/LearnerPageHero";
import { Award, MessageSquare, MapPin, ExternalLink, BadgeCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getPublicUserProfile } from "@/lib/actions/organizations";
import { getFollowState } from "@/lib/actions/follows";
import { AuthorFollowButton } from "@/components/community/AuthorFollowButton";
import { PageSection } from "@/components/motion/PageSection";
import { getAuthSession } from "@/lib/auth-server";

export default async function PublicProfilePage({ params }: { params: { username: string } }) {
  const session = await getAuthSession();
  const profile = await getPublicUserProfile(params.username, session?.user?.id);
  if (!profile) notFound();

  const { user, courses, certCount, discussionCount, instructorCredentials } = profile;
  const isOwner = session?.user?.id === user.id;
  const followState = await getFollowState(session?.user?.id ?? null, user.id);

  return (
    <div className="learner-canvas min-h-screen pb-12">
      <SectionBanner banner="community" className="h-36 sm:h-44" />

      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {isOwner && !user.publicProfile && (
          <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Your profile is private — other users cannot view this page. You can change this under{" "}
            <Link href="/dashboard/settings/privacy" className="font-semibold underline">
              Privacy settings
            </Link>
            .
          </p>
        )}
        <PageSection>
        <Card className="relative -mt-16 overflow-hidden p-6 shadow-card-hover ring-1 ring-gray-100">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <Image
              src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt=""
              width={96}
              height={96}
              className="rounded-2xl border-4 border-white shadow-md ring-2 ring-brand/20"
              unoptimized={!user.avatarUrl}
            />
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold tracking-tight">{user.fullName}</h1>
              <p className="text-gray-500">@{user.username}</p>
              <Badge className="mt-2 capitalize">{user.role.toLowerCase()}</Badge>
              {session?.user && !isOwner && (
                <div className="mt-4">
                  <AuthorFollowButton
                    viewerId={session.user.id}
                    authorId={user.id}
                    authorUsername={user.username}
                    initialFollowing={followState.isFollowing}
                    initialFollowerCount={followState.followerCount}
                  />
                </div>
              )}
              {followState.followerCount > 0 && isOwner && (
                <p className="mt-3 text-sm text-gray-500">
                  <span className="font-semibold text-gray-700">{followState.followerCount}</span>{" "}
                  {followState.followerCount === 1 ? "follower" : "followers"}
                </p>
              )}
              {user.bio && (
                <p className="mt-3 text-sm leading-relaxed text-gray-600">{user.bio}</p>
              )}
              {user.location && (
                <p className="mt-2 flex items-center gap-1 text-sm text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {user.location}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {user.website && (
                  <a
                    href={user.website}
                    className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Website <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {user.github && (
                  <a
                    href={user.github}
                    className="font-medium text-brand hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    GitHub
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    className="font-medium text-brand hover:underline"
                    target="_blank"
                    rel="noreferrer"
                  >
                    LinkedIn
                  </a>
                )}
              </div>
            </div>
          </div>
        </Card>
        </PageSection>

        <PageSection delay={0.08} className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="stat-card flex items-center gap-3 py-4">
            <Award className="h-5 w-5 text-brand" />
            <div>
              <p className="font-display text-xl font-bold">{certCount}</p>
              <p className="text-xs text-gray-500">Certificates</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3 py-4">
            <MessageSquare className="h-5 w-5 text-purple-500" />
            <div>
              <p className="font-display text-xl font-bold">{discussionCount}</p>
              <p className="text-xs text-gray-500">Discussions</p>
            </div>
          </div>
          <div className="stat-card flex items-center gap-3 py-4">
            <div>
              <p className="font-display text-xl font-bold">{new Date(user.createdAt).getFullYear()}</p>
              <p className="text-xs text-gray-500">Member since</p>
            </div>
          </div>
        </PageSection>

        {user.role === "INSTRUCTOR" && instructorCredentials.length > 0 && (
          <PageSection delay={0.1} className="mt-8">
            <h2 className="section-accent-title mb-4 text-lg">Certifications</h2>
            <Card className="divide-y divide-gray-100 p-0 overflow-hidden">
              {instructorCredentials.map((cred) => (
                <div key={cred.id} className="flex items-start gap-3 p-4">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <p className="font-medium text-gray-900">{cred.title}</p>
                    <p className="text-sm text-gray-500">
                      {[cred.issuer, cred.issueDate ? new Date(cred.issueDate).getFullYear() : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {(cred.credentialUrl || cred.fileUrl) && (
                      <a
                        href={cred.credentialUrl || cred.fileUrl || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline"
                      >
                        View credential <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </Card>
          </PageSection>
        )}

        {courses.length > 0 && (
          <PageSection delay={0.12} className="mt-8">
            <h2 className="section-accent-title mb-4 text-lg">Courses</h2>
            <Card className="divide-y divide-gray-100 p-0 overflow-hidden">
              {courses.map((c) => (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className="flex items-center gap-4 p-4 transition hover:bg-gray-50"
                >
                  {c.thumbnailUrl && (
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={c.thumbnailUrl}
                        alt=""
                        fill
                        className="object-cover"
                        unoptimized={c.thumbnailUrl.startsWith("/content/")}
                      />
                    </div>
                  )}
                  <span className="font-medium text-brand hover:underline">{c.title}</span>
                </Link>
              ))}
            </Card>
          </PageSection>
        )}
      </div>
    </div>
  );
}
