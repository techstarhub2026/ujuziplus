/**
 * Assignment server actions — instructions, submissions, grading
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { AssignmentSubmissionStatus } from "@prisma/client";
import type { ActionResult } from "./courses";
import { requireUser, requireInstructor, assertSelfOrAdmin } from "@/lib/auth-server";
import { markLessonComplete } from "./enrollments";
import { createNotification } from "./notifications";

export type RubricItem = { label: string; points: number };

export type AssignmentInput = {
  instructions: string;
  rubric: RubricItem[];
  maxScore: number;
  dueAt?: string | null;
};

// ─── Instructor: save assignment config ─────────────────────────────────────

export async function getAssignmentForLesson(lessonId: string, instructorId: string) {
  await requireInstructor();
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, module: { course: { instructorId } } },
    include: { assignment: true },
  });
  return lesson?.assignment ?? null;
}

export async function saveAssignment(
  lessonId: string,
  instructorId: string,
  input: AssignmentInput
): Promise<ActionResult<{ assignmentId: string }>> {
  await requireInstructor();
  const lesson = await db.lesson.findFirst({
    where: { id: lessonId, module: { course: { instructorId } } },
    select: { id: true, type: true },
  });
  if (!lesson || lesson.type !== "ASSIGNMENT") {
    return { success: false, error: "Lesson not found or not an assignment." };
  }

  const assignment = await db.assignment.upsert({
    where: { lessonId },
    create: {
      lessonId,
      instructions: input.instructions.trim(),
      rubric: input.rubric,
      maxScore: input.maxScore,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
    },
    update: {
      instructions: input.instructions.trim(),
      rubric: input.rubric,
      maxScore: input.maxScore,
      dueAt: input.dueAt ? new Date(input.dueAt) : null,
    },
  });

  return { success: true, data: { assignmentId: assignment.id } };
}

// ─── Student: submission ──────────────────────────────────────────────────────

export async function getAssignmentForStudent(
  lessonId: string,
  enrollmentId: string,
  userId: string
) {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const enrollment = await db.enrollment.findFirst({
    where: { id: enrollmentId, userId },
    select: { id: true, courseId: true },
  });
  if (!enrollment) return null;

  const assignment = await db.assignment.findFirst({
    where: { lessonId },
    include: {
      submissions: {
        where: { enrollmentId },
        include: { files: true },
      },
    },
  });
  if (!assignment) return null;

  return {
    assignment,
    submission: assignment.submissions[0] ?? null,
  };
}

export async function saveAssignmentDraft(
  lessonId: string,
  enrollmentId: string,
  userId: string,
  data: { textResponse?: string; githubUrl?: string; filePaths?: { fileName: string; filePath: string; mimeType?: string; sizeBytes?: number }[] }
): Promise<ActionResult<{ submissionId: string }>> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const assignment = await db.assignment.findUnique({ where: { lessonId } });
  if (!assignment) return { success: false, error: "Assignment not configured." };

  const existing = await db.assignmentSubmission.findUnique({
    where: {
      assignmentId_enrollmentId: { assignmentId: assignment.id, enrollmentId },
    },
  });

  const submission = await db.assignmentSubmission.upsert({
    where: {
      assignmentId_enrollmentId: {
        assignmentId: assignment.id,
        enrollmentId,
      },
    },
    create: {
      assignmentId: assignment.id,
      enrollmentId,
      userId,
      status: "DRAFT",
      textResponse: data.textResponse?.trim() ?? null,
      githubUrl: data.githubUrl?.trim() || null,
    },
    update: {
      textResponse: data.textResponse?.trim() ?? null,
      githubUrl: data.githubUrl?.trim() || null,
      ...(existing?.status === "REVISION_REQUESTED" ? { status: "DRAFT" as const } : {}),
    },
  });

  if (data.filePaths?.length) {
    await db.assignmentSubmissionFile.deleteMany({ where: { submissionId: submission.id } });
    await db.assignmentSubmissionFile.createMany({
      data: data.filePaths.map((f) => ({
        submissionId: submission.id,
        fileName: f.fileName,
        filePath: f.filePath,
        mimeType: f.mimeType,
        sizeBytes: f.sizeBytes,
      })),
    });
  }

  return { success: true, data: { submissionId: submission.id } };
}

export async function submitAssignment(
  lessonId: string,
  enrollmentId: string,
  userId: string,
  courseId: string
): Promise<ActionResult> {
  const { user } = await requireUser();
  assertSelfOrAdmin(user.id, userId, user.role);

  const assignment = await db.assignment.findUnique({ where: { lessonId } });
  if (!assignment) return { success: false, error: "Assignment not found." };

  const submission = await db.assignmentSubmission.findUnique({
    where: {
      assignmentId_enrollmentId: {
        assignmentId: assignment.id,
        enrollmentId,
      },
    },
    include: { files: true },
  });

  if (!submission) {
    return { success: false, error: "Save a draft before submitting." };
  }
  if (!submission.textResponse?.trim() && submission.files.length === 0) {
    return { success: false, error: "Add a written response or upload at least one file." };
  }

  await db.assignmentSubmission.update({
    where: { id: submission.id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { course: { select: { instructorId: true, title: true } } } } },
  });
  if (lesson) {
    const student = await db.user.findUnique({
      where: { id: userId },
      select: { fullName: true },
    });
    await createNotification(lesson.module.course.instructorId, {
      type: "ASSIGNMENT_SUBMITTED",
      title: "New assignment submission",
      message: `${student?.fullName ?? "A student"} submitted work in "${lesson.module.course.title}".`,
      href: `/instructor/assignments/grade/${submission.id}`,
    });
  }

  await markLessonComplete(userId, courseId, lessonId);

  revalidatePath(`/learn`);
  revalidatePath("/dashboard/notifications");
  revalidatePath("/instructor/assignments");
  return { success: true, data: undefined };
}

// ─── Instructor: grading queue ────────────────────────────────────────────────

export async function getInstructorAssignmentQueue(instructorId: string) {
  await requireInstructor();

  return db.assignmentSubmission.findMany({
    where: {
      assignment: {
        lesson: { module: { course: { instructorId } } },
      },
      status: { in: ["SUBMITTED", "REVISION_REQUESTED"] },
    },
    orderBy: { submittedAt: "asc" },
    include: {
      user: { select: { id: true, fullName: true, username: true, avatarUrl: true } },
      assignment: {
        include: {
          lesson: {
            select: {
              title: true,
              module: { select: { course: { select: { title: true, id: true } } } },
            },
          },
        },
      },
      files: true,
    },
  });
}

export async function getSubmissionForGrading(
  submissionId: string,
  instructorId: string
) {
  await requireInstructor();

  return db.assignmentSubmission.findFirst({
    where: {
      id: submissionId,
      assignment: { lesson: { module: { course: { instructorId } } } },
    },
    include: {
      user: { select: { id: true, fullName: true, email: true, username: true } },
      files: true,
      assignment: {
        include: {
          lesson: {
            select: {
              id: true,
              title: true,
              module: { select: { course: { select: { id: true, title: true, slug: true } } } },
            },
          },
        },
      },
      enrollment: { select: { id: true } },
    },
  });
}

export async function gradeSubmission(
  submissionId: string,
  instructorId: string,
  data: { score: number; feedback: string; requestRevision?: boolean }
): Promise<ActionResult> {
  await requireInstructor();

  const submission = await db.assignmentSubmission.findFirst({
    where: {
      id: submissionId,
      assignment: { lesson: { module: { course: { instructorId } } } },
    },
    include: {
      assignment: {
        include: {
          lesson: {
            select: {
              id: true,
              slug: true,
              module: { select: { course: { select: { id: true, slug: true, title: true } } } },
            },
          },
        },
      },
      user: { select: { id: true } },
      enrollment: { select: { id: true } },
    },
  });
  if (!submission) return { success: false, error: "Submission not found." };

  const course = submission.assignment.lesson.module.course;
  const lessonId = submission.assignment.lesson.id;

  const max = submission.assignment.maxScore;
  if (data.score < 0 || data.score > max) {
    return { success: false, error: `Score must be between 0 and ${max}.` };
  }

  const status: AssignmentSubmissionStatus = data.requestRevision
    ? "REVISION_REQUESTED"
    : "GRADED";

  await db.assignmentSubmission.update({
    where: { id: submissionId },
    data: {
      status,
      score: data.score,
      feedback: data.feedback.trim(),
      gradedAt: new Date(),
      gradedById: instructorId,
    },
  });

  if (!data.requestRevision) {
    await markLessonComplete(submission.user.id, course.id, lessonId);
    await createNotification(submission.user.id, {
      type: "ASSIGNMENT_GRADED",
      title: "Assignment graded",
      message: `Your assignment was graded: ${data.score}/${max}.`,
      href: `/learn/${course.slug}/${submission.assignment.lesson.slug}`,
    });
  } else {
    await createNotification(submission.user.id, {
      type: "ASSIGNMENT_REVISION_REQUESTED",
      title: "Revision requested",
      message: data.feedback.trim() || "Please revise and resubmit your assignment.",
      href: `/learn/${course.slug}/${submission.assignment.lesson.slug}`,
    });
  }

  revalidatePath("/instructor/assignments");
  revalidatePath("/dashboard/notifications");
  return { success: true, data: undefined };
}
