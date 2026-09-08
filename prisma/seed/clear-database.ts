import { PrismaClient } from "@prisma/client";

/** All application tables (excludes _prisma_migrations). Order is arbitrary when FK checks are off. */
const PLATFORM_TABLES = [
  "quiz_attempt_answers",
  "quiz_attempts",
  "quiz_options",
  "quiz_questions",
  "quizzes",
  "assignment_submission_files",
  "assignment_submissions",
  "assignments",
  "lesson_progress",
  "enrollments",
  "certificates",
  "certificate_templates",
  "lessons",
  "course_modules",
  "order_items",
  "orders",
  "kit_purchases",
  "wishlist_items",
  "courses",
  "discussion_likes",
  "discussion_replies",
  "discussions",
  "notifications",
  "notification_preferences",
  "push_subscriptions",
  "fcm_device_tokens",
  "password_reset_tokens",
  "instructor_payouts",
  "instructor_payout_profiles",
  "kit_gallery_images",
  "kit_materials",
  "kit_components",
  "org_kit_requests",
  "org_kit_inventory",
  "org_invites",
  "organization_members",
  "kits",
  "program_registrations",
  "programs",
  "competition_registrations",
  "competitions",
  "organizations",
  "project_likes",
  "projects",
  "solution_joins",
  "solutions",
  "user_lab_resources",
  "lab_resources",
  "blog_posts",
  "pricing_plans",
  "mentor_group_session_attendees",
  "mentor_group_sessions",
  "mentor_office_hours",
  "mentor_sessions",
  "mentor_requests",
  "mentor_profiles",
  "users",
] as const;

export async function clearPlatformData(db: PrismaClient): Promise<void> {
  await db.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 0");

  for (const table of PLATFORM_TABLES) {
    await db.$executeRawUnsafe(`TRUNCATE TABLE \`${table}\``);
  }

  await db.$executeRawUnsafe("SET FOREIGN_KEY_CHECKS = 1");
}
