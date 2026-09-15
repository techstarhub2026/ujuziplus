/**
 * Factory reset — clears platform content while leaving people's accounts
 * alone.
 *
 * This is irreversible and there is no backup taken on the way through, so it
 * is guarded three ways: the caller must be an admin, must re-enter their own
 * password, and must type the exact confirmation phrase. Any one of those
 * failing aborts before a single row is touched.
 *
 * Accounts, roles and platform settings survive deliberately: an operator
 * clearing demo content should not find themselves locked out of the console
 * they just used, and learners should not silently lose their logins.
 */
"use server";

import { compare } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-server";
import type { ActionResult } from "./courses";
import { RESET_PHRASE, type FactoryResetInput } from "@/lib/factory-reset-constants";

export async function factoryResetPlatform(
  input: FactoryResetInput
): Promise<ActionResult<{ deleted: number }>> {
  const { user } = await requireAdmin();

  // requireAdmin also admits moderators, whose job is reviewing content rather
  // than destroying all of it.
  if (user.role !== "ADMIN") {
    return { success: false, error: "Only an administrator can reset the platform." };
  }
  const actorId = user.id;

  if (input.confirmation.trim() !== RESET_PHRASE) {
    return { success: false, error: `Type ${RESET_PHRASE} exactly to confirm.` };
  }

  const actor = await db.user.findUnique({ where: { id: actorId } });
  if (!actor) return { success: false, error: "Account not found." };

  // A Google-only admin has no password to check, and an unverifiable
  // identity is not a good enough basis for an irreversible wipe.
  if (!actor.passwordHash) {
    return {
      success: false,
      error:
        "This account signs in with Google and has no password. Set a password before running a reset.",
    };
  }

  if (!(await compare(input.password, actor.passwordHash))) {
    return { success: false, error: "That password is not correct." };
  }

  // Ordered leaf-first: rows that point at other rows go before the rows they
  // point at, so no delete trips a foreign key on the way through.
  let deleted = 0;
  const wipe = async (label: string, run: () => Promise<{ count: number }>) => {
    const { count } = await run();
    deleted += count;
    console.log(`[factory-reset] ${label}: ${count}`);
  };

  // Learning
  await wipe("quiz attempt answers", () => db.quizAttemptAnswer.deleteMany({}));
  await wipe("quiz attempts", () => db.quizAttempt.deleteMany({}));
  await wipe("quiz options", () => db.quizOption.deleteMany({}));
  await wipe("quiz questions", () => db.quizQuestion.deleteMany({}));
  await wipe("quizzes", () => db.quiz.deleteMany({}));
  await wipe("lesson progress", () => db.lessonProgress.deleteMany({}));
  await wipe("assignment submission files", () => db.assignmentSubmissionFile.deleteMany({}));
  await wipe("assignment submissions", () => db.assignmentSubmission.deleteMany({}));
  await wipe("assignments", () => db.assignment.deleteMany({}));
  await wipe("certificates", () => db.certificate.deleteMany({}));
  await wipe("enrollments", () => db.enrollment.deleteMany({}));
  await wipe("lessons", () => db.lesson.deleteMany({}));
  await wipe("course modules", () => db.courseModule.deleteMany({}));
  await wipe("courses", () => db.course.deleteMany({}));

  // Commerce
  await wipe("order items", () => db.orderItem.deleteMany({}));
  await wipe("kit purchases", () => db.kitPurchase.deleteMany({}));
  await wipe("orders", () => db.order.deleteMany({}));
  await wipe("wishlist items", () => db.wishlistItem.deleteMany({}));
  await wipe("instructor payouts", () => db.instructorPayout.deleteMany({}));

  // Kits
  await wipe("kit gallery images", () => db.kitGalleryImage.deleteMany({}));
  await wipe("kit materials", () => db.kitMaterial.deleteMany({}));
  await wipe("kit components", () => db.kitComponent.deleteMany({}));
  await wipe("org kit requests", () => db.orgKitRequest.deleteMany({}));
  await wipe("org kit inventory", () => db.orgKitInventory.deleteMany({}));
  await wipe("kits", () => db.kit.deleteMany({}));

  // Community
  await wipe("discussion likes", () => db.discussionLike.deleteMany({}));
  await wipe("discussion replies", () => db.discussionReply.deleteMany({}));
  await wipe("discussions", () => db.discussion.deleteMany({}));
  await wipe("blog posts", () => db.blogPost.deleteMany({}));

  // Projects, solutions, showcase
  await wipe("project likes", () => db.projectLike.deleteMany({}));
  await wipe("project members", () => db.projectMember.deleteMany({}));
  await wipe("projects", () => db.project.deleteMany({}));
  await wipe("solution joins", () => db.solutionJoin.deleteMany({}));
  await wipe("solutions", () => db.solution.deleteMany({}));
  await wipe("showcase likes", () => db.showcaseLike.deleteMany({}));
  await wipe("showcase projects", () => db.showcaseProject.deleteMany({}));

  // Programs and competitions
  await wipe("program registrations", () => db.programRegistration.deleteMany({}));
  await wipe("program events", () => db.programEvent.deleteMany({}));
  await wipe("program units", () => db.programUnit.deleteMany({}));
  await wipe("programs", () => db.program.deleteMany({}));
  await wipe("competition registrations", () => db.competitionRegistration.deleteMany({}));
  await wipe("competitions", () => db.competition.deleteMany({}));

  // Mentorship
  await wipe("cohort members", () => db.mentorCohortMember.deleteMany({}));
  await wipe("cohorts", () => db.mentorCohort.deleteMany({}));
  await wipe("group session attendees", () => db.mentorGroupSessionAttendee.deleteMany({}));
  await wipe("group sessions", () => db.mentorGroupSession.deleteMany({}));
  await wipe("office hours", () => db.mentorOfficeHour.deleteMany({}));
  await wipe("mentor sessions", () => db.mentorSession.deleteMany({}));
  await wipe("mentor requests", () => db.mentorRequest.deleteMany({}));
  await wipe("mentor profiles", () => db.mentorProfile.deleteMany({}));

  // Organizations
  await wipe("org invites", () => db.orgInvite.deleteMany({}));
  await wipe("organization members", () => db.organizationMember.deleteMany({}));
  await wipe("organizations", () => db.organization.deleteMany({}));

  // Reference content
  await wipe("user lab resources", () => db.userLabResource.deleteMany({}));
  await wipe("lab resources", () => db.labResource.deleteMany({}));
  await wipe("open knowledge resources", () => db.openKnowledgeResource.deleteMany({}));

  // Notifications about content that no longer exists
  await wipe("notifications", () => db.notification.deleteMany({}));

  console.log(`[factory-reset] complete — ${deleted} rows, run by ${actor.email}`);

  revalidatePath("/", "layout");
  return { success: true, data: { deleted } };
}
