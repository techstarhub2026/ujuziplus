export interface Solution {
  slug: string;
  title: string;
  subtitle: string;
  level: "beginner" | "intermediate" | "advanced";
  hours: number;
  description: string;
  components: string[];
  relatedKitSlugs?: string[];
}

export const solutions: Solution[] = [];

export function getSolutionBySlug(slug: string) {
  return solutions.find((s) => s.slug === slug);
}
