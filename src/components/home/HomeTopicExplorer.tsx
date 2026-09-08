"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Radio,
  Code2,
  Smartphone,
  BarChart3,
  Shield,
  Lightbulb,
  Cpu,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { CATEGORIES } from "@/lib/constants";
import { getCategoryImageUrl } from "@/lib/home-category-images";

const TOPIC_ICONS: Record<string, LucideIcon> = {
  "AI & Machine Learning": Cpu,
  Robotics: Bot,
  IoT: Radio,
  "Web Development": Code2,
  "Mobile Development": Smartphone,
  "Data Science": BarChart3,
  Cybersecurity: Shield,
  Entrepreneurship: Lightbulb,
};

function TopicCard({ category }: { category: (typeof CATEGORIES)[number] }) {
  const Icon = TOPIC_ICONS[category] ?? Cpu;

  return (
    <Link
      href={`/courses?category=${encodeURIComponent(category)}`}
      className="topic-card group"
    >
      <Image
        src={getCategoryImageUrl(category)}
        alt=""
        fill
        className="topic-card__image"
        sizes="(max-width: 640px) 45vw, 220px"
      />
      <span className="topic-card__shade" aria-hidden />
      <span className="topic-card__icon" aria-hidden>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </span>
      <span className="topic-card__label">{category}</span>
    </Link>
  );
}

/**
 * Categories read as a stable, scannable set — a grid, not a moving strip.
 * A reader picking a subject needs to compare options side by side, which a
 * marquee actively prevents.
 */
export function HomeTopicExplorer() {
  return (
    <section className="home-rail" aria-labelledby="topics-heading">
      <div className="home-rail__header">
        <div className="home-rail__copy">
          <h2 id="topics-heading" className="home-rail__title">
            Explore top categories
          </h2>
          <p className="home-rail__desc">
            Pick a subject and start with the fundamentals.
          </p>
        </div>
        <Link href="/courses" className="home-rail__link">
          View all topics
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>

      <div className="topic-grid">
        {CATEGORIES.map((category) => (
          <TopicCard key={category} category={category} />
        ))}
      </div>
    </section>
  );
}
