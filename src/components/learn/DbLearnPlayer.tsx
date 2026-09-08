"use client";

/**
 * DbLearnPlayer — learn player for real DB courses.
 * Shows real video/article/assignment content, tracks progress in MySQL.
 */

import { useState, useTransition, useCallback, useRef, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Play,
  FileText,
  HelpCircle,
  Loader2,
  Trophy,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/learn/VideoPlayer";
import { ArticleLessonBody } from "@/components/learn/ArticleLessonBody";
import { QuizPlayer } from "@/components/learn/QuizPlayer";
import { AssignmentPlayer } from "@/components/assignments/AssignmentPlayer";
import type { RubricItem } from "@/lib/actions/assignments";
import { markLessonComplete, getLessonPlayerContent } from "@/lib/actions/enrollments";
import { getAssignmentForStudent } from "@/lib/actions/assignments";
import { PDF_PREFIX } from "@/lib/constants";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  videoUrl?: string | null;
  articleBody?: string | null;
  isFreePreview: boolean;
  orderIndex: number;
};

type ModuleRow = {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonRow[];
};

type CourseInfo = {
  id: string;
  slug: string;
  title: string;
};

type EnrollmentInfo = {
  id: string;
  completedLessonIds: string[];
} | null;

const TYPE_ICON: Record<string, React.ReactNode> = {
  VIDEO: <Play className="h-3.5 w-3.5" />,
  ARTICLE: <FileText className="h-3.5 w-3.5" />,
  QUIZ: <HelpCircle className="h-3.5 w-3.5" />,
  ASSIGNMENT: <FileText className="h-3.5 w-3.5" />,
};

// ─── Lesson content renderer ──────────────────────────────────────────────────

type AssignmentBundle = {
  instructions: string;
  rubric: RubricItem[] | null;
  maxScore: number;
  dueAt: Date | null;
  status: string;
  text: string;
  github: string;
  files: { id: string; fileName: string; filePath: string }[];
  score?: number | null;
  feedback?: string | null;
};

function LessonContent({
  lesson,
  userId,
  courseId,
  enrollmentId,
  isComplete,
  onExplored,
  onQuizPassed,
  onAssignmentSubmitted,
  assignmentBundle,
}: {
  lesson: LessonRow;
  userId: string;
  courseId: string;
  enrollmentId: string;
  isComplete: boolean;
  onExplored?: () => void;
  onQuizPassed: () => void;
  onAssignmentSubmitted?: () => void;
  assignmentBundle?: AssignmentBundle | null;
}) {
  const explore = isComplete ? undefined : onExplored;

  switch (lesson.type) {
    case "VIDEO":
      return lesson.videoUrl ? (
        <VideoPlayer url={lesson.videoUrl} title={lesson.title} onExplored={explore} />
      ) : (
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gray-100 text-sm text-gray-400">
          No video uploaded yet.
        </div>
      );

    case "ARTICLE":
      return lesson.articleBody ? (
        <ArticleLessonBody
          body={lesson.articleBody}
          onExplored={explore}
        />
      ) : (
        <p className="text-sm text-gray-400">No content added yet.</p>
      );

    case "ASSIGNMENT":
      if (!assignmentBundle) {
        return (
          <p className="text-gray-400 text-sm">
            Assignment not configured yet. Check back later.
          </p>
        );
      }
      return (
        <AssignmentPlayer
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          enrollmentId={enrollmentId}
          userId={userId}
          courseId={courseId}
          instructions={assignmentBundle.instructions}
          rubric={assignmentBundle.rubric}
          maxScore={assignmentBundle.maxScore}
          dueAt={assignmentBundle.dueAt}
          initialStatus={assignmentBundle.status}
          initialText={assignmentBundle.text}
          initialGithub={assignmentBundle.github}
          initialFiles={assignmentBundle.files}
          initialScore={assignmentBundle.score}
          initialFeedback={assignmentBundle.feedback}
          onSubmitted={isComplete ? undefined : onAssignmentSubmitted}
        />
      );

    case "QUIZ":
      return (
        <QuizPlayer
          lessonId={lesson.id}
          lessonTitle={lesson.title}
          userId={userId}
          courseId={courseId}
          enrollmentId={enrollmentId}
          isAlreadyComplete={isComplete}
          onCompleted={onQuizPassed}
        />
      );

    default:
      return <p className="text-gray-400 text-sm">Unknown lesson type.</p>;
  }
}

