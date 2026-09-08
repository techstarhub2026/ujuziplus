"use client";

import { cn } from "@/lib/utils";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";

const iconThemes: Record<string, string> = {
  brand: "bg-gradient-to-br from-orange-100 to-amber-50 text-brand ring-orange-200/60 shadow-glow-sm",
  navy: "bg-gradient-to-br from-navy-light to-indigo-50 text-navy ring-navy/20",
  blue: "bg-gradient-to-br from-blue-100 to-sky-50 text-blue-600 ring-blue-200/60",
  amber: "bg-gradient-to-br from-amber-100 to-yellow-50 text-amber-700 ring-amber-200/60",
  purple: "bg-gradient-to-br from-purple-100 to-violet-50 text-purple-600 ring-purple-200/60",
  green: "bg-gradient-to-br from-green-100 to-emerald-50 text-green-600 ring-green-200/60",
};

export function StatCard({
  label,
  value,
  icon,
  iconClassName,
  className,
  delay,
  theme = "brand",
}: {
  label: string;
  value: string | number;
  /** Pass rendered icon JSX from server components — not a component reference. */
  icon: React.ReactNode;
  iconClassName?: string;
  className?: string;
  delay?: number;
  theme?: keyof typeof iconThemes;
}) {
  const numeric = typeof value === "number";

  return (
    <Reveal delay={delay ? delay / 1000 : 0} className={className}>
      <div className="stat-card group flex items-center gap-4">
        <div
          className={cn(
            "icon-bubble flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1",
            iconClassName ?? iconThemes[theme]
          )}
        >
          {icon}
        </div>
        <div>
          <div className="font-display text-3xl font-bold tabular-nums tracking-tight text-navy">
            {numeric ? <CountUp value={value} /> : value}
          </div>
          <div className="text-sm font-medium text-gray-500">{label}</div>
        </div>
      </div>
    </Reveal>
  );
}
