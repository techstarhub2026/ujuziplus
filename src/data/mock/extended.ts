export const communityChannels = [
  { slug: "general", name: "General", description: "Community-wide discussions" },
  { slug: "showcase", name: "Showcase", description: "Share your projects" },
  { slug: "help", name: "Help", description: "Get help with coding & STEM" },
  { slug: "robotics", name: "Robotics", description: "Robotics discussions" },
  { slug: "mentorship", name: "Mentorship", description: "Ask mentors anything" },
];

export const communityPosts: Array<{
  id: string;
  channelSlug: string;
  title: string;
  author: string;
  avatar: string;
  content: string;
  upvotes: number;
  replies: number;
  createdAt: string;
  tags: string[];
}> = [];

export const competitions: Array<{
  id: string;
  slug: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  prize: string;
  teams: number;
  status: "upcoming" | "registration_open" | "in_progress" | "completed";
}> = [];

export const programs: Array<{
  id: string;
  slug: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  format: string;
  seats: number;
  enrolled: number;
  price: number;
}> = [];

export const resources: Array<{
  id: string;
  title: string;
  type: string;
  size: string;
  category: string;
}> = [];

export const reviews: Array<{
  id: string;
  user: string;
  rating: number;
  comment: string;
  date: string;
}> = [];

export const pricingPlans: Array<{
  name: string;
  price: number;
  period?: string;
  features: string[];
  popular?: boolean;
}> = [];

export const pendingCourses: Array<{
  id: string;
  title: string;
  instructor: string;
  category: string;
  submittedAt: string;
  lessonCount: number;
}> = [];

export const adminUsers: Array<{
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
}> = [];

export const payments: Array<{
  id: string;
  user: string;
  course: string;
  amount: number;
  method: string;
  status: string;
  date: string;
}> = [];
