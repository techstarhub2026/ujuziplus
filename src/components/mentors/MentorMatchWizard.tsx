"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Compass, ShieldCheck, Target, Zap, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { MentorCard } from "./MentorCard";
import { MENTOR_TRACKS } from "@/lib/mentors/tracks";
import { matchMentors, type SerializedMentor } from "@/lib/actions/mentors";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: ShieldCheck, label: "Vetted mentors", color: "bg-violet-100 text-violet-600" },
  { icon: Target, label: "Personalized matches", color: "bg-emerald-100 text-emerald-600" },
  { icon: Zap, label: "Faster progress", color: "bg-blue-100 text-blue-600" },
];

export function MentorMatchWizard({ mentors }: { mentors: SerializedMentor[] }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [selectedTracks, setSelectedTracks] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [matches, setMatches] = useState<SerializedMentor[]>([]);
  const [isPending, startTransition] = useTransition();

  const toggleTrack = (t: string) => {
    setSelectedTracks((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const findMatches = () => {
    startTransition(async () => {
      const results = await matchMentors(selectedTracks, goal);
      setMatches(results.length > 0 ? results : mentors.slice(0, 4));
      setStep(2);
    });
  };

  if (!open) {
    const previewMentors = mentors.slice(0, 3);

    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mentor-match-teaser group"
      >
        <span className="mentor-match-teaser__row">
          <span className="mentor-match-teaser__icon">
            <Compass className="h-7 w-7" aria-hidden />
            <Sparkle className="mentor-match-teaser__sparkle mentor-match-teaser__sparkle--1" aria-hidden />
            <Sparkle className="mentor-match-teaser__sparkle mentor-match-teaser__sparkle--2" aria-hidden />
          </span>

          <span className="mentor-match-teaser__body">
            <span className="mentor-match-teaser__title">Match me with a mentor</span>
            <span className="mentor-match-teaser__desc">
              Pick your focus area and tell us what you&apos;re building — we&apos;ll shortlist mentors who fit.
            </span>

            {previewMentors.length > 0 && (
              <span className="mentor-match-teaser__social">
                <span className="mentor-match-teaser__avatars">
                  {previewMentors.map((m) => (
                    <Avatar key={m.id} src={m.avatarUrl} alt={m.displayName} size="sm" ring />
                  ))}
                </span>
                {mentors.length > previewMentors.length && (
                  <span className="mentor-match-teaser__count">+{mentors.length - previewMentors.length}</span>
                )}
                <span className="mentor-match-teaser__social-text">
                  {mentors.length} mentor{mentors.length !== 1 ? "s" : ""} ready to guide you
                </span>
              </span>
            )}

            <span className="mentor-match-teaser__features">
              {FEATURES.map((f) => (
                <span key={f.label} className="mentor-match-teaser__feature">
                  <span className={cn("mentor-match-teaser__feature-icon", f.color)}>
                    <f.icon className="h-3.5 w-3.5" aria-hidden />
                  </span>
                  {f.label}
                </span>
              ))}
            </span>
          </span>
        </span>

        <span className="mentor-match-teaser__cta-wrap">
          <span className="mentor-match-teaser__cta">
            Get Matched
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </span>
        </span>
      </button>
    );
  }

  return (
    <Card className="mentor-match-wizard relative overflow-hidden">
      <button
        type="button"
        onClick={() => { setOpen(false); setStep(0); }}
        aria-label="Close mentor match"
        className="absolute right-4 top-4 z-10 text-sm font-medium text-white/70 transition-colors hover:text-white"
      >
        Close ✕
      </button>
      <div className="mentor-match-wizard__header">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand">Get matched</p>
        <h2 className="font-display text-xl font-bold text-white">
          Find a mentor for your path
        </h2>
        <p className="text-sm text-white/80">
          Three quick steps — we&apos;ll suggest practitioners who fit your goals.
        </p>
        <div className="mentor-match-wizard__steps" aria-hidden>
          {[0, 1, 2].map((s) => (
            <span
              key={s}
              className={cn("mentor-match-wizard__step-dot", step >= s && "mentor-match-wizard__step-dot--active")}
            />
          ))}
        </div>
      </div>

      <div className="p-6">
        {step === 0 && (
          <div>
            <p className="text-sm font-medium mb-3">Which tracks interest you?</p>
            <div className="flex flex-wrap gap-2">
              {MENTOR_TRACKS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={cn(
                    "mentors-filter-pill",
                    selectedTracks.includes(t) && "mentors-filter-pill--active"
                  )}
                  onClick={() => toggleTrack(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <Button className="mt-6" disabled={selectedTracks.length === 0} onClick={() => setStep(1)}>
              Next
            </Button>
          </div>
        )}

        {step === 1 && (
          <div>
            <Textarea
              label="What do you want to achieve?"
              className="min-h-[90px]"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. I want to prototype an IoT weather station for my community…"
            />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                Back
              </Button>
              <Button disabled={isPending || goal.trim().length < 10} onClick={findMatches}>
                {isPending ? "Matching…" : "Find mentors"}
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-gray-600 mb-4">
              {matches.length > 0
                ? "Here are mentors we think fit your goals:"
                : "Browse these mentors to get started:"}
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {matches.map((m) => (
                <MentorCard key={m.id} mentor={m} variant="grid" />
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={() => setStep(0)}>
                Start over
              </Button>
              <Button asChild variant="ghost">
                <Link href="/mentors">Browse all mentors</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
