/**
 * Admin server actions — Phase 5
 */
"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { CourseStatus, Role } from "@prisma/client";
import type { ActionResult } from "./courses";
import { archiveOrDeleteCourse } from "./courses";
import { createNotification } from "./notifications";
import { requireAdmin } from "@/lib/auth-server";
import { revalidateCourseCatalog } from "@/lib/revalidate-catalog";
import { sendEmail, instructorApprovedEmail, instructorRejectedEmail } from "@/lib/email";

const MAX_PAGE_LIMIT = 100;

async function guardAdmin(adminId: string) {
  const { user } = await requireAdmin();
  if (user.id !== adminId) throw new Error("Unauthorized");
  return user;
}

// ─── Platform overview stats ──────────────────────────────────────────────────

export async function getPlatformStats() {
  await requireAdmin();

  const [users, courses, enrollments, orders, discussions, certs] = await Promise.all([
    db.user.count(),
    db.course.count(),
    db.enrollment.count(),
    db.order.aggregate({
      where: { status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
    db.discussion.count(),
    db.certificate.count(),
  ]);

  return {
    users,
    courses,
    enrollments,
    totalRevenue: Number(orders._sum.total ?? 0),
    totalOrders: orders._count,
    discussions,
    certificates: certs,
  };
}

// ─── Course review queue ──────────────────────────────────────────────────────

export async function getPendingCourses() {
  await requireAdmin();

  return db.course.findMany({
    where: { status: "PENDING_REVIEW" },
    orderBy: { updatedAt: "asc" },
    include: {
      instructor: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      _count: { select: { modules: true, enrollments: true, certificates: true } },
    },
  });
}

export async function approveCourse(
  adminId: string,
  courseId: string
): Promise<ActionResult> {
  await guardAdmin(adminId);

  const course = await db.course.update({
    where: { id: courseId },
    data: { status: CourseStatus.PUBLISHED },
    select: { title: true, instructorId: true, slug: true },
  });

  await createNotification(course.instructorId, {
    type: "SYSTEM",
    title: "Course approved!",
    message: `Your course "${course.title}" has been approved and is now live.`,
    href: `/courses/${course.slug}`,
  });

  revalidatePath("/admin/courses");
  revalidateCourseCatalog(course.slug);
  return { success: true, data: undefined };
}

export async function rejectCourse(
  adminId: string,
  courseId: string,
  reason: string
): Promise<ActionResult> {
  await guardAdmin(adminId);

  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { success: false, error: "Please provide a rejection reason (at least 10 characters)." };
  }

  const course = await db.course.update({
    where: { id: courseId },
    data: { status: CourseStatus.REJECTED },
    select: { title: true, instructorId: true },
  });

  await createNotification(course.instructorId, {
    type: "SYSTEM",
    title: "Course needs changes",
    message: `Your course "${course.title}" was not approved. Reason: ${trimmed}`,
    href: `/instructor/courses`,
  });

  revalidatePath("/admin/courses");
  return { success: true, data: undefined };
}

// ─── Instructor approval queue ────────────────────────────────────────────────

export async function getPendingInstructors() {
  await requireAdmin();

  return db.user.findMany({
    where: { role: "INSTRUCTOR", instructorStatus: "PENDING" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fullName: true,
      email: true,
      username: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      instructorCredentials: {
        orderBy: { orderIndex: "asc" },
        select: {
          id: true,
          title: true,
          issuer: true,
          issueDate: true,
          credentialUrl: true,
          fileUrl: true,
        },
      },
    },
  });
}

export async function approveInstructor(
  adminId: string,
  userId: string
): Promise<ActionResult> {
  await guardAdmin(adminId);

  const user = await db.user.update({
    where: { id: userId },
    data: { instructorStatus: "APPROVED" },
    select: { fullName: true, email: true },
  });

  await createNotification(userId, {
    type: "SYSTEM",
    title: "Instructor application approved!",
    message: "Your instructor application has been approved. You can now sign in.",
    href: "/instructor/dashboard",
  });

  sendEmail({
    to: user.email,
    subject: "Your UjuziLab instructor application was approved",
    html: instructorApprovedEmail(user.fullName),
  }).then((result) => {
    if (!result.ok) console.error("Instructor approval email failed:", result.error);
  });

  revalidatePath("/admin/instructors");
  return { success: true, data: undefined };
}

export async function rejectInstructor(
  adminId: string,
  userId: string,
  reason: string
): Promise<ActionResult> {
  await guardAdmin(adminId);

  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    return { success: false, error: "Please provide a rejection reason (at least 10 characters)." };
  }

  const user = await db.user.update({
    where: { id: userId },
    data: { instructorStatus: "REJECTED" },
    select: { fullName: true, email: true },
  });

  sendEmail({
    to: user.email,
    subject: "Update on your UjuziLab instructor application",
    html: instructorRejectedEmail(user.fullName, trimmed),
  }).then((result) => {
    if (!result.ok) console.error("Instructor rejection email failed:", result.error);
  });

  revalidatePath("/admin/instructors");
  return { success: true, data: undefined };
}

// ─── User management ──────────────────────────────────────────────────────────

export async function getAllUsers(page = 1, limit = 30, search = "") {
  await requireAdmin();

  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const safePage = Math.max(1, page);
  const skip = (safePage - 1) * safeLimit;
  const q = search.trim().slice(0, 100);

  const where = q
    ? {
        OR: [
          { fullName: { contains: q } },
          { email: { contains: q } },
          { username: { contains: q } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fullName: true,
        email: true,
        username: true,
        role: true,
        isActive: true,
        createdAt: true,
        avatarUrl: true,
        _count: { select: { enrollments: true, courses: true } },
      },
    }),
    db.user.count({ where }),
  ]);

  return { users, total, page: safePage, pages: Math.ceil(total / safeLimit) };
}

