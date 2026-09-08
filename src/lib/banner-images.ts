/**
 * Section banner backgrounds — African STEM / TechStar UjuziLab themes.
 * Images live in /public/banners/
 */
export type BannerSection =
  | "home"
  | "dashboard"
  | "courses"
  | "programs"
  | "kits"
  | "solutions"
  | "lab-resources"
  | "projects"
  | "organizations"
  | "community"
  | "blog"
  | "pricing"
  | "contact"
  | "cart"
  | "checkout"
  | "search"
  | "my-courses"
  | "competitions"
  | "mentors"
  | "showcase"
  | "auth"
  | "knowledge"
  | "default";

export const BANNER_IMAGES: Record<BannerSection, string> = {
  home: "/banners/home.jpg",
  dashboard: "/banners/dashboard.jpg",
  courses: "/banners/courses.jpg",
  programs: "/banners/programs.jpg",
  kits: "/banners/kits.jpg",
  solutions: "/banners/solutions.jpg",
  "lab-resources": "/banners/lab-resources.jpg",
  projects: "/banners/projects.jpg",
  organizations: "/banners/organizations.jpg",
  community: "/banners/community.jpg",
  blog: "/banners/blog.jpg",
  pricing: "/banners/pricing.jpg",
  contact: "/banners/contact.jpg",
  cart: "/banners/cart.jpg",
  checkout: "/banners/checkout.jpg",
  search: "/banners/search.jpg",
  "my-courses": "/banners/my-courses.jpg",
  competitions: "/banners/competitions.jpg",
  mentors: "/banners/mentors.jpg",
  showcase: "/banners/projects.jpg",
  auth: "/banners/auth.jpg",
  knowledge: "/banners/blog.jpg",
  default: "/banners/home.jpg",
};

export function getBannerImage(section?: BannerSection): string {
  if (!section) return BANNER_IMAGES.default;
  return BANNER_IMAGES[section] ?? BANNER_IMAGES.default;
}
