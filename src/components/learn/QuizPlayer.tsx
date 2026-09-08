"use client";

/**
 * QuizPlayer — renders a quiz lesson inside the learn player.
 * Loads questions from DB, collects answers client-side,
 * submits server-side for scoring, shows feedback + pass/fail.
 */

import { useEffect, useState, useRef } from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
  Clock,
  RotateCcw,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQuizForStudent, submitQuiz } from "@/lib/actions/quizzes";
import { markLessonComplete } from "@/lib/actions/enrollments";

// ─── Types ────────────────────────────────────────────────────────────────────

type QuizOption = { id: string; text: string; orderIndex: number };
type QuizQuestion = { id: string; text: string; options: QuizOption[] };
type QuizData = {
  id: string;
  passMark: number;
  timeLimit: number | null;
  questions: QuizQuestion[];
};

type FeedbackItem = {
  questionId: string;
  isCorrect: boolean;
  explanation?: string | null;
};

type ResultData = {
  score: number;
  passed: boolean;
  passMark: number;
  correctCount: number;
  total: number;
  feedback: FeedbackItem[];
};

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizPlayer({
  lessonId,
  lessonTitle,
  userId,
  courseId,
  enrollmentId,
  isAlreadyComplete,
  onCompleted,
}: {
  lessonId: string;
  lessonTitle: string;
  userId: string;
  courseId: string;
  enrollmentId: string;
  isAlreadyComplete: boolean;
  onCompleted: () => void;
}) {
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    getQuizForStudent(lessonId).then((q) => {
      setQuiz(q as QuizData | null);
      if (q?.timeLimit) {
        setTimeLeft(q.timeLimit * 60);
      }
      setLoading(false);
    });
  }, [lessonId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft === null || result) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => (t !== null ? t - 1 : null));
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, result]);

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  async function handleSubmit() {
    if (!quiz) return;
    if (timerRef.current) clearInterval(timerRef.current);
    setSubmitting(true);
    const res = await submitQuiz(userId, lessonId, answers);
    setSubmitting(false);
    if (!res.success) return;
    setResult(res.data);

    // If passed, mark lesson complete
    if (res.data.passed) {
      await markLessonComplete(userId, courseId, lessonId);
      onCompleted();
    }
  }

  function handleRetry() {
    setAnswers({});
    setResult(null);
    if (quiz?.timeLimit) setTimeLeft(quiz.timeLimit * 60);
  }

  // ─── States ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-brand" />
      </div>
    );
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-400 text-sm">
        <HelpCircle className="mx-auto h-8 w-8 mb-2 opacity-50" />
        Quiz questions not set up yet.
      </div>
    );
  }

  // Results screen
  if (result) {
    const pct = result.score;
    const pass = result.passed;
    return (
      <div className="max-w-2xl space-y-6">
        {/* Score banner */}
        <div
          className={`rounded-2xl p-6 text-center ${
            pass
              ? "bg-green-50 border border-green-200"
              : "bg-red-50 border border-red-200"
          }`}
        >
          {pass ? (
            <Trophy className="mx-auto mb-2 h-12 w-12 text-green-500" />
          ) : (
            <XCircle className="mx-auto mb-2 h-12 w-12 text-red-400" />
          )}
          <h2 className="text-2xl font-bold mb-1">
            {pass ? "Congratulations!" : "Keep going!"}
          </h2>
          <p className="text-4xl font-black mb-2">{pct}%</p>
          <p className="text-sm text-gray-600">
            {result.correctCount} / {result.total} correct · Pass mark: {result.passMark}%
          </p>
          {pass && (
            <p className="mt-2 text-sm text-green-700 font-medium">
              Lesson marked as complete.
            </p>
          )}
        </div>

        {/* Per-question feedback */}
        <div className="space-y-4">
          {quiz.questions.map((q, i) => {
            const fb = result.feedback.find((f) => f.questionId === q.id);
            const chosenId = answers[q.id];
            return (
              <div
                key={q.id}
                className={`rounded-xl border p-4 ${
                  fb?.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  {fb?.isCorrect ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500 mt-0.5" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                  )}
                  <p className="text-sm font-medium">
                    Q{i + 1}. {q.text}
                  </p>
                </div>
                <ul className="ml-6 space-y-1">
                  {q.options.map((o) => {
                    const isChosen = o.id === chosenId;
                    return (
                      <li
                        key={o.id}
                        className={`text-sm rounded px-2 py-0.5 ${
                          isChosen && !fb?.isCorrect
                            ? "bg-red-100 text-red-700"
                            : isChosen && fb?.isCorrect
                            ? "bg-green-100 text-green-700"
                            : "text-gray-600"
                        }`}
                      >
                        {o.text}
                        {isChosen && (
                          <span className="ml-1 text-xs opacity-70">
                            ← your answer
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
                {fb?.explanation && (
                  <p className="mt-2 ml-6 text-xs text-gray-500 italic">
                    {fb.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {!pass && (
          <Button onClick={handleRetry} variant="outline" className="w-full">
            <RotateCcw className="mr-2 h-4 w-4" />Try again
          </Button>
        )}
      </div>
    );
  }

  // Quiz taking screen
  const answered = Object.keys(answers).length;
  const total = quiz.questions.length;

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{lessonTitle}</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {answered}/{total} answered · {quiz.passMark}% to pass
          </p>
        </div>
        {timeLeft !== null && (
          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-mono font-semibold ${
              timeLeft < 60 ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-700"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            {formatTime(timeLeft)}
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-1.5 rounded-full bg-brand transition-all"
          style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }}
        />
      </div>

      {/* Questions */}
      {quiz.questions.map((q, i) => (
        <div key={q.id} className="rounded-xl border border-gray-200 p-5">
          <p className="font-semibold text-sm mb-4">
            <span className="mr-2 text-brand">Q{i + 1}.</span>
            {q.text}
          </p>
          <div className="space-y-2">
            {q.options.map((o) => {
              const selected = answers[q.id] === o.id;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setAnswers((a) => ({ ...a, [q.id]: o.id }))}
                  className={`w-full text-left rounded-xl border-2 px-4 py-3 text-sm transition ${
                    selected
                      ? "border-brand bg-orange-50 font-medium text-brand"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {o.text}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={answered < total || submitting}
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
        ) : answered < total ? (
          `Answer all questions (${total - answered} remaining)`
        ) : (
          "Submit quiz"
        )}
      </Button>

      {isAlreadyComplete && (
        <p className="text-center text-xs text-gray-400">
          You already completed this quiz. Retaking for practice.
        </p>
      )}
    </div>
  );
}
