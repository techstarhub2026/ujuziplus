import type { NotificationType } from "@prisma/client";

/** Maps Prisma notification types to user-facing preference categories */
export function notificationCategory(type: NotificationType): string {
  switch (type) {
    case "ASSIGNMENT_SUBMITTED":
    case "ASSIGNMENT_GRADED":
    case "ASSIGNMENT_REVISION_REQUESTED":
      return "Assignment feedback";
    case "NEW_ENROLLMENT":
      return "Enrollment confirmations";
    case "REPLY_ON_POST":
    case "LIKE_ON_POST":
      return "Community mentions";
    case "COURSE_COMPLETE":
    case "CERTIFICATE_ISSUED":
      return "Course updates";
    case "MENTOR_REQUEST":
    case "MENTOR_REQUEST_UPDATE":
    case "MENTOR_SESSION_SCHEDULED":
    case "MENTOR_SESSION_REMINDER":
      return "Mentorship";
    default:
      return "Course updates";
  }
}

export const NOTIFICATION_PREF_CATEGORIES = [
  "Enrollment confirmations",
  "Assignment feedback",
  "Course updates",
  "Community mentions",
  "Mentorship",
  "Payment receipts",
  "Weekly digest",
] as const;
