"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { UjuziLogo } from "@/components/brand/UjuziLogo";
import { AuthInnovationOrb } from "@/components/auth/AuthInnovationOrb";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

const AUTH_PILLS = ["Robotics", "IoT", "Data science", "Solar energy"];

export function AuthShell({
  children,
  panelTitle,
  panelSubtitle,
  className,
}: {
  children: React.ReactNode;
  panelTitle: string;
  panelSubtitle: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  const welcomeCopy = (
    <>
      <UjuziLogo variant="full" theme="light" logoHeight={52} href="/" />
      <p className="auth-shell__eyebrow mt-5">Welcome to UjuziLab</p>
      <h2 className="auth-shell__title mt-2 text-3xl leading-tight xl:text-4xl">
        {panelTitle}
      </h2>
      <p className="auth-shell__subtitle mt-3 text-base leading-relaxed">
        {panelSubtitle}
      </p>
      <ul className="auth-shell__pills mt-6 flex flex-wrap gap-2">
        {AUTH_PILLS.map((pill) => (
          <li key={pill} className="auth-shell__pill">
            {pill}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <div className={cn("auth-shell flex min-h-screen", className)}>
      <div className="auth-shell__brand hidden w-1/2 lg:flex">
        <div className="auth-shell__brand-layout">
          {reduceMotion ? (
            <div className="auth-shell__copy">{welcomeCopy}</div>
          ) : (
            <motion.div
              className="auth-shell__copy"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp}>{welcomeCopy}</motion.div>
            </motion.div>
          )}

          <div className="auth-shell__orb-stage">
            <AuthInnovationOrb />
            <p className="auth-shell__orb-hint">Hover to explore the layers</p>
          </div>
        </div>
      </div>

      <div className="auth-shell__form relative flex flex-1 items-center justify-center overflow-hidden px-4 py-10 sm:py-12">
        <div className="relative z-10 w-full max-w-sm">
          <div className="auth-shell__form-mobile-hero lg:hidden">
            <AuthInnovationOrb compact />
            <p className="auth-shell__mobile-welcome">Welcome back to innovation</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function AuthCard({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <div className="auth-card premium-card rounded-2xl border border-gray-100 bg-white/95 p-8 shadow-card backdrop-blur-sm">
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className="auth-card premium-card rounded-2xl border border-gray-100 bg-white/95 p-8 shadow-card backdrop-blur-sm"
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
    >
      {children}
    </motion.div>
  );
}

export function AuthLogo({ title, subtitle }: { title: string; subtitle?: React.ReactNode }) {
  return (
    <div className="mb-8 text-center lg:text-left">
      <div className="mx-auto mb-4 flex justify-center lg:justify-start">
        <UjuziLogo variant="icon" theme="light" logoWidth={120} href="/" />
      </div>
      <h1 className="font-display text-2xl font-bold text-gray-900">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

export const authInputClass =
  "h-11 w-full rounded-xl border border-gray-200 px-4 text-sm shadow-sm transition focus:border-brand/50 focus:outline-none focus:ring-2 focus:ring-brand/20";

export const authButtonClass =
  "flex h-11 w-full items-center justify-center rounded-xl bg-brand font-semibold text-white shadow-sm transition hover:bg-brand-dark hover:shadow-md disabled:opacity-60 active:scale-[0.98]";

export const authSuccessClass =
  "rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800";