export async function getAdminUserDetail(userId: string) {
  await requireAdmin();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      fullName: true,
      email: true,
      username: true,
      role: true,
      isActive: true,
      createdAt: true,
      avatarUrl: true,
      bio: true,
      enrollments: {
        orderBy: { enrolledAt: "desc" },
        take: 10,
        include: {
          course: { select: { title: true, slug: true } },
          progress: { select: { lessonId: true } },
        },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          status: true,
          total: true,
          paymentMethod: true,
          createdAt: true,
          items: {
            include: {
              course: { select: { title: true } },
              kit: { select: { title: true } },
            },
          },
        },
      },
      _count: { select: { enrollments: true, orders: true, courses: true } },
    },
  });

  return user;
}

export async function changeUserRole(
  adminId: string,
  userId: string,
  role: Role
): Promise<ActionResult> {
  await guardAdmin(adminId);
  if (adminId === userId) {
    return { success: false, error: "You cannot change your own role." };
  }

  await db.user.update({ where: { id: userId }, data: { role } });
  revalidatePath("/admin/users");
  return { success: true, data: undefined };
}

export async function suspendUser(
  adminId: string,
  userId: string,
  suspend: boolean
): Promise<ActionResult> {
  await guardAdmin(adminId);
  if (adminId === userId) {
    return { success: false, error: "You cannot suspend your own account." };
  }

  await db.user.update({ where: { id: userId }, data: { isActive: !suspend } });
  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true, data: undefined };
}

// ─── All courses (admin view) ─────────────────────────────────────────────────

export async function getAllCourses(status?: CourseStatus) {
  await requireAdmin();

  return db.course.findMany({
    where: status ? { status } : {},
    orderBy: { updatedAt: "desc" },
    include: {
      instructor: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      _count: { select: { enrollments: true, modules: true, certificates: true } },
    },
  });
}

export async function deleteCourseAsAdmin(
  adminId: string,
  courseId: string
): Promise<ActionResult<{ archived: boolean }>> {
  await guardAdmin(adminId);

  return archiveOrDeleteCourse(courseId);
}

// ─── Payments (admin) ─────────────────────────────────────────────────────────

export async function getAdminPayments(page = 1, limit = 50) {
  await requireAdmin();

  const safeLimit = Math.min(Math.max(1, limit), MAX_PAGE_LIMIT);
  const skip = (Math.max(1, page) - 1) * safeLimit;

  const [orders, total] = await Promise.all([
    db.order.findMany({
      skip,
      take: safeLimit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { fullName: true, email: true } },
        items: {
          include: {
            course: { select: { title: true } },
            kit: { select: { title: true } },
          },
        },
      },
    }),
    db.order.count(),
  ]);

  return { orders, total, page, pages: Math.ceil(total / safeLimit) };
}
