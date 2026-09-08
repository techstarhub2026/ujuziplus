"use client";

import { Card, CardTitle } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

/** Weekday initials for the last 7 calendar days, oldest to newest (matches activeLast7 order). */
function last7DayLabels(): string[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return DAY_LABELS[d.getDay()];
  });
}

export function LearningStreak({
  streakDays,
  activeLast7,
}: {
  streakDays: number;
  activeLast7: boolean[];
}) {
  const labels = last7DayLabels();

  return (
    <Card>
      <CardTitle className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-orange-500" />
        Learning streak
      </CardTitle>
      {streakDays > 0 ? (
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{streakDays}</span>
          <span className="text-sm text-gray-500">day{streakDays === 1 ? "" : "s"} in a row</span>
        </div>
      ) : (
        <p className="text-sm font-medium text-gray-700">Start your streak today</p>
      )}
      <div className="mt-4 flex justify-between gap-1">
        {labels.map((day, i) => (
          <div key={`${day}-${i}`} className="flex flex-col items-center gap-1">
            <div
              className={cn(
                "h-8 w-8 rounded-full text-xs font-medium flex items-center justify-center",
                activeLast7[i] ? "bg-brand text-white" : "bg-gray-100 text-gray-400"
              )}
            >
              {activeLast7[i] ? "✓" : ""}
            </div>
            <span className="text-[10px] text-gray-500">{day}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-500">Complete any lesson today to keep your streak</p>
    </Card>
  );
}
