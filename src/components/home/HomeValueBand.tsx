import Link from "next/link";
import { Wrench, GraduationCap, Users } from "lucide-react";
import { MotionGrid, RevealItem } from "@/components/motion/RevealStagger";

const PILLARS = [
  {
    icon: GraduationCap,
    title: "Learn by building",
    description: "Project-based courses with real hardware, labs, and instructor guidance.",
    href: "/courses",
    cta: "Explore courses",
  },
  {
    icon: Wrench,
    title: "Ship with kits",
    description: "Classroom-ready kits with components, guides, and educator materials.",
    href: "/kits",
    cta: "Browse kits",
  },
  {
    icon: Users,
    title: "Grow with community",
    description: "Join discussions, share projects, and learn alongside peers across Africa.",
    href: "/community",
    cta: "Join community",
  },
] as const;

export function HomeValueBand() {
  return (
    <section className="home-value-band" aria-label="Why UjuziLab">
      <MotionGrid className="home-value-band__inner">
        {PILLARS.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <RevealItem key={pillar.title}>
              <div className="home-value-band__item">
                <span className="home-value-band__icon">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </span>
                <h3 className="home-value-band__title">{pillar.title}</h3>
                <p className="home-value-band__desc">{pillar.description}</p>
                <Link href={pillar.href} className="home-value-band__link">
                  {pillar.cta} →
                </Link>
              </div>
            </RevealItem>
          );
        })}
      </MotionGrid>
    </section>
  );
}
