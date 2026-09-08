"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AuthShell } from "@/components/auth/AuthShell";
import { CATEGORIES } from "@/lib/constants";

const STEPS = ["Welcome", "Interests", "Goals", "Complete"];

const GOALS = [
  "Learn new STEM skills",
  "Build innovation projects",
  "Prepare for competitions",
  "Launch a startup",
  "Get certified for employment",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  const toggleInterest = (cat: string) => {
    setInterests((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <AuthShell
      panelTitle="Your journey starts here"
      panelSubtitle="We'll tailor courses, kits, and programs to match your interests and goals."
    >
      <Card className="rounded-2xl border-gray-100 p-8 shadow-card">
        <div className="mb-8 flex gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= step ? "bg-brand" : "bg-gray-200"
                }`}
              />
              <p
                className={`mt-1.5 hidden text-[10px] font-medium sm:block ${
                  i <= step ? "text-brand" : "text-gray-400"
                }`}
              >
                {s}
              </p>
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div
            key="step-0"
            initial={reduceMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="font-display text-2xl font-bold">Welcome to UjuziLab</h1>
            <p className="mt-2 text-gray-500">
              Tell us your interests so we can suggest courses and programs.
            </p>
            <Button className="mt-8 w-full" size="lg" onClick={() => setStep(1)}>
              Get started
            </Button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="step-1"
            initial={reduceMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="font-display text-xl font-bold">What interests you?</h2>
            <p className="text-sm text-gray-500">Select all that apply</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleInterest(cat)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    interests.includes(cat)
                      ? "bg-brand text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <Button
              className="mt-8 w-full"
              size="lg"
              onClick={() => setStep(2)}
              disabled={interests.length === 0}
            >
              Continue
            </Button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step-2"
            initial={reduceMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -16 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-light">
              <Target className="h-6 w-6 text-brand" />
            </div>
            <h2 className="font-display text-xl font-bold">What&apos;s your goal?</h2>
            <div className="mt-4 space-y-2">
              {GOALS.map((g) => (
                <label
                  key={g}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                    goal === g
                      ? "border-brand bg-orange-50 ring-1 ring-brand/20"
                      : "border-gray-200 hover:border-brand/40"
                  }`}
                >
                  <input
                    type="radio"
                    name="goal"
                    value={g}
                    checked={goal === g}
                    onChange={() => setGoal(g)}
                    className="text-brand focus:ring-brand"
                  />
                  <span className="text-sm font-medium">{g}</span>
                </label>
              ))}
            </div>
            <Button className="mt-8 w-full" size="lg" onClick={() => setStep(3)} disabled={!goal}>
              Continue
            </Button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step-3"
            className="text-center"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="font-display text-xl font-bold">You&apos;re all set!</h2>
            <p className="mt-2 text-gray-500">Your personalized dashboard is ready.</p>
            <Button className="mt-8 w-full" size="lg" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </motion.div>
        )}
        </AnimatePresence>
      </Card>
    </AuthShell>
  );
}
