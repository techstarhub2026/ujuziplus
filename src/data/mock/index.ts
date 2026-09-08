import type { Course, Notification, Organization, Project, User } from "@/types/app";

// Empty mock data - replace with database queries on production
export const currentUser: User = {
  id: "",
  username: "",
  fullName: "",
  email: "",
  avatarUrl: "",
  roles: [],
  isVerifiedInstructor: false,
};

export const platformStats = {
  learners: 0,
  courses: 0,
  certificates: 0,
  organizations: 0,
  instructors: 0,
};

export const courses: Course[] = [];

export const projects: Project[] = [];

export const organizations: Organization[] = [];

export const notifications: Notification[] = [];

export const dashboardStats = {
  activeCourses: 0,
  completedCourses: 0,
  certificates: 0,
  hoursLearned: 0,
  innovationScore: 0,
  projectsBuilt: 0,
  competitionRank: 0,
  streak: 0,
};
