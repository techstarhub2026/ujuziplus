"use client";

/**
 * QuizBuilder — inline quiz editor for QUIZ lesson type.
 * Instructor adds questions and multiple-choice options, marks the correct answer.
 */

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, Check, HelpCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { saveQuiz, getQuizForLesson } from "@/lib/actions/quizzes";
import type { QuizInput, QuizQuestionInput, QuizOptionInput } from "@/lib/actions/quizzes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function emptyOption(order: number): QuizOptionInput {
  return { text: "", isCorrect: false, orderIndex: order };
}

function emptyQuestion(order: number): QuizQuestionInput {
  return {
    text: "",
    explanation: "",
    orderIndex: order,
    options: [emptyOption(0), emptyOption(1), emptyOption(2), emptyOption(3)],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function QuizBuilder({
  lessonId,
  lessonTitle,
}: {
  lessonId: string;
  lessonTitle: string;
}) {
  const [loading, setLoading] = useState(true);
  const [passMark, setPassMark] = useState(70);
  const [timeLimit, setTimeLimit] = useState<number | "">("");
  const [questions, setQuestions] = useState<QuizQuestionInput[]>([emptyQuestion(0)]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load existing quiz if any
  useEffect(() => {
    getQuizForLesson(lessonId).then((quiz) => {
      if (quiz) {
        setPassMark(quiz.passMark);
        setTimeLimit(quiz.timeLimit ?? "");
        setQuestions(
          quiz.questions.map((q) => ({
            id: q.id,
            text: q.text,
            explanation: q.explanation ?? "",
            orderIndex: q.orderIndex,
            options: q.options.map((o) => ({
              id: o.id,
              text: o.text,
              isCorrect: o.isCorrect,
              orderIndex: o.orderIndex,
            })),
          }))
        );
      }
      setLoading(false);
    });
  }, [lessonId]);

  // ─── Question helpers ────────────────────────────────────────────────────────

  function updateQuestion(idx: number, patch: Partial<QuizQuestionInput>) {
    setQuestions((qs) => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  function updateOption(qIdx: number, oIdx: number, patch: Partial<QuizOptionInput>) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((o, j) =>
                j === oIdx ? { ...o, ...patch } : o
              ),
            }
          : q
      )
    );
  }

  function setCorrect(qIdx: number, oIdx: number) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.map((o, j) => ({
                ...o,
                isCorrect: j === oIdx,
              })),
            }
          : q
      )
    );
  }

  function addOption(qIdx: number) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx
          ? { ...q, options: [...q.options, emptyOption(q.options.length)] }
          : q
      )
    );
  }

  function removeOption(qIdx: number, oIdx: number) {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qIdx
          ? {
              ...q,
              options: q.options.filter((_, j) => j !== oIdx).map((o, j) => ({
                ...o,
                orderIndex: j,
              })),
            }
          : q
      )
    );
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, emptyQuestion(qs.length)]);
  }

  function removeQuestion(idx: number) {
    setQuestions((qs) => qs.filter((_, i) => i !== idx).map((q, i) => ({ ...q, orderIndex: i })));
  }

  // ─── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    setError("");
    setSaving(true);
    const input: QuizInput = {
      passMark,
      timeLimit: timeLimit !== "" ? Number(timeLimit) : null,
      questions: questions.map((q, qi) => ({
        ...q,
        orderIndex: qi,
        options: q.options.map((o, oi) => ({ ...o, orderIndex: oi })),
      })),
    };
    const res = await saveQuiz(lessonId, input);
    setSaving(false);
    if (!res.success) { setError(res.error); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-5 w-5 text-brand" />
        <h3 className="font-semibold">Quiz: {lessonTitle}</h3>
      </div>

      {/* Quiz settings */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Pass mark (%)</label>
          <input
            type="number"
            min={0}
            max={100}
            value={passMark}
            onChange={(e) => setPassMark(Number(e.target.value))}
            className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />Time limit (min, optional)
          </label>
          <input
            type="number"
            min={1}
            value={timeLimit}
            onChange={(e) => setTimeLimit(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="No limit"
            className="w-28 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
          />
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, qIdx) => (
        <Card key={qIdx} className="border border-gray-200 bg-gray-50/50">
          <div className="flex items-start justify-between gap-2 mb-3">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-1">
              Q{qIdx + 1}
            </span>
            {questions.length > 1 && (
              <button
                type="button"
                onClick={() => removeQuestion(qIdx)}
                className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50"
                title="Remove question"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Question text */}
          <Textarea
            rows={2}
            value={q.text}
            onChange={(e) => updateQuestion(qIdx, { text: e.target.value })}
            placeholder="Question text…"
            className="min-h-0 py-2 resize-none"
          />

          {/* Options */}
          <div className="mt-3 space-y-2">
            {q.options.map((opt, oIdx) => (
              <div key={oIdx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCorrect(qIdx, oIdx)}
                  title={opt.isCorrect ? "Correct answer" : "Mark as correct"}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                    opt.isCorrect
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-gray-300 hover:border-green-400"
                  }`}
                >
                  {opt.isCorrect && <Check className="h-3 w-3" />}
                </button>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => updateOption(qIdx, oIdx, { text: e.target.value })}
                  placeholder={`Option ${oIdx + 1}`}
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
                />
                {q.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(qIdx, oIdx)}
                    className="rounded p-1 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => addOption(qIdx)}
            className="mt-2 flex items-center gap-1 text-xs text-brand hover:underline"
          >
            <Plus className="h-3 w-3" />Add option
          </button>

          {/* Explanation */}
          <div className="mt-3">
            <label className="block text-xs text-gray-400 mb-1">
              Explanation (shown after attempt, optional)
            </label>
            <input
              type="text"
              value={q.explanation ?? ""}
              onChange={(e) => updateQuestion(qIdx, { explanation: e.target.value })}
              placeholder="Why is the correct answer correct?"
              className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-brand focus:outline-none"
            />
          </div>
        </Card>
      ))}

      <button
        type="button"
        onClick={addQuestion}
        className="flex items-center gap-1.5 text-sm text-brand hover:underline"
      >
        <Plus className="h-4 w-4" />Add question
      </button>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving…</>
          ) : saved ? (
            <><Check className="h-4 w-4 mr-2" />Saved</>
          ) : (
            "Save quiz"
          )}
        </Button>
        <span className="text-xs text-gray-400">
          {questions.length} question{questions.length !== 1 ? "s" : ""} · {passMark}% to pass
        </span>
      </div>
    </div>
  );
}
