import { CATEGORIES } from "@/lib/constants";

/** Slug → public path for home topic card backgrounds */
export const CATEGORY_IMAGE_SLUGS: Record<(typeof CATEGORIES)[number], string> = {
  "AI & Machine Learning": "ai-machine-learning",
  Robotics: "robotics",
  IoT: "iot",
  "Web Development": "web-development",
  "Mobile Development": "mobile-development",
  "Data Science": "data-science",
  Cybersecurity: "cybersecurity",
  Entrepreneurship: "entrepreneurship",
};

export function getCategoryImageUrl(category: (typeof CATEGORIES)[number]): string {
  const slug = CATEGORY_IMAGE_SLUGS[category];
  return `/images/home/categories/${slug}.png`;
}
