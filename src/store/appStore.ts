import { create } from "zustand";
import { persist } from "zustand/middleware";
import { courses, notifications as initialNotifications } from "@/data/mock";
import type { Notification } from "@/types/app";

export type EnrollmentRecord = {
  courseId: string;
  courseSlug: string;
  progress: number;
  status: "active" | "completed" | "archived";
  enrolledAt: string;
  completedLessons: string[];
};

export type Toast = { id: string; message: string; type: "success" | "error" | "info" };

export type NotificationChannels = { email: boolean; inApp: boolean; push: boolean };

export const NOTIFICATION_PREF_KEYS = [
  "Enrollment confirmations",
  "Assignment feedback",
  "Course updates",
  "Community mentions",
  "Payment receipts",
  "Weekly digest",
] as const;

const defaultNotificationPrefs = (): Record<string, NotificationChannels> =>
  Object.fromEntries(
    NOTIFICATION_PREF_KEYS.map((k) => [k, { email: true, inApp: true, push: false }])
  );

interface AppState {
  enrollments: EnrollmentRecord[];
  wishlist: string[];
  notifications: Notification[];
  toasts: Toast[];
  lessonNotes: Record<string, string>;
  quizAttempts: Record<string, { score: number; passed: boolean }>;
  assignmentStatus: Record<string, "draft" | "submitted" | "graded" | "revision">;
  notificationPrefs: Record<string, NotificationChannels>;
  privacyPrefs: { publicProfile: boolean; showCourses: boolean; showCertificates: boolean };
  registeredProgramSlugs: string[];
  registeredCompetitionSlugs: string[];
  joinedSolutionSlugs: string[];

  enrollFree: (courseId: string, courseSlug: string) => void;
  isEnrolled: (courseId: string) => boolean;
  markLessonComplete: (courseId: string, lessonId: string) => void;
  getEnrollmentProgress: (courseId: string) => number;

  toggleWishlist: (courseId: string) => void;
  isWishlisted: (courseId: string) => boolean;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<Notification, "id" | "createdAt" | "isRead">) => void;

  setLessonNote: (lessonId: string, note: string) => void;
  submitQuiz: (lessonId: string, score: number, passScore: number) => void;
  submitAssignment: (lessonId: string) => void;

  updateNotificationPref: (key: string, channel: keyof NotificationChannels, value: boolean) => void;
  setPrivacyPref: (key: keyof AppState["privacyPrefs"], value: boolean) => void;
  registerProgram: (slug: string) => void;
  registerCompetition: (slug: string) => void;
  joinSolution: (slug: string) => void;

  showToast: (message: string, type?: Toast["type"]) => void;
  dismissToast: (id: string) => void;
}

