/** Community channel config — safe to import from client or server. */

export const CHANNELS = [
  {
    slug: "general",
    label: "General",
    description: "Open discussions for everyone across the UjuziLab network",
    icon: "messages",
    accent: "navy",
    tagline: "Connect & converse",
  },
  {
    slug: "qna",
    label: "Q&A",
    description: "Technical questions, troubleshooting, and peer answers",
    icon: "help",
    accent: "blue",
    tagline: "Ask & solve",
  },
  {
    slug: "showcase",
    label: "Showcase",
    description: "Publish project stories, lab write-ups, and demos — with images, links, and cover art",
    icon: "rocket",
    accent: "brand",
    tagline: "Build & share",
  },
  {
    slug: "jobs",
    label: "Jobs & Careers",
    description: "Internships, roles, and opportunities in African STEM",
    icon: "briefcase",
    accent: "emerald",
    tagline: "Grow your career",
  },
  {
    slug: "mentorship",
    label: "Mentorship",
    description: "Connect with industry practitioners for learning-path guidance and office hours",
    icon: "handshake",
    accent: "violet",
    tagline: "Learn from builders",
  },
  {
    slug: "announcements",
    label: "Announcements",
    description: "Platform updates, program launches, and official news",
    icon: "megaphone",
    accent: "amber",
    tagline: "Stay informed",
  },
] as const;

export type ChannelSlug = (typeof CHANNELS)[number]["slug"];
export type ChannelConfig = (typeof CHANNELS)[number];

export function getChannel(slug: string) {
  return CHANNELS.find((c) => c.slug === slug);
}
