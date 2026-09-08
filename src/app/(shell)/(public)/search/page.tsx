/**
 * /search?q= — Global search across courses, instructors, discussions
 */

import { db } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { Search, BookOpen, Users, MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { formatCurrency } from "@/lib/utils";
import { SearchBar } from "@/components/search/SearchBar";
import { getAuthSession } from "@/lib/auth-server";

type Props = { searchParams: { q?: string; tab?: string } };

async function searchAll(q: string) {
  const like = { contains: q };
  const [courses, users, discussions] = await Promise.all([
    db.course.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ title: like }, { description: like }, { category: like }],
      },
      take: 12,
      select: {
        id: true,
        title: true,
        slug: true,
        thumbnailUrl: true,
        price: true,
        category: true,
        level: true,
        instructor: { select: { fullName: true } },
        _count: { select: { enrollments: true } },
      },
    }),
    db.user.findMany({
      where: {
        role: { in: ["INSTRUCTOR", "STUDENT"] },
        isActive: true,
        OR: [{ fullName: like }, { username: like }, { bio: like }],
      },
      take: 8,
      select: {
        id: true,
        fullName: true,
        username: true,
        avatarUrl: true,
        role: true,
        bio: true,
        _count: { select: { courses: true, enrollments: true } },
      },
    }),
    db.discussion.findMany({
      where: {
        OR: [{ title: like }, { body: like }],
      },
      take: 10,
      select: {
        id: true,
        title: true,
        channel: true,
        createdAt: true,
        author: { select: { fullName: true } },
        _count: { select: { replies: true } },
      },
    }),
  ]);
  return { courses, users, discussions };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = (searchParams.q ?? "").trim();
  const tab = searchParams.tab ?? "courses";
  const session = await getAuthSession();

  const results = q.length > 1 ? await searchAll(q) : null;
  const counts = results
    ? {
        courses: results.courses.length,
        users: results.users.length,
        discussions: results.discussions.length,
      }
    : null;

  const TABS = [
    { key: "courses", label: "Courses", icon: BookOpen },
    { key: "users", label: "People", icon: Users },
    { key: "discussions", label: "Discussions", icon: MessageSquare },
  ];

  return (
    <div className="learner-canvas mx-auto max-w-4xl px-4 py-6 sm:px-6">
      <LearnerPageHero
        banner="search"
        title="Search UjuziLab"
        subtitle="Find courses, people, and community discussions across the platform."
      />

      <div className="mt-6">
        <SearchBar defaultValue={q} />
      </div>

      {!q ? (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-light">
            <Search className="h-8 w-8 text-brand" />
          </div>
          <p className="text-gray-500">Type something to search across courses, people, and discussions.</p>
        </div>
      ) : !results ? null : (
        <>
          <div className="mb-6 mt-8 flex flex-wrap gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-gray-100">
            {TABS.map((t) => (
              <Link
                key={t.key}
                href={`/search?q=${encodeURIComponent(q)}&tab=${t.key}`}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  tab === t.key
                    ? "bg-brand text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <t.icon className="h-4 w-4" />
                {t.label}
                {counts && (
                  <span
                    className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${
                      tab === t.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {counts[t.key as keyof typeof counts]}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {q && (
            <p className="mb-4 text-sm text-gray-500">
              Results for <span className="font-semibold text-gray-800">&ldquo;{q}&rdquo;</span>
            </p>
          )}

          {tab === "courses" && (
            <div>
              {results.courses.length === 0 ? (
                <SearchEmptyState icon={BookOpen} message={`No courses found for "${q}"`} />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {results.courses.map((c) => (
                    <Link key={c.id} href={`/courses/${c.slug}`}>
                      <Card hover className="group flex gap-3 p-3">
                        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          {c.thumbnailUrl ? (
                            <Image
                              src={c.thumbnailUrl}
                              alt={c.title}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                              unoptimized={c.thumbnailUrl.startsWith("/content/")}
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <BookOpen className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold group-hover:text-brand">
                            {c.title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">{c.instructor.fullName}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            {c.category && (
                              <Badge variant="outline" className="text-[10px]">
                                {c.category}
                              </Badge>
                            )}
                            {c.level && (
                              <Badge variant="outline" className="text-[10px]">
                                {c.level}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                              {c._count.enrollments} students
                            </span>
                            <span className="text-xs font-bold text-brand">
                              {Number(c.price) === 0 ? "Free" : formatCurrency(Number(c.price))}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "users" && (
            <div>
              {results.users.length === 0 ? (
                <SearchEmptyState icon={Users} message={`No people found for "${q}"`} />
              ) : (
                <div className="space-y-3">
                  {results.users.map((u) => (
                    <Link key={u.id} href={`/profile/${u.username}`}>
                      <Card hover className="flex items-center gap-4 p-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-light text-sm font-bold text-brand">
                          {u.avatarUrl ? (
                            <Image
                              src={u.avatarUrl}
                              alt={u.fullName}
                              width={48}
                              height={48}
                              className="rounded-full object-cover"
                              unoptimized={u.avatarUrl.includes("dicebear.com")}
                            />
                          ) : (
                            u.fullName.charAt(0)
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{u.fullName}</p>
                          <p className="text-xs text-gray-500">
                            @{u.username} · {u.role}
                          </p>
                          {u.bio && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">{u.bio}</p>
                          )}
                        </div>
                        <div className="shrink-0 text-right text-xs text-gray-400">
                          {u.role === "INSTRUCTOR" ? (
                            <span>{u._count.courses} courses</span>
                          ) : (
                            <span>{u._count.enrollments} enrolled</span>
                          )}
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "discussions" && (
            <div>
              {results.discussions.length === 0 ? (
                <SearchEmptyState icon={MessageSquare} message={`No discussions found for "${q}"`} />
              ) : (
                <div className="space-y-3">
                  {results.discussions.map((d) => (
                    <Link
                      key={d.id}
                      href={
                        session
                          ? `/dashboard/community/${d.channel}/${d.id}`
                          : `/auth/login?callbackUrl=${encodeURIComponent(`/dashboard/community/${d.channel}/${d.id}`)}`
                      }
                    >
                      <Card hover className="block p-4">
                        <p className="font-semibold">{d.title}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">
                            {d.channel}
                          </Badge>
                          <span className="text-xs text-gray-400">by {d.author.fullName}</span>
                          <span className="text-xs text-gray-400">· {d._count.replies} replies</span>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SearchEmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="py-14 text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
        <Icon className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