const defaultEnrollments: EnrollmentRecord[] = [];

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      enrollments: defaultEnrollments,
      wishlist: [],
      notifications: initialNotifications,
      toasts: [],
      lessonNotes: {},
      quizAttempts: {},
      assignmentStatus: {},
      notificationPrefs: defaultNotificationPrefs(),
      privacyPrefs: { publicProfile: true, showCourses: true, showCertificates: true },
      registeredProgramSlugs: [],
      registeredCompetitionSlugs: [],
      joinedSolutionSlugs: [],

      enrollFree: (courseId, courseSlug) => {
        if (get().isEnrolled(courseId)) return;
        set((s) => ({
          enrollments: [
            ...s.enrollments,
            {
              courseId,
              courseSlug,
              progress: 0,
              status: "active",
              enrolledAt: new Date().toISOString(),
              completedLessons: [],
            },
          ],
        }));
        get().addNotification({
          type: "enrollment",
          title: "Enrollment confirmed",
          body: `You enrolled in ${courses.find((c) => c.id === courseId)?.title}`,
          href: `/learn/${courseSlug}/introduction`,
        });
        get().showToast("Successfully enrolled!", "success");
      },

      isEnrolled: (courseId) => get().enrollments.some((e) => e.courseId === courseId),

      markLessonComplete: (courseId, lessonId) => {
        set((s) => ({
          enrollments: s.enrollments.map((e) => {
            if (e.courseId !== courseId) return e;
            const completed = e.completedLessons.includes(lessonId)
              ? e.completedLessons
              : [...e.completedLessons, lessonId];
            const progress = Math.min(100, Math.round((completed.length / 7) * 100));
            return {
              ...e,
              completedLessons: completed,
              progress,
              status: progress >= 100 ? "completed" : e.status,
            };
          }),
        }));
        get().showToast("Lesson marked complete", "success");
      },

      getEnrollmentProgress: (courseId) =>
        get().enrollments.find((e) => e.courseId === courseId)?.progress ?? 0,

      toggleWishlist: (courseId) => {
        const wasIn = get().wishlist.includes(courseId);
        set((s) => ({
          wishlist: wasIn
            ? s.wishlist.filter((id) => id !== courseId)
            : [...s.wishlist, courseId],
        }));
        get().showToast(wasIn ? "Removed from wishlist" : "Added to wishlist", "info");
      },

      isWishlisted: (courseId) => get().wishlist.includes(courseId),

      markNotificationRead: (id) =>
        set((s) => ({
          notifications: s.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllNotificationsRead: () =>
        set((s) => ({
          notifications: s.notifications.map((n) => ({ ...n, isRead: true })),
        })),

      addNotification: (n) =>
        set((s) => ({
          notifications: [
            {
              ...n,
              id: `n-${Date.now()}`,
              isRead: false,
              createdAt: new Date().toISOString(),
            },
            ...s.notifications,
          ],
        })),

      setLessonNote: (lessonId, note) =>
        set((s) => ({ lessonNotes: { ...s.lessonNotes, [lessonId]: note } })),

      submitQuiz: (lessonId, score, passScore) => {
        const passed = score >= passScore;
        set((s) => ({
          quizAttempts: { ...s.quizAttempts, [lessonId]: { score, passed } },
        }));
        get().showToast(passed ? `Quiz passed! Score: ${score}%` : `Quiz failed. Score: ${score}%`, passed ? "success" : "error");
      },

      submitAssignment: (lessonId) => {
        set((s) => ({
          assignmentStatus: { ...s.assignmentStatus, [lessonId]: "submitted" },
        }));
        get().addNotification({
          type: "assignment_feedback",
          title: "Assignment submitted",
          body: "Your submission is being reviewed by the instructor",
        });
        get().showToast("Assignment submitted successfully", "success");
      },

      updateNotificationPref: (key, channel, value) =>
        set((s) => ({
          notificationPrefs: {
            ...s.notificationPrefs,
            [key]: { ...s.notificationPrefs[key], [channel]: value },
          },
        })),

      setPrivacyPref: (key, value) =>
        set((s) => ({ privacyPrefs: { ...s.privacyPrefs, [key]: value } })),

      registerProgram: (slug) => {
        if (get().registeredProgramSlugs.includes(slug)) return;
        set((s) => ({ registeredProgramSlugs: [...s.registeredProgramSlugs, slug] }));
        get().showToast("Program registration submitted", "success");
      },

      registerCompetition: (slug) => {
        if (get().registeredCompetitionSlugs.includes(slug)) return;
        set((s) => ({ registeredCompetitionSlugs: [...s.registeredCompetitionSlugs, slug] }));
        get().showToast("Competition team registered", "success");
      },

      joinSolution: (slug) => {
        if (get().joinedSolutionSlugs.includes(slug)) return;
        set((s) => ({ joinedSolutionSlugs: [...s.joinedSolutionSlugs, slug] }));
      },

      showToast: (message, type = "info") => {
        const id = `toast-${Date.now()}`;
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => get().dismissToast(id), 4000);
      },

      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: "ujuzi-app",
      partialize: (s) => ({
        enrollments: s.enrollments,
        wishlist: s.wishlist,
        lessonNotes: s.lessonNotes,
        quizAttempts: s.quizAttempts,
        assignmentStatus: s.assignmentStatus,
        notificationPrefs: s.notificationPrefs,
        privacyPrefs: s.privacyPrefs,
        registeredProgramSlugs: s.registeredProgramSlugs,
        registeredCompetitionSlugs: s.registeredCompetitionSlugs,
        joinedSolutionSlugs: s.joinedSolutionSlugs,
      }),
    }
  )
);
