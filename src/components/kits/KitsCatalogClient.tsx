"use client";

import { useMemo, useState } from "react";
import { KitCard } from "@/components/kits/KitCard";
import { MotionGrid } from "@/components/motion/RevealStagger";
import { Reveal } from "@/components/motion/Reveal";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import type { KitCatalogItem } from "@/components/kits/KitCatalogItem";
import { ParticleNetworkBackground } from "@/components/home/ParticleNetworkBackground";
import type { ParticleSettings } from "@/components/home/PageParticleBackground";

const DIFFICULTIES = ["beginner", "intermediate", "advanced"] as const;

export function KitsCatalogClient({
  kits,
  categories,
  particleSettings,
}: {
  kits: KitCatalogItem[];
  categories: string[];
  particleSettings?: ParticleSettings;
}) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return kits.filter((k) => {
      if (search && !k.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (category && k.category !== category) return false;
      if (difficulty && k.difficulty !== difficulty) return false;
      return true;
    });
  }, [kits, search, category, difficulty]);

  return (
    <div className="learner-canvas mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {particleSettings?.enabled && (
        <ParticleNetworkBackground
          enabled
          colors={particleSettings.colors}
          rainbowMode={particleSettings.rainbowMode}
          speed={particleSettings.speed}
          connectDistance={particleSettings.connectDistance}
          lineThickness={particleSettings.lineThickness}
          interaction={particleSettings.interaction}
          intensity={particleSettings.intensity}
        />
      )}
      <LearnerPageHero
        banner="kits"
        title="Learning Kits"
        subtitle="Hands-on hardware kits with guided materials — bill of materials, learning guides, and projects."
      />
      <Reveal className="mt-8 flex flex-col gap-8 lg:flex-row">
        <Card className="h-fit w-full shrink-0 p-4 lg:w-56">
          <p className="text-xs font-semibold uppercase text-gray-400">Category</p>
          <div className="mt-2 space-y-1">
            <button
              type="button"
              onClick={() => setCategory(null)}
              className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                !category ? "bg-brand text-white" : "hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${
                  category === c ? "bg-brand text-white" : "hover:bg-gray-50"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <p className="mt-4 text-xs font-semibold uppercase text-gray-400">Difficulty</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(difficulty === d ? null : d)}
                className={`rounded-full border px-3 py-1 text-xs capitalize ${
                  difficulty === d ? "border-brand bg-brand text-white" : ""
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </Card>

        <div className="flex-1">
          <Input
            placeholder="Search kits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-md"
          />
          <p className="mt-3 text-sm text-gray-500">
            {filtered.length} kit{filtered.length !== 1 ? "s" : ""}
          </p>
          {filtered.length === 0 ? (
            <Card className="mt-6 py-12 text-center text-sm text-gray-400">
              No kits match your filters.
            </Card>
          ) : (
            <MotionGrid className="catalog-grid mt-6">
              {filtered.map((kit) => (
                <KitCard key={kit.id} kit={kit} />
              ))}
            </MotionGrid>
          )}
        </div>
      </Reveal>
    </div>
  );
}
