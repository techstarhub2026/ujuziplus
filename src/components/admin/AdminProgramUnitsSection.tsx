"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { addProgramUnit, removeProgramUnit, reorderProgramUnit } from "@/lib/actions/program-units";
import { useAppStore } from "@/store/appStore";

type Unit = {
  id: string;
  course: { id: string; title: string; slug: string };
};

type CourseOption = { id: string; title: string; slug: string };

export function AdminProgramUnitsSection({
  programId,
  units,
  courseOptions,
}: {
  programId: string;
  units: Unit[];
  courseOptions: CourseOption[];
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();
  const linkedIds = new Set(units.map((u) => u.course.id));
  const available = courseOptions.filter((c) => !linkedIds.has(c.id));
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const addUnit = () => {
    if (!selectedCourseId) return;
    startTransition(async () => {
      const res = await addProgramUnit(programId, selectedCourseId);
      if (res.success) {
        showToast("Unit added", "success");
        setSelectedCourseId("");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  const remove = (unitId: string, title: string) => {
    if (!confirm(`Remove "${title}" from this program's curriculum?`)) return;
    startTransition(async () => {
      const res = await removeProgramUnit(unitId);
      if (res.success) {
        showToast("Unit removed", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  const move = (unitId: string, direction: "up" | "down") => {
    startTransition(async () => {
      await reorderProgramUnit(unitId, direction);
      router.refresh();
    });
  };

  return (
    <Card className="max-w-2xl space-y-4 p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
        Curriculum / Program Units
      </h2>
      <p className="text-xs text-gray-500">
        Link existing courses to this program in order. Learner progress is derived from their
        enrollment in each linked course.
      </p>

      <div className="flex gap-2">
        <select
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
        >
          <option value="">— Select a published course —</option>
          {available.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
        <Button type="button" disabled={!selectedCourseId || isPending} onClick={addUnit}>
          Add unit
        </Button>
      </div>

      {units.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">No units linked yet.</p>
      ) : (
        <ol className="space-y-1.5">
          {units.map((unit, i) => (
            <li
              key={unit.id}
              className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
            >
              <span className="w-6 shrink-0 text-xs font-medium text-gray-400">{i + 1}.</span>
              <span className="flex-1 truncate text-sm">{unit.course.title}</span>
              <button
                type="button"
                disabled={i === 0 || isPending}
                onClick={() => move(unit.id, "up")}
                className="text-gray-400 hover:text-brand disabled:opacity-30"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={i === units.length - 1 || isPending}
                onClick={() => move(unit.id, "down")}
                className="text-gray-400 hover:text-brand disabled:opacity-30"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => remove(unit.id, unit.course.title)}
                className="text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
