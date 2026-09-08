"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Outstanding"];

interface Props {
  sessionId: string;
  mentorName: string;
  onRate: (sessionId: string, rating: number, feedback: string) => Promise<{ success: boolean; error?: string }>;
}

export function SessionRatingForm({ sessionId, mentorName, onRate }: Props) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!selected) { setError("Please choose a star rating."); return; }
    setSubmitting(true);
    setError("");
    const res = await onRate(sessionId, selected, feedback);
    setSubmitting(false);
    if (!res.success) { setError(res.error ?? "Failed to submit rating."); return; }
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-6 py-8 text-center">
        <CheckCircle className="h-10 w-10 text-green-500" />
        <p className="font-semibold text-green-800">Thank you for your feedback!</p>
        <p className="text-sm text-green-600">Your rating helps other learners find great mentors.</p>
      </div>
    );
  }

  const displayRating = hovered || selected;

  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-6">
      <h3 className="font-display font-semibold text-gray-900 mb-1">How was your session with {mentorName}?</h3>
      <p className="text-sm text-gray-500 mb-5">Your honest feedback helps {mentorName} improve and helps other learners make better choices.</p>

      {/* Stars */}
      <div
        className="flex gap-1.5 mb-2"
        onMouseLeave={() => setHovered(0)}
        role="radiogroup"
        aria-label="Rating"
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={selected === star}
            aria-label={`${star} star${star !== 1 ? "s" : ""} — ${STAR_LABELS[star]}`}
            onMouseEnter={() => setHovered(star)}
            onClick={() => setSelected(star)}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"
          >
            <Star
              className={cn(
                "h-9 w-9 transition-all duration-100",
                star <= displayRating
                  ? "fill-amber-400 text-amber-400 scale-110"
                  : "text-gray-300 hover:text-amber-300"
              )}
            />
          </button>
        ))}
      </div>

      {displayRating > 0 && (
        <p className="text-sm font-medium text-amber-700 mb-4 h-5">
          {STAR_LABELS[displayRating]}
        </p>
      )}

      <div className="mb-4">
        <Textarea
          label="Share more (optional)"
          className="resize-none focus:ring-amber-200 focus:border-amber-400"
          rows={3}
          maxLength={1000}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={`What did ${mentorName} do well? What could be improved?`}
        />
        <p className="text-xs text-gray-400 text-right mt-1">{feedback.length}/1000</p>
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <Button onClick={handleSubmit} disabled={submitting || !selected}>
        {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</> : "Submit rating"}
      </Button>
    </div>
  );
}
