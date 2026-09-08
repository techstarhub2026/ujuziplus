/**
 * Quiz server actions — Phase 2
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { assertActor } from "@/lib/auth-server";
import type { ActionResult } from "./courses";

// ─── Types ───────────────────────────────────────────────────────────────────

export type QuizOptionInput = {
  id?: string;
  text: string;
  isCorrect: boolean;
  orderIndex: number;
};

export type QuizQuestionInput = {
  id?: string;
  text: string;
  explanation?: string;
  orderIndex: number;
  options: QuizOptionInput[];
};

export type QuizInput = {
  passMark: number;
  timeLimit?: number | null;
  questions: QuizQuestionInput[];
};

// ─── Get quiz for a lesson (instructor view — includes correct answers) ───────

export async function getQuizForLesson(lessonId: string) {
  return db.quiz.findUnique({
    where: { lessonId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: {
          options: { orderBy: { orderIndex: "asc" } },
        },
      },
    },
  });
}

// ─── Get quiz for student (correct answers hidden) ────────────────────────────

export async function getQuizForStudent(lessonId: string) {
  const quiz = await db.quiz.findUnique({
    where: { lessonId },
    include: {
      questions: {
        orderBy: { orderIndex: "asc" },
        include: {
          options: {
            orderBy: { orderIndex: "asc" },
            select: { id: true, text: true, orderIndex: true },
          },
        },
      },
    },
  });
  return quiz;
}

// ─── Save/replace quiz for a lesson ──────────────────────────────────────────

export async function saveQuiz(
  lessonId: string,
  input: QuizInput
): Promise<ActionResult<{ quizId: string }>> {
  if (input.questions.length === 0)
    return { success: false, error: "Add at least one question." };

  for (const q of input.questions) {
    if (!q.options.some((o) => o.isCorrect))
      return {
        success: false,
        error: `Question "${q.text.slice(0, 40)}" has no correct answer.`,
      };
    if (q.options.length < 2)
      return {
        success: false,
        error: `Question "${q.text.slice(0, 40)}" needs at least 2 options.`,
      };
  }

  // Upsert quiz
  const existing = await db.quiz.findUnique({ where: { lessonId } });

  let quizId: string;
  if (existing) {
    // Delete old questions (cascade deletes options)
    await db.quizQuestion.deleteMany({ where: { quizId: existing.id } });
    await db.quiz.update({
      where: { id: existing.id },
      data: { passMark: input.passMark, timeLimit: input.timeLimit ?? null },
    });
    quizId = existing.id;
  } else {
    const quiz = await db.quiz.create({
      data: {
        lessonId,
        passMark: input.passMark,
        timeLimit: input.timeLimit ?? null,
      },
    });
    quizId = quiz.id;
  }

  // Create questions + options
  for (const q of input.questions) {
    await db.quizQuestion.create({
      data: {
        quizId,
        text: q.text,
        explanation: q.explanation ?? null,
        orderIndex: q.orderIndex,
        options: {
          create: q.options.map((o) => ({
            text: o.text,
            isCorrect: o.isCorrect,
            orderIndex: o.orderIndex,
          })),
        },
      },
    });
  }

  revalidatePath("/instructor/courses");
  return { success: true, data: { quizId } };
}

// ─── Submit quiz attempt ──────────────────────────────────────────────────────

export async function submitQuiz(
  userId: string,
  lessonId: string,
  answers: Record<string, string> // questionId → optionId
): Promise<
  ActionResult<{
    score: number;
    passed: boolean;
    passMark: number;
    correctCount: number;
    total: number;
    feedback: { questionId: string; isCorrect: boolean; explanation?: string | null }[];
  }>
> {
  await assertActor(userId);

  const quiz = await db.quiz.findUnique({
    where: { lessonId },
    include: {
      questions: {
        include: { options: true },
      },
    },
  });

  if (!quiz) return { success: false, error: "Quiz not found." };

  let correct = 0;
  const feedback: { questionId: string; isCorrect: boolean; explanation?: string | null }[] = [];
  const attemptAnswers: {
    questionId: string;
    optionId: string | null;
    isCorrect: boolean;
  }[] = [];

  for (const question of quiz.questions) {
    const chosenOptionId = answers[question.id] ?? null;
    const correctOption = question.options.find((o) => o.isCorrect);
    const isCorrect = !!chosenOptionId && chosenOptionId === correctOption?.id;
    if (isCorrect) correct++;
    feedback.push({ questionId: question.id, isCorrect, explanation: question.explanation });
    attemptAnswers.push({ questionId: question.id, optionId: chosenOptionId, isCorrect });
  }

  const total = quiz.questions.length;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const passed = score >= quiz.passMark;

  await db.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId,
      score,
      passed,
      completedAt: new Date(),
      answers: {
        create: attemptAnswers,
      },
    },
  });

  return {
    success: true,
    data: { score, passed, passMark: quiz.passMark, correctCount: correct, total, feedback },
  };
}

// ─── Get last attempt for a user on a lesson ─────────────────────────────────

export async function getLastAttempt(userId: string, lessonId: string) {
  await assertActor(userId);

  const quiz = await db.quiz.findUnique({ where: { lessonId }, select: { id: true } });
  if (!quiz) return null;
  return db.quizAttempt.findFirst({
    where: { quizId: quiz.id, userId },
    orderBy: { startedAt: "desc" },
  });
}
