"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { RichTextRenderer } from "@/components/ui/RichTextRenderer";
import { PdfViewer } from "@/components/ui/PdfViewer";
import { joinSolution, updateSolutionLabProgress } from "@/lib/actions/solutions";
import { useAppStore } from "@/store/appStore";
import { useRouter } from "next/navigation";
import {
  Clock, Users, CheckCircle2, Circle, ChevronRight,
  Code2, Package, BookOpen, FlaskConical, Copy, Check, ChevronDown, ChevronUp,
} from "lucide-react";
import type { LabStepData } from "@/lib/actions/solutions";

const LEVEL_STYLE: Record<string, { bg: string; text: string; border: string }> = {
  BEGINNER:     { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200" },
  INTERMEDIATE: { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  ADVANCED:     { bg: "bg-red-50",    text: "text-red-700",    border: "border-red-200"   },
};
const LEVEL_LABEL: Record<string, string> = { BEGINNER: "Beginner", INTERMEDIATE: "Intermediate", ADVANCED: "Advanced" };

type SolutionData = {
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  level: string;
  hours: number;
  thumbnailUrl: string | null;
  tags: string[];
  components: string[];
  relatedKitSlugs: string[];
  labSteps: LabStepData[];
  codeTemplate: string | null;
  joinCount: number;
};

function parseSteps(raw: unknown): LabStepData[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((s: unknown) => {
    if (typeof s === "string") return { id: String(Math.random()), title: "", content: s, imageUrls: [], pdfUrls: [] };
    if (s && typeof s === "object" && "content" in s) return s as LabStepData;
    return { id: String(Math.random()), title: "", content: "", imageUrls: [], pdfUrls: [] };
  });
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-900 mt-4">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
        <span className="text-xs font-mono text-gray-400">Arduino / C++</span>
        <button onClick={copy} className="flex items-center gap-1.5 rounded-md bg-gray-700 px-2.5 py-1 text-xs text-gray-300 hover:bg-gray-600 transition-colors">
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-sm text-green-300 font-mono leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function SolutionDetailClient({
  solution: rawSolution,
  initialJoined,
  initialProgress,
  userId,
}: {
  solution: Omit<SolutionData, "labSteps"> & { labSteps: unknown };
  initialJoined: boolean;
  initialProgress: number[];
  userId: string | null;
}) {
  const solution = { ...rawSolution, labSteps: parseSteps(rawSolution.labSteps) };

  const [joined, setJoined] = useState(initialJoined);
  const [completed, setCompleted] = useState(new Set(initialProgress));
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set([0]));
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);
  const router = useRouter();
  const lvl = LEVEL_STYLE[solution.level] ?? LEVEL_STYLE.BEGINNER;

  const progressPct =
    solution.labSteps.length > 0
      ? Math.round((completed.size / solution.labSteps.length) * 100)
      : 0;

  const handleJoin = () => {
    if (!userId) { router.push(`/auth/login?callbackUrl=/solutions/${solution.slug}`); return; }
    startTransition(async () => {
      const res = await joinSolution(userId, solution.slug);
      if (res.success) { setJoined(true); showToast("You joined this solution!", "success"); }
      else showToast(res.error ?? "Failed", "error");
    });
  };

  const toggleComplete = (idx: number) => {
    if (!joined || !userId) return;
    const next = new Set(completed);
    if (next.has(idx)) next.delete(idx); else next.add(idx);
    setCompleted(next);
    startTransition(async () => { await updateSolutionLabProgress(userId, solution.slug, Array.from(next)); });
  };

  const toggleOpen = (idx: number) => {
    setOpenSteps((prev) => { const n = new Set(prev); if (n.has(idx)) n.delete(idx); else n.add(idx); return n; });
  };

  const isAllDone = solution.labSteps.length > 0 && completed.size === solution.labSteps.length;

  return (
    <div className="learner-canvas pb-16">
      {/* Hero */}
      <div className="bg-gradient-navy px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Breadcrumbs
            theme="dark"
            className="mb-4"
            items={[{ label: "Solutions", href: "/solutions" }, { label: solution.title }]}
          />
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${lvl.bg} ${lvl.text} ${lvl.border} border`}>
              {LEVEL_LABEL[solution.level] ?? solution.level}
            </span>
            {solution.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-white/70">{tag}</span>
            ))}
          </div>
          <h1 className="font-display text-2xl font-bold text-white md:text-3xl">{solution.title}</h1>
          {solution.subtitle && <p className="mt-1 text-white/75 text-sm">{solution.subtitle}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-white/60">
            <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {solution.hours}h estimated</span>
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {solution.joinCount} builders joined</span>
            {solution.labSteps.length > 0 && (
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4" /> {solution.labSteps.length} steps</span>
            )}
          </div>
        </div>
      </div>

      {/* Cover image */}
      {solution.thumbnailUrl && (
        <div className="relative h-72 w-full overflow-hidden bg-gray-900">
          <Image
            src={solution.thumbnailUrl}
            alt={solution.title}
            fill
            sizes="100vw"
            className="object-cover"
            unoptimized={solution.thumbnailUrl.startsWith("/content/")}
          />
        </div>
      )}

      {/* Body */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">

          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Overview */}
            <Card className="p-6">
              <h2 className="font-semibold text-lg flex items-center gap-2 mb-4">
                <FlaskConical className="h-5 w-5 text-brand" /> Overview
              </h2>
              {solution.description ? (
                <RichTextRenderer html={solution.description} />
              ) : (
                <p className="text-sm text-gray-400 italic">No description provided.</p>
              )}
            </Card>

            {/* Step-by-step lab guide */}
            {solution.labSteps.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-brand" /> Lab Steps
                  </h2>
                  {joined && <span className="text-xs text-gray-400">{completed.size}/{solution.labSteps.length} completed</span>}
                </div>

                {/* Progress bar */}
                {joined && (
                  <div className="mb-5">
                    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-brand transition-all duration-500" style={{ width: `${progressPct}%` }} />
                    </div>
                    {isAllDone ? (
                      <p className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-green-600">
                        <CheckCircle2 className="h-4 w-4" /> All steps complete — great work!
                      </p>
                    ) : (
                      <p className="mt-1.5 text-xs text-gray-400">{progressPct}% done</p>
                    )}
                  </div>
                )}

                <div className="space-y-3">
                  {solution.labSteps.map((step, idx) => {
                    const isDone = completed.has(idx);
                    const isOpen = openSteps.has(idx);
                    const hasMedia = (step.imageUrls?.length ?? 0) + (step.pdfUrls?.length ?? 0) > 0;

                    return (
                      <div key={step.id ?? idx} className={`rounded-xl border overflow-hidden transition-colors ${isDone ? "border-green-200" : "border-gray-200"}`}>
                        {/* Step header */}
                        <div
                          className={`flex items-start gap-3 p-4 cursor-pointer transition-colors ${isDone ? "bg-green-50" : "bg-white hover:bg-gray-50"}`}
                          onClick={() => toggleOpen(idx)}
                        >
                          {/* Completion toggle */}
                          <button
                            type="button"
                            className="shrink-0 mt-0.5"
                            onClick={(e) => { e.stopPropagation(); toggleComplete(idx); }}
                            title={joined ? (isDone ? "Mark incomplete" : "Mark complete") : "Join to track progress"}
                          >
                            {isDone
                              ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                              : <Circle className="h-5 w-5 text-gray-300" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`text-[11px] font-bold uppercase tracking-wider mb-0.5 ${isDone ? "text-green-600" : "text-brand"}`}>
                              Step {idx + 1}
                            </p>
                            <p className={`text-sm font-semibold leading-snug ${isDone ? "text-gray-400 line-through" : "text-gray-800"}`}>
                              {step.title || `Step ${idx + 1}`}
                            </p>
                            {hasMedia && !isOpen && (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {step.imageUrls?.length ? `${step.imageUrls.length} image${step.imageUrls.length > 1 ? "s" : ""}` : ""}
                                {(step.imageUrls?.length && step.pdfUrls?.length) ? " · " : ""}
                                {step.pdfUrls?.length ? `${step.pdfUrls.length} PDF${step.pdfUrls.length > 1 ? "s" : ""}` : ""}
                              </p>
                            )}
                          </div>

                          <div className="shrink-0 flex items-center gap-1 text-gray-400">
                            {joined && <ChevronRight className="h-4 w-4" />}
                            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </div>
                        </div>

                        {/* Step body */}
                        {isOpen && (
                          <div className={`border-t px-5 py-4 space-y-5 ${isDone ? "border-green-100 bg-green-50/30" : "border-gray-100"}`}>
                            {/* Rich content */}
                            {step.content && <RichTextRenderer html={step.content} />}

                            {/* Step images */}
                            {step.imageUrls && step.imageUrls.length > 0 && (
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Images</p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                  {step.imageUrls.map((url, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      className="relative aspect-video overflow-hidden rounded-lg border border-gray-100 shadow-sm cursor-zoom-in"
                                    >
                                      <Image
                                        src={url}
                                        alt={`Step ${idx + 1} image ${imgIdx + 1}`}
                                        fill
                                        sizes="(max-width: 640px) 100vw, 50vw"
                                        className="object-cover"
                                        unoptimized={url.startsWith("/content/")}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Step PDFs */}
                            {step.pdfUrls && step.pdfUrls.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Documents</p>
                                {step.pdfUrls.map((url, pdfIdx) => (
                                  <PdfViewer key={pdfIdx} url={url} defaultExpanded={pdfIdx === 0} />
                                ))}
                              </div>
                            )}

                            {/* Done toggle */}
                            {joined && (
                              <div className="flex justify-end pt-1">
                                <button
                                  type="button"
                                  onClick={() => toggleComplete(idx)}
                                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                                    isDone
                                      ? "bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600"
                                      : "bg-brand/10 text-brand hover:bg-brand hover:text-white"
                                  }`}
                                >
                                  {isDone ? <><CheckCircle2 className="h-3.5 w-3.5" /> Done</> : "Mark as complete"}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!joined && (
                  <p className="mt-3 text-center text-xs text-gray-400">Join this solution to track your progress.</p>
                )}
              </div>
            )}

            {/* Starter code */}
            {solution.codeTemplate && (
              <div>
                <h2 className="font-semibold text-lg flex items-center gap-2 mb-1">
                  <Code2 className="h-5 w-5 text-brand" /> Starter Code
                </h2>
                <p className="text-xs text-gray-400 mb-2">Copy this template into your Arduino IDE to get started.</p>
                <CodeBlock code={solution.codeTemplate} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="p-5 space-y-4 sticky top-20">
              {joined ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                  <CheckCircle2 className="h-5 w-5" /> You&apos;ve joined this solution
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600">
                    Join to unlock step tracking and save your progress.
                  </p>
                  <Button disabled={isPending} className="w-full" size="lg" onClick={handleJoin}>
                    {isPending ? "Joining…" : "Start this solution"}
                  </Button>
                  {!userId && (
                    <p className="text-xs text-center text-gray-400">
                      <Link href="/auth/login" className="text-brand hover:underline">Sign in</Link> required to join
                    </p>
                  )}
                </>
              )}

              {joined && solution.labSteps.length > 0 && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Your progress</span>
                    <span>{progressPct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{completed.size} of {solution.labSteps.length} steps done</p>
                </div>
              )}

              <div className="border-t pt-3 text-xs text-gray-400 space-y-1">
                <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {solution.hours} hour{solution.hours !== 1 ? "s" : ""} to complete</p>
                <p className="flex items-center gap-2"><Users className="h-3.5 w-3.5" /> {solution.joinCount} people building this</p>
              </div>
            </Card>

            {solution.components.length > 0 && (
              <Card className="p-5">
                <h3 className="font-semibold text-sm flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-brand" /> Components needed
                </h3>
                <ul className="space-y-2">
                  {solution.components.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {solution.relatedKitSlugs.length > 0 && (
              <Card className="p-5">
                <h3 className="font-semibold text-sm mb-3">Recommended kits</h3>
                <div className="space-y-2">
                  {solution.relatedKitSlugs.map((slug) => (
                    <Link key={slug} href={`/kits/${slug}`} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm hover:border-brand hover:text-brand transition-colors">
                      <span className="capitalize">{slug.replace(/-/g, " ")}</span>
                      <ChevronRight className="h-4 w-4 text-gray-300" />
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