// ─── Main player ─────────────────────────────────────────────────────────────

export function DbLearnPlayer({
  course,
  modules,
  lessonId,
  initialLesson,
  enrollment,
  userId,
  initialAssignmentBundle = null,
}: {
  course: CourseInfo;
  modules: ModuleRow[];
  lessonId: string;
  initialLesson: LessonRow;
  enrollment: EnrollmentInfo;
  userId: string;
  initialAssignmentBundle?: AssignmentBundle | null;
}) {
  const allLessons = modules.flatMap((m) => m.lessons);
  const [activeKey, setActiveKey] = useState(lessonId);
  const [contentById, setContentById] = useState<Record<string, LessonRow>>(() => ({
    [initialLesson.id]: initialLesson,
  }));
  const [assignmentBundle, setAssignmentBundle] = useState<AssignmentBundle | null>(
    initialAssignmentBundle
  );
  const [loadingContent, setLoadingContent] = useState(false);

  const currentIndex = allLessons.findIndex(
    (l) => l.id === activeKey || l.slug === activeKey
  );
  const lessonMeta = allLessons[currentIndex] ?? allLessons[0];
  const currentModule = modules.find((m) => m.lessons.some((l) => l.id === lessonMeta?.id));
  const lesson = lessonMeta ? contentById[lessonMeta.id] ?? lessonMeta : undefined;
  const isPdfLesson =
    lesson?.type === "ARTICLE" && !!lesson.articleBody?.startsWith(PDF_PREFIX);
  const prev = allLessons[currentIndex - 1];
  const next = allLessons[currentIndex + 1];

  const [localCompletedIds, setLocalCompletedIds] = useState(
    new Set(enrollment?.completedLessonIds ?? [])
  );
  const completedCount = localCompletedIds.size;
  const totalLessons = allLessons.length;
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
  const isCurrentDone = lesson ? localCompletedIds.has(lesson.id) : false;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isPending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();
  const [certVerifyCode, setCertVerifyCode] = useState<string | null>(null);
  const [showCourseComplete, setShowCourseComplete] = useState(false);
  const completingRef = useRef(false);

  const navTo = useCallback(
    async (l: LessonRow) => {
      const key = l.slug || l.id;
      setActiveKey(key);
      window.history.replaceState(null, "", `/learn/${course.slug}/${key}`);

      const cached = contentById[l.id];
      const needsContent =
        (l.type === "VIDEO" || l.type === "ARTICLE") &&
        !cached?.videoUrl &&
        !cached?.articleBody;

      if (needsContent) {
        setLoadingContent(true);
        const content = await getLessonPlayerContent(userId, course.id, key);
        if (content) {
          setContentById((prev) => ({ ...prev, [content.id]: content }));
        }
        setLoadingContent(false);
      }

      if (l.type === "ASSIGNMENT" && enrollment) {
        const data = await getAssignmentForStudent(l.id, enrollment.id, userId);
        if (data) {
          const sub = data.submission;
          setAssignmentBundle({
            instructions: data.assignment.instructions ?? "",
            rubric: data.assignment.rubric as RubricItem[] | null,
            maxScore: data.assignment.maxScore,
            dueAt: data.assignment.dueAt,
            status: sub?.status ?? "DRAFT",
            text: sub?.textResponse ?? "",
            github: sub?.githubUrl ?? "",
            files: (sub?.files ?? []).map((f) => ({
              id: f.id,
              fileName: f.fileName,
              filePath: f.filePath,
            })),
            score: sub?.score,
            feedback: sub?.feedback,
          });
        } else {
          setAssignmentBundle(null);
        }
      } else {
        setAssignmentBundle(null);
      }
    },
    [contentById, course.id, course.slug, enrollment, userId]
  );

  const handleLessonComplete = useCallback(
    (lessonIdCompleted: string, certCode?: string) => {
      setLocalCompletedIds((prev) => {
        const nextIds = new Set([...Array.from(prev), lessonIdCompleted]);
        if (nextIds.size >= totalLessons) {
          setShowCourseComplete(true);
          if (certCode) setCertVerifyCode(certCode);
        }
        return nextIds;
      });
    },
    [totalLessons]
  );

  const completeCurrentLesson = useCallback(() => {
    if (!lesson || !enrollment || localCompletedIds.has(lesson.id) || completingRef.current) {
      return;
    }
    completingRef.current = true;
    startTransition(async () => {
      const res = await markLessonComplete(userId, course.id, lesson.id);
      completingRef.current = false;
      if (res.success) {
        handleLessonComplete(lesson.id, res.data.certVerifyCode);
        if (next) void navTo(next);
      }
    });
  }, [
    lesson,
    enrollment,
    localCompletedIds,
    userId,
    course.id,
    handleLessonComplete,
    next,
    navTo,
  ]);

  const acknowledgeCurrentLesson = useCallback(() => {
    if (!lesson || localCompletedIds.has(lesson.id)) return;
    handleLessonComplete(lesson.id);
    if (next) void navTo(next);
  }, [lesson, localCompletedIds, handleLessonComplete, next, navTo]);

  const handleQuizPassed = acknowledgeCurrentLesson;

  useEffect(() => {
    completingRef.current = false;
  }, [lesson?.id]);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const sync = () => {
      setIsDesktop(mql.matches);
      setSidebarOpen(mql.matches);
    };
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  const selectLesson = useCallback(
    (l: LessonRow) => {
      if (!isDesktop) setSidebarOpen(false);
      void navTo(l);
    },
    [isDesktop, navTo]
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-950">
      {/* Course-complete modal */}
      <AnimatePresence>
      {showCourseComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mx-4 max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
              <Trophy className="h-10 w-10 text-amber-500" />
            </div>
            <h2 className="font-display text-2xl font-bold">Course complete!</h2>
            <p className="text-gray-500 mb-6">
              You have completed <strong>{course.title}</strong>. Well done!
            </p>
            {certVerifyCode && (
              <div className="mb-4 rounded-xl bg-orange-50 border border-orange-200 p-4">
                <Award className="mx-auto h-8 w-8 text-brand mb-2" />
                <p className="font-semibold text-brand">Certificate earned!</p>
                <p className="text-xs text-gray-500 mt-1">
                  Your certificate has been issued and is ready to download.
                </p>
              </div>
            )}
            <div className="flex flex-col gap-2">
              {certVerifyCode && (
                <Button asChild>
                  <Link href={`/certificate/${certVerifyCode}`}>
                    View certificate
                  </Link>
                </Button>
              )}
              <Button asChild variant="outline">
                <Link href="/dashboard/my-courses">Back to My Courses</Link>
              </Button>
              <button
                type="button"
                onClick={() => setShowCourseComplete(false)}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                Continue exploring
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
      {/* Top bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-800 bg-gray-900/95 px-4 backdrop-blur-sm">
        <Link
          href="/dashboard/my-courses"
          className="rounded-lg px-2 py-1 text-sm text-gray-400 transition hover:bg-gray-800 hover:text-white"
        >
          ← My courses
        </Link>
        <span className="hidden max-w-md items-center gap-1.5 truncate text-sm sm:flex">
          <span className="font-semibold text-white">{course.title}</span>
          {currentModule && (
            <>
              <span className="text-gray-600">/</span>
              <span className="truncate text-gray-400">{currentModule.title}</span>
            </>
          )}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-brand">{progressPct}%</span>
          <div className="h-2 w-28 overflow-hidden rounded-full bg-gray-700">
            <div
              className="progress-shine h-2 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop (mobile only, shown while the drawer is open) */}
        {sidebarOpen && !isDesktop && (
          <div
            className="fixed inset-x-0 bottom-0 top-14 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed bottom-0 left-0 top-14 z-40 flex w-72 transform flex-col border-r border-gray-800 bg-gray-900 transition-transform duration-200 lg:static lg:top-0 lg:z-auto lg:translate-x-0 lg:transition-[width] ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${sidebarOpen ? "lg:w-72 lg:shrink-0" : "lg:w-0 lg:overflow-hidden"}`}
        >
          <div className="border-b border-gray-800 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Progress
            </p>
            <p className="mt-1 text-sm font-semibold text-white">
              {completedCount} of {totalLessons} lessons
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-700">
              <div
                className="progress-shine h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {modules.map((mod) => (
              <div key={mod.id}>
                <p className="px-4 py-2 text-xs font-semibold text-gray-400 bg-gray-800/50 uppercase tracking-wide">
                  {mod.title}
                </p>
                {mod.lessons.map((l) => {
                  const done = localCompletedIds.has(l.id);
                  const active = l.id === lessonMeta?.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => selectLesson(l)}
                      className={`flex w-full items-center gap-2 border-l-2 px-4 py-2.5 text-left text-sm transition ${
                        active
                          ? "border-brand bg-gray-800/80 text-white"
                          : "border-transparent text-gray-400 hover:border-gray-600 hover:bg-gray-800/50"
                      }`}
                    >
                      {done ? (
                        <CheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                      ) : (
                        <span className="h-4 w-4 shrink-0 text-gray-600">
                          {TYPE_ICON[l.type] ?? <Play className="h-3.5 w-3.5" />}
                        </span>
                      )}
                      <span className="line-clamp-2">{l.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Content */}
          <div className="learn-scroll-root relative flex-1 overflow-y-auto bg-gray-50/50">
            <div className={isPdfLesson ? "h-full" : "mx-auto max-w-4xl px-4 py-8 sm:px-6"}>
              <AnimatePresence mode="wait">
              {lesson ? (
                <motion.div
                  key={lesson.id}
                  className={isPdfLesson ? "h-full" : undefined}
                  initial={reduceMotion ? false : { opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {!isPdfLesson && (
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs capitalize">
                        {lesson.type.toLowerCase()}
                      </Badge>
                      {lesson.isFreePreview && (
                        <Badge variant="success" className="text-xs">Free preview</Badge>
                      )}
                      {isCurrentDone && (
                        <Badge variant="success" className="text-xs">Completed</Badge>
                      )}
                    </div>
                  )}
                  {!isPdfLesson && (
                    <h2 className="mb-6 font-display text-2xl font-bold tracking-tight">{lesson.title}</h2>
                  )}
                  {loadingContent ? (
                    <div className="flex items-center justify-center py-24 text-gray-400">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <LessonContent
                      lesson={lesson}
                      userId={userId}
                      courseId={course.id}
                      enrollmentId={enrollment?.id ?? ""}
                      isComplete={isCurrentDone}
                      onExplored={completeCurrentLesson}
                      onQuizPassed={handleQuizPassed}
                      onAssignmentSubmitted={acknowledgeCurrentLesson}
                      assignmentBundle={assignmentBundle}
                    />
                  )}
                </motion.div>
              ) : (
                <motion.p
                  key="missing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-400"
                >
                  Lesson not found.
                </motion.p>
              )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex shrink-0 items-center justify-between border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-brand"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                title="Toggle sidebar"
              >
                {sidebarOpen
                  ? <ChevronDown className="h-5 w-5 rotate-90" />
                  : <ChevronUp className="h-5 w-5 rotate-90" />}
              </button>

              {prev && (
                <Button variant="outline" size="sm" onClick={() => void navTo(prev)}>
                  ← Previous
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {lesson && !isCurrentDone && !isPending && (
                <span className="hidden text-xs text-gray-500 sm:inline">
                  Completes automatically when you finish this lesson
                </span>
              )}
              {isPending && (
                <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving progress…
                </span>
              )}
              {isCurrentDone && !next && (
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/certificates">Finish course 🎉</Link>
                </Button>
              )}
              {next ? (
                <Button size="sm" onClick={() => void navTo(next)}>
                  Next →
                </Button>
              ) : null}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
