"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cpu, FlaskConical, Radio, Sun, Bot, CircuitBoard } from "lucide-react";

const DISCIPLINES = [
  { label: "Robotics", icon: Bot },
  { label: "IoT & Sensors", icon: Radio },
  { label: "Solar & Energy", icon: Sun },
  { label: "Electronics", icon: CircuitBoard },
  { label: "Data & AI", icon: Cpu },
  { label: "Lab Science", icon: FlaskConical },
] as const;

export function StemDisciplineTicker() {
  // useReducedMotion() returns null on the server and the real OS
  // preference on the client's first render, so branching JSX structure on
  // it directly causes a hydration mismatch. Instead always render the
  // same AnimatePresence/motion.span structure, and only start suppressing
  // animation (and the rotation interval) once mounted.
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % DISCIPLINES.length), 3200);
    return () => clearInterval(id);
  }, [mounted, reduceMotion]);

  const animationsDisabled = mounted && reduceMotion;
  const current = DISCIPLINES[index];
  const Icon = current.icon;

  return (
    <div className="stem-ticker" aria-live="polite">
      <span className="stem-ticker__label">Explore</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={current.label}
          className="stem-ticker__chip"
          initial={animationsDisabled ? false : { opacity: 0, y: 8, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={animationsDisabled ? undefined : { opacity: 0, y: -8, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <Icon className="h-3.5 w-3.5" aria-hidden />
          {current.label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

type PlatformPulseProps = {
  programCount: number;
  courseCount: number;
  kitCount: number;
};

export function PlatformPulse({ programCount, courseCount, kitCount }: PlatformPulseProps) {
  return (
    <div className="platform-pulse" aria-label="Platform highlights">
      <span className="platform-pulse__dot" aria-hidden />
      <span>
        <strong>{courseCount}</strong> courses
      </span>
      <span className="platform-pulse__sep" aria-hidden>
        ·
      </span>
      <span>
        <strong>{kitCount}</strong> kits
      </span>
      <span className="platform-pulse__sep" aria-hidden>
        ·
      </span>
      <span>
        <strong>{programCount}</strong> programs
      </span>
    </div>
  );
}
