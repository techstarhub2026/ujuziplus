import dynamic from "next/dynamic";
import { getPlatformSettings } from "@/lib/actions/platform-settings";

const ParticleNetworkBackground = dynamic(
  () => import("@/components/home/ParticleNetworkBackground").then((m) => ({ default: m.ParticleNetworkBackground })),
  { ssr: false }
);

export interface ParticleSettings {
  enabled: boolean;
  colors: string;
  rainbowMode: boolean;
  speed: number;
  connectDistance: number;
  lineThickness: number;
  interaction: string;
  intensity: number;
}

export async function getPageParticleSettings(): Promise<ParticleSettings> {
  const settings = await getPlatformSettings().catch(() => null);
  return {
    enabled: settings?.particlesEnabled ?? false,
    colors: settings?.particlesColors ?? "#f39223,#00004D,#1a1a6b,#e0831a",
    rainbowMode: !!settings?.particlesRainbowMode,
    speed: settings?.particlesSpeed ?? 1,
    connectDistance: settings?.particlesConnectDistance ?? 140,
    lineThickness: settings?.particlesLineThickness ?? 1,
    interaction: settings?.particlesInteraction ?? "repel",
    intensity: settings?.particlesIntensity ?? 1,
  };
}

/**
 * Drop as the first child inside a page's own `.learner-canvas` (or any
 * `position: relative` container) to render the admin-configured particle
 * background for that page. Must be nested *inside* the page's own canvas
 * element, not wrapped around it — `.learner-canvas` has an opaque
 * background color that would otherwise hide a particle layer mounted
 * behind/outside it.
 */
export async function PageParticleBackground() {
  const settings = await getPageParticleSettings();
  if (!settings.enabled) return null;

  return (
    <ParticleNetworkBackground
      enabled
      colors={settings.colors}
      rainbowMode={settings.rainbowMode}
      speed={settings.speed}
      connectDistance={settings.connectDistance}
      lineThickness={settings.lineThickness}
      interaction={settings.interaction}
      intensity={settings.intensity}
    />
  );
}
