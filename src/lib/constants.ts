export const PLATFORM = {
  name: "ujuziPlus",
  tagline: "Africa's modern learning and innovation ecosystem",
  externalBrand: "UjuziLab",
  url: "https://ujuziplus.co.tz",
} as const;

/**
 * Article lessons in "PDF mode" store `articleBody` as `${PDF_PREFIX}<url>`
 * instead of written content — used by both the instructor's lesson editor
 * (CourseBuilder) and the learner-facing lesson viewer (ArticleLessonBody).
 */
export const PDF_PREFIX = "pdf::";

/** Main lab navigation (sidebar) */
export const NAV_WAZILAB = [
  { href: "/", label: "Home", icon: "Home" as const },
  { href: "/mentors", label: "Mentors", icon: "Users" as const },
  { href: "/programs", label: "Programs", icon: "GraduationCap" as const },
  { href: "/solutions", label: "Solutions", icon: "Lightbulb" as const },
  { href: "/courses", label: "Courses", icon: "BookOpen" as const },
  { href: "/kits", label: "Learning Kits", icon: "Package" as const },
  { href: "/lab-resources", label: "Lab Resources", icon: "FlaskConical" as const },
  { href: "/open-knowledge", label: "Open Knowledge", icon: "Library" as const },
  { href: "/organizations", label: "Organizations", icon: "Building2" as const },
  { href: "/projects", label: "Projects", icon: "FolderKanban" as const },
  { href: "/showcase", label: "Showcase", icon: "Trophy" as const },
] as const;

export const NAV_PUBLIC = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  { href: "/mentors", label: "Mentors" },
  { href: "/solutions", label: "Solutions" },
  { href: "/courses", label: "Courses" },
  { href: "/kits", label: "Learning Kits" },
  { href: "/lab-resources", label: "Lab Resources" },
  { href: "/open-knowledge", label: "Open Knowledge" },
  { href: "/organizations", label: "Organizations" },
  { href: "/projects", label: "Projects" },
  { href: "/showcase", label: "Showcase" },
  { href: "/competitions", label: "Competitions" },
  { href: "/community", label: "Community" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
] as const;

export const NAV_STUDENT = [
  { href: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
  { href: "/dashboard/my-courses", label: "My Learning", icon: "BookOpen" },
  { href: "/dashboard/my-kits", label: "My Kits", icon: "Package" },
  { href: "/dashboard/programs", label: "Programs", icon: "GraduationCap" },
  { href: "/dashboard/mentors", label: "Mentors", icon: "Users" },
  { href: "/kits", label: "Kit Store", icon: "Package" },
  { href: "/dashboard/solutions", label: "My Solutions", icon: "FlaskConical" },
  { href: "/dashboard/competitions", label: "Competitions", icon: "Trophy" },
  { href: "/dashboard/community", label: "Community", icon: "Users" },
  { href: "/dashboard/resources", label: "Resources", icon: "FolderOpen" },
  { href: "/dashboard/organizations", label: "Organizations", icon: "Building2" },
  { href: "/dashboard/certificates", label: "Certificates", icon: "Award" },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: "Heart" },
  { href: "/dashboard/projects", label: "My Projects", icon: "Lightbulb" },
  { href: "/dashboard/showcase/submit", label: "Showcase", icon: "Trophy" },
  { href: "/dashboard/settings/profile", label: "Settings", icon: "User" },
] as const;

export const NAV_INSTRUCTOR = [
  { href: "/instructor/dashboard", label: "Dashboard" },
  { href: "/instructor/courses", label: "My Courses" },
  { href: "/instructor/analytics", label: "Analytics" },
  { href: "/instructor/earnings", label: "Earnings" },
  { href: "/instructor/students", label: "Students" },
  { href: "/instructor/assignments", label: "Grade assignments" },
  { href: "/instructor/settings/credentials", label: "Certifications" },
] as const;

/** Example org portal routes — use /org/{slug}/… for each institution. */
export const NAV_ORG = [
  { href: "/org/dit-tanzania/dashboard", label: "Overview" },
  { href: "/org/dit-tanzania/members", label: "Members" },
  { href: "/org/dit-tanzania/courses", label: "Courses" },
  { href: "/org/dit-tanzania/kits", label: "Learning Kits" },
  { href: "/org/dit-tanzania/programs", label: "Programs" },
  { href: "/org/dit-tanzania/competitions", label: "Competitions" },
  { href: "/org/dit-tanzania/analytics", label: "Analytics" },
  { href: "/org/dit-tanzania/settings", label: "Settings" },
] as const;

export const SEED_ORGANIZATIONS = [
  { slug: "dit-tanzania", name: "Dar es Salaam Institute of Technology" },
  { slug: "makerere-innovation-hub", name: "Makerere Innovation Hub" },
  { slug: "kigali-stem-academy", name: "Kigali STEM Academy" },
  { slug: "nairobi-techstar", name: "Nairobi TechStar Learning Centre" },
] as const;

export const NAV_ADMIN = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/kits", label: "Learning Kits" },
  { href: "/admin/content", label: "Content" },
  { href: "/admin/organizations", label: "Organizations" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/settings", label: "Settings" },
] as const;

export const CATEGORIES = [
  "AI & Machine Learning",
  "Robotics",
  "IoT",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Cybersecurity",
  "Entrepreneurship",
] as const;