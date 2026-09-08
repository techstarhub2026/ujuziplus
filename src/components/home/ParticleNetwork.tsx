"use client";

import { useEffect, useRef } from "react";

export interface ParticleNetworkProps {
  colors: string[];
  rainbowMode?: boolean;
  speed?: number;
  connectDistance?: number;
  lineThickness?: number;
  interaction?: "repel" | "attract";
  /** Density multiplier on top of the default particle count. 1 = default. */
  intensity?: number;
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  r: number;
  color: string;
  hue: number;
}

const BASE_AREA_PER_PARTICLE = 16000;
const MAX_PARTICLES = 220;
const MAX_INTENSITY = 4;
const MOUSE_RADIUS = 160;

function hexToRgb(hex: string): [number, number, number] {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

export function ParticleNetwork({
  colors,
  rainbowMode = false,
  speed = 1,
  connectDistance = 140,
  lineThickness = 1,
  interaction = "repel",
  intensity = 1,
  className,
}: ParticleNetworkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef({ colors, rainbowMode, speed, connectDistance, lineThickness, interaction, intensity });
  configRef.current = { colors, rainbowMode, speed, connectDistance, lineThickness, interaction, intensity };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let rafId = 0;
    let hueCycle = 0;

    const mouse = { x: -9999, y: -9999, active: false, down: false };

    const palette = configRef.current.colors.length > 0 ? configRef.current.colors : ["#f39223"];

    function makeParticle(): Particle {
      const hue = Math.random() * 360;
      const color = palette[Math.floor(Math.random() * palette.length)];
      const baseVx = (Math.random() - 0.5) * 0.7;
      const baseVy = (Math.random() - 0.5) * 0.7;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: baseVx,
        vy: baseVy,
        baseVx,
        baseVy,
        r: 1.5 + Math.random() * 1.8,
        color,
        hue,
      };
    }

    function resize() {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      width = rect?.width ?? window.innerWidth;
      height = rect?.height ?? window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const intensityFactor = Math.min(MAX_INTENSITY, Math.max(1, configRef.current.intensity));
      const baseCount = Math.min(
        MAX_PARTICLES,
        Math.max(24, Math.round((width * height) / BASE_AREA_PER_PARTICLE))
      );
      const targetCount = Math.round(baseCount * intensityFactor);
      if (particles.length === 0) {
        particles = Array.from({ length: targetCount }, makeParticle);
      } else if (particles.length < targetCount) {
        particles = particles.concat(
          Array.from({ length: targetCount - particles.length }, makeParticle)
        );
      } else if (particles.length > targetCount) {
        particles = particles.slice(0, targetCount);
      }
    }

    function onPointerMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onPointerDown(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      mouse.down = true;
    }
    function onPointerUp() {
      mouse.down = false;
    }
    function onPointerOut(e: PointerEvent) {
      // only deactivate when the pointer actually leaves the document/window
      if (!e.relatedTarget) {
        mouse.active = false;
        mouse.down = false;
      }
    }

    function colorWithAlpha(hexOrHsl: string, alpha: number, hue?: number): string {
      const cfg = configRef.current;
      if (cfg.rainbowMode && hue !== undefined) {
        const [r, g, b] = hslToRgb(hue, 0.85, 0.55);
        return `rgba(${r | 0},${g | 0},${b | 0},${alpha})`;
      }
      const [r, g, b] = hexToRgb(hexOrHsl);
      return `rgba(${r},${g},${b},${alpha})`;
    }

    function step() {
      const cfg = configRef.current;
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);
      hueCycle = (hueCycle + 0.15) % 360;

      for (const p of particles) {
        p.x += p.vx * cfg.speed;
        p.y += p.vy * cfg.speed;

        if (p.x < 0 || p.x > width) {
          p.vx *= -1;
          p.baseVx *= -1;
        }
        if (p.y < 0 || p.y > height) {
          p.vy *= -1;
          p.baseVy *= -1;
        }
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));

        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy) || 1;
          const attracting = cfg.interaction === "attract" && mouse.down;
          const repelling = cfg.interaction === "repel" || (cfg.interaction === "attract" && !mouse.down);

          if (attracting && dist < MOUSE_RADIUS * 2.2) {
            const force = (1 - dist / (MOUSE_RADIUS * 2.2)) * 0.6;
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
          } else if (repelling && dist < MOUSE_RADIUS) {
            const force = (1 - dist / MOUSE_RADIUS) * 0.8;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }

          const maxV = 2.2;
          const v = Math.hypot(p.vx, p.vy);
          if (v > maxV) {
            p.vx = (p.vx / v) * maxV;
            p.vy = (p.vy / v) * maxV;
          }
        }

        // ease back toward this particle's constant ambient drift, rather than
        // decaying to a full stop — keeps the field alive when the mouse is idle
        p.vx += (p.baseVx - p.vx) * 0.02;
        p.vy += (p.baseVy - p.vy) * 0.02;
      }

      // connections — bucket particles into a uniform grid sized to
      // connectDistance so each particle only checks nearby cells instead of
      // every other particle on the page (critical once intensity/canvas
      // height push particle counts into the hundreds).
      const cellSize = Math.max(20, cfg.connectDistance);
      const cols = Math.max(1, Math.ceil(width / cellSize));
      const rows = Math.max(1, Math.ceil(height / cellSize));
      const grid: Particle[][] = new Array(cols * rows);
      for (const p of particles) {
        const cx = Math.min(cols - 1, Math.max(0, Math.floor(p.x / cellSize)));
        const cy = Math.min(rows - 1, Math.max(0, Math.floor(p.y / cellSize)));
        const idx = cy * cols + cx;
        (grid[idx] ??= []).push(p);
      }

      ctx.lineWidth = cfg.lineThickness;
      const connectDistSq = cfg.connectDistance * cfg.connectDistance;

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const cellParticles = grid[cy * cols + cx];
          if (!cellParticles) continue;

          for (let ni = 0; ni < 9; ni++) {
            const nx = cx + (ni % 3) - 1;
            const ny = cy + Math.floor(ni / 3) - 1;
            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
            const neighborIdx = ny * cols + nx;
            if (neighborIdx < cy * cols + cx) continue; // each cell-pair once
            const neighborParticles = grid[neighborIdx];
            if (!neighborParticles) continue;

            const sameCell = neighborIdx === cy * cols + cx;
            for (let i = 0; i < cellParticles.length; i++) {
              const a = cellParticles[i];
              const startJ = sameCell ? i + 1 : 0;
              for (let j = startJ; j < neighborParticles.length; j++) {
                const b = neighborParticles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distSq = dx * dx + dy * dy;
                if (distSq >= connectDistSq) continue;

                const dist = Math.sqrt(distSq);
                const alpha = (1 - dist / cfg.connectDistance) * 0.5;
                if (cfg.rainbowMode) {
                  const hueA = (a.hue + hueCycle) % 360;
                  const hueB = (b.hue + hueCycle) % 360;
                  const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
                  grad.addColorStop(0, colorWithAlpha(a.color, alpha, hueA));
                  grad.addColorStop(1, colorWithAlpha(b.color, alpha, hueB));
                  ctx.strokeStyle = grad;
                } else {
                  ctx.strokeStyle = colorWithAlpha(a.color, alpha);
                }
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
              }
            }
          }
        }
      }

      // dots
      for (const p of particles) {
        const hue = cfg.rainbowMode ? (p.hue + hueCycle) % 360 : 0;
        ctx.beginPath();
        ctx.fillStyle = colorWithAlpha(p.color, 0.95, hue);
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      rafId = requestAnimationFrame(step);
    }

    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // Listen on window rather than the canvas: normal page content (text,
    // buttons, cards) sits above the canvas in paint order and would
    // otherwise swallow pointer events before they ever reach it.
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointerout", onPointerOut);

    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointerup", onPointerUp);
      document.removeEventListener("pointerout", onPointerOut);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    />
  );
}
