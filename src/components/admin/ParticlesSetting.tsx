"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  updateParticlesSettings,
  type ParticlesInteraction,
  type ParticlesScope,
} from "@/lib/actions/platform-settings";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

const DEFAULT_COLORS = "#f39223,#00004D,#1a1a6b,#e0831a";

export function ParticlesSetting({
  initialEnabled,
  initialColors,
  initialRainbowMode,
  initialSpeed,
  initialConnectDistance,
  initialLineThickness,
  initialInteraction,
  initialScope,
  initialIntensity,
}: {
  initialEnabled: boolean;
  initialColors: string;
  initialRainbowMode: boolean;
  initialSpeed: number;
  initialConnectDistance: number;
  initialLineThickness: number;
  initialInteraction: string;
  initialScope: string;
  initialIntensity: number;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();

  const [enabled, setEnabled] = useState(initialEnabled);
  const [colors, setColors] = useState(initialColors || DEFAULT_COLORS);
  const [rainbowMode, setRainbowMode] = useState(initialRainbowMode);
  const [speed, setSpeed] = useState(initialSpeed || 1);
  const [connectDistance, setConnectDistance] = useState(initialConnectDistance || 140);
  const [lineThickness, setLineThickness] = useState(initialLineThickness || 1);
  const [interaction, setInteraction] = useState<ParticlesInteraction>(
    initialInteraction === "attract" ? "attract" : "repel"
  );
  const [scope, setScope] = useState<ParticlesScope>(
    initialScope === "belowFeatured" ? "belowFeatured" : "full"
  );
  const [intensity, setIntensity] = useState(initialIntensity || 1);

  const colorList = colors
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  const save = () => {
    startTransition(async () => {
      const res = await updateParticlesSettings({
        particlesEnabled: enabled,
        particlesColors: colors.trim() || DEFAULT_COLORS,
        particlesRainbowMode: rainbowMode,
        particlesSpeed: speed,
        particlesConnectDistance: connectDistance,
        particlesLineThickness: lineThickness,
        particlesInteraction: interaction,
        particlesScope: scope,
        particlesIntensity: intensity,
      });
      if (res.success) {
        showToast("Particle network settings updated", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  const updateColorAt = (idx: number, hex: string) => {
    const next = [...colorList];
    next[idx] = hex;
    setColors(next.join(","));
  };

  const removeColorAt = (idx: number) => {
    const next = colorList.filter((_, i) => i !== idx);
    setColors(next.length > 0 ? next.join(",") : DEFAULT_COLORS);
  };

  const addColor = () => {
    setColors([...colorList, "#f39223"].join(","));
  };

  return (
    <div className="space-y-4">
      <label className="flex items-center justify-between gap-3 text-sm">
        <span>
          <span className="font-medium">Show particle network on homepage</span>
          <span className="block text-xs text-gray-500">
            Animated connected-dots background in the hero section.
          </span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => setEnabled(e.target.checked)}
          className="h-5 w-5 accent-brand"
        />
      </label>

      {enabled && (
        <>
          <div className="text-sm">
            <span className="font-medium">Coverage</span>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => setScope("full")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-left text-xs transition",
                  scope === "full" ? "border-brand bg-brand-light text-brand-dark" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                <span className="block font-semibold">Entire homepage</span>
                Runs behind the whole page, top to bottom.
              </button>
              <button
                type="button"
                onClick={() => setScope("belowFeatured")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-left text-xs transition",
                  scope === "belowFeatured" ? "border-brand bg-brand-light text-brand-dark" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                <span className="block font-semibold">Below Featured courses</span>
                Starts after the Trending/Featured section, showing only through empty white gaps between cards.
              </button>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium">Colors</span>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              {colorList.map((c, i) => (
                <div key={i} className="flex items-center gap-1">
                  <input
                    type="color"
                    value={/^#[0-9a-fA-F]{6}$/.test(c) ? c : "#f39223"}
                    onChange={(e) => updateColorAt(i, e.target.value)}
                    className="h-8 w-8 cursor-pointer rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeColorAt(i)}
                    className="text-xs text-gray-400 hover:text-red-500"
                    aria-label="Remove color"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addColor}
                className="rounded border border-dashed border-gray-300 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
              >
                + Add color
              </button>
            </div>
          </div>

          <label className="flex items-center justify-between gap-3 text-sm">
            <span>
              <span className="font-medium">Rainbow mode</span>
              <span className="block text-xs text-gray-500">
                Cycles particles through the full color spectrum instead of the fixed palette.
              </span>
            </span>
            <input
              type="checkbox"
              checked={rainbowMode}
              onChange={(e) => setRainbowMode(e.target.checked)}
              className="h-5 w-5 accent-brand"
            />
          </label>

          <div className="text-sm">
            <span className="font-medium">Click interaction</span>
            <div className="mt-1.5 flex gap-2">
              <button
                type="button"
                onClick={() => setInteraction("repel")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-left text-xs transition",
                  interaction === "repel" ? "border-brand bg-brand-light text-brand-dark" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                <span className="block font-semibold">Repel</span>
                Hover gently pushes particles away.
              </button>
              <button
                type="button"
                onClick={() => setInteraction("attract")}
                className={cn(
                  "flex-1 rounded-lg border px-3 py-2 text-left text-xs transition",
                  interaction === "attract" ? "border-brand bg-brand-light text-brand-dark" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                )}
              >
                <span className="block font-semibold">Attract</span>
                Click and hold to draw particles in; hover still repels.
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-600">Intensity</span>
              <input
                type="range"
                min="1"
                max="4"
                step="0.25"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-brand"
              />
              <span className="text-xs text-gray-500">{intensity.toFixed(2)}x particles</span>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600">Speed</span>
              <input
                type="range"
                min="0.2"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full accent-brand"
              />
              <span className="text-xs text-gray-500">{speed.toFixed(1)}x</span>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600">Connect distance</span>
              <input
                type="range"
                min="40"
                max="260"
                step="10"
                value={connectDistance}
                onChange={(e) => setConnectDistance(Number(e.target.value))}
                className="w-full accent-brand"
              />
              <span className="text-xs text-gray-500">{connectDistance}px</span>
            </label>
            <label className="block">
              <span className="text-xs font-medium text-gray-600">Line thickness</span>
              <input
                type="range"
                min="0.5"
                max="4"
                step="0.5"
                value={lineThickness}
                onChange={(e) => setLineThickness(Number(e.target.value))}
                className="w-full accent-brand"
              />
              <span className="text-xs text-gray-500">{lineThickness}px</span>
            </label>
          </div>
        </>
      )}

      <Button size="sm" disabled={isPending} onClick={save}>
        {isPending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
