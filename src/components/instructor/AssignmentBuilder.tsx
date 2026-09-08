"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getAssignmentForLesson,
  saveAssignment,
  type RubricItem,
} from "@/lib/actions/assignments";
import { useAppStore } from "@/store/appStore";

export function AssignmentBuilder({
  lessonId,
  lessonTitle,
  instructorId,
}: {
  lessonId: string;
  lessonTitle: string;
  instructorId: string;
}) {
  const showToast = useAppStore((s) => s.showToast);
  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState("");
  const [maxScore, setMaxScore] = useState(100);
  const [dueAt, setDueAt] = useState("");
  const [rubric, setRubric] = useState<RubricItem[]>([
    { label: "Completeness", points: 40 },
    { label: "Quality", points: 40 },
    { label: "Documentation", points: 20 },
  ]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getAssignmentForLesson(lessonId, instructorId).then((a) => {
      if (a) {
        setInstructions(a.instructions ?? "");
        setMaxScore(a.maxScore);
        if (a.dueAt) setDueAt(new Date(a.dueAt).toISOString().slice(0, 16));
        const r = a.rubric as RubricItem[] | null;
        if (Array.isArray(r) && r.length) setRubric(r);
      }
      setLoading(false);
    });
  }, [lessonId, instructorId]);

  async function handleSave() {
    setSaving(true);
    const res = await saveAssignment(lessonId, instructorId, {
      instructions,
      rubric,
      maxScore,
      dueAt: dueAt || null,
    });
    setSaving(false);
    if (res.success) showToast("Assignment saved", "success");
    else showToast(res.error ?? "Failed", "error");
  }

  if (loading) {
    return <p className="text-sm text-gray-400 py-4">Loading assignment…</p>;
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-violet-200 bg-violet-50/50 p-4">
      <h4 className="font-semibold text-sm">Assignment: {lessonTitle}</h4>

      <Textarea
        label="Instructions for students"
        className="h-32"
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder="What should students submit? Include requirements, file types, and grading criteria…"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Max score"
          type="number"
          value={String(maxScore)}
          onChange={(e) => setMaxScore(Number(e.target.value) || 100)}
        />
        <Input
          label="Due date (optional)"
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Rubric</label>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setRubric([...rubric, { label: "", points: 10 }])}
          >
            <Plus className="h-3 w-3 mr-1" />Add row
          </Button>
        </div>
        {rubric.map((row, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              className="flex-1 rounded-lg border px-3 py-2 text-sm"
              placeholder="Criterion"
              value={row.label}
              onChange={(e) => {
                const next = [...rubric];
                next[i] = { ...row, label: e.target.value };
                setRubric(next);
              }}
            />
            <input
              type="number"
              className="w-20 rounded-lg border px-3 py-2 text-sm"
              value={row.points}
              onChange={(e) => {
                const next = [...rubric];
                next[i] = { ...row, points: Number(e.target.value) || 0 };
                setRubric(next);
              }}
            />
            <button
              type="button"
              onClick={() => setRubric(rubric.filter((_, j) => j !== i))}
              className="p-2 text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Button size="sm" onClick={handleSave} disabled={saving}>
        {saving ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
        Save assignment
      </Button>
    </div>
  );
}
