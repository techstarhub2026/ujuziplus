"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
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

/** Google's four-colour "G", as their branding guidelines require. */
function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.02-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.02 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  );
}

/**
 * "Continue with Google", shared by the sign-in and sign-up pages — the same
 * button serves both, since Google sign-in creates the account when there
 * isn't one already.
 */
export function GoogleSignInButton({
  callbackUrl,
  disabled,
  label = "Continue with Google",
}: {
  callbackUrl?: string | null;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-gray-200" />
        <span className="text-xs uppercase tracking-wide text-gray-400">or</span>
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={() => void signIn("google", { callbackUrl: callbackUrl || "/" })}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:shadow-md disabled:opacity-60 active:scale-[0.98]"
      >
        <GoogleMark />
        {label}
      </button>
    </>
  );
}
