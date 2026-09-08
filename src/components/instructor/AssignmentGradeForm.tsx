"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { gradeSubmission } from "@/lib/actions/assignments";
import { useAppStore } from "@/store/appStore";

type Props = {
  submissionId: string;
  instructorId: string;
  studentName: string;
  courseTitle: string;
  lessonTitle: string;
  maxScore: number;
  files: { fileName: string; filePath: string }[];
  textResponse: string | null;
  githubUrl: string | null;
};

export function AssignmentGradeForm({
  submissionId,
  instructorId,
  studentName,
  courseTitle,
  lessonTitle,
  maxScore,
  files,
  textResponse,
  githubUrl,
}: Props) {
  const router = useRouter();
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  function submit(requestRevision: boolean) {
    startTransition(async () => {
      const res = await gradeSubmission(submissionId, instructorId, {
        score: Number(score),
        feedback,
        requestRevision,
      });
      if (res.success) {
        showToast(requestRevision ? "Revision requested" : "Grade saved", "success");
        router.push("/instructor/assignments");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/instructor/assignments">← Submissions</Link>
      </Button>
      <h1 className="text-2xl font-bold">Grade submission</h1>
      <p className="text-gray-500">
        {studentName} — {courseTitle} / {lessonTitle}
      </p>

      <Card className="mt-6 space-y-4">
        {textResponse && (
          <div>
            <p className="text-sm font-medium mb-1">Written response</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap rounded-lg bg-gray-50 p-3">
              {textResponse}
            </p>
          </div>
        )}
        {githubUrl && (
          <p className="text-sm">
            GitHub:{" "}
            <a href={githubUrl} target="_blank" rel="noopener noreferrer" className="text-brand underline">
              {githubUrl}
            </a>
          </p>
        )}
        {files.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-2">Files</p>
            <ul className="space-y-1">
              {files.map((f) => (
                <li key={f.filePath}>
                  <a href={f.filePath} target="_blank" rel="noopener noreferrer" className="text-sm text-brand hover:underline">
                    {f.fileName}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Input
          label={`Score (0–${maxScore})`}
          type="number"
          value={score}
          onChange={(e) => setScore(e.target.value)}
        />
        <Textarea
          label="Feedback"
          className="h-28"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="What did the student do well? What could improve?"
        />

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => submit(false)} disabled={isPending}>
            Save grade
          </Button>
          <Button variant="outline" onClick={() => submit(true)} disabled={isPending}>
            Request revision
          </Button>
        </div>
      </Card>
    </div>
  );
}
