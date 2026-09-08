/** Mentor expertise tracks — aligned with UjuziLab STEM categories. */
export const MENTOR_TRACKS = [
  "Robotics",
  "IoT",
  "PCB Design",
  "AI & Machine Learning",
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Cybersecurity",
  "Entrepreneurship",
  "Career Guidance",
  "Women in STEM",
  "School Programs",
] as const;

export type MentorTrack = (typeof MENTOR_TRACKS)[number];

export const MENTOR_LANGUAGES = ["English", "Swahili", "French", "Portuguese"] as const;

export type LearningPathStep = {
  title: string;
  href: string;
  note?: string;
};

export const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
