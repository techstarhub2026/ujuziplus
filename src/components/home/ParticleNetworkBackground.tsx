"use client";

import { ParticleNetwork } from "./ParticleNetwork";

export interface ParticleNetworkBackgroundProps {
  enabled: boolean;
  colors: string;
  rainbowMode: boolean;
  speed: number;
  connectDistance: number;
  lineThickness: number;
  interaction: string;
  intensity: number;
}

export function ParticleNetworkBackground({
  enabled,
  colors,
  rainbowMode,
  speed,
  connectDistance,
  lineThickness,
  interaction,
  intensity,
}: ParticleNetworkBackgroundProps) {
  if (!enabled) return null;

  const colorList = colors
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      <ParticleNetwork
        colors={colorList.length > 0 ? colorList : ["#f39223"]}
        rainbowMode={rainbowMode}
        speed={speed}
        connectDistance={connectDistance}
        lineThickness={lineThickness}
        interaction={interaction === "attract" ? "attract" : "repel"}
        intensity={intensity}
      />
    </div>
  );
}
