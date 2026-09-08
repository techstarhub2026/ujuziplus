"use client";

import { useState } from "react";
import { Upload, Github, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  saveAssignmentDraft,
  submitAssignment,
} from "@/lib/actions/assignments";
import type { RubricItem } from "@/lib/actions/assignments";
import { useAppStore } from "@/store/appStore";

type SubmissionFile = {
  id: string;
  fileName: string;
  filePath: string;
};

type Props = {
  lessonId: string;
  lessonTitle: string;
  enrollmentId: string;
  userId: string;
  courseId: string;
  instructions: string;
  rubric: RubricItem[] | null;
  maxScore: number;
  dueAt: Date | null;
  initialStatus: string;
  initialText: string;
  initialGithub: string;
  initialFiles: SubmissionFile[];
  initialScore?: number | null;
  initialFeedback?: string | null;
  onSubmitted?: () => void;
};

async function uploadFile(file: File, onProgress: (p: number) => void): Promise<string | null> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("file", file);
    form.append("kind", "doc");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json.url ?? null);
        } catch {
          resolve(null);
        }
      } else resolve(null);
    };
    xhr.onerror = () => resolve(null);
    xhr.open("POST", "/api/upload");
    xhr.send(form);
  });
}

const STATUS_LABEL: Record<string, "success" | "warning" | "error" | "outline"> = {
  DRAFT: "outline",
  SUBMITTED: "warning",
  REVISION_REQUESTED: "error",
  GRADED: "success",
};

export function AssignmentPlayer({
  lessonId,
  lessonTitle,
  enrollmentId,
  userId,
  courseId,
  instructions,
  rubric,
  maxScore,
  dueAt,
  initialStatus,
  initialText,
  initialGithub,
  initialFiles,
  initialScore,
  initialFeedback,
  onSubmitted,
}: Props) {
  const showToast = useAppStore((s) => s.showToast);
  const [status, setStatus] = useState(initialStatus);
  const [text, setText] = useState(initialText);
  const [github, setGithub] = useState(initialGithub);
  const [files, setFiles] = useState(initialFiles);
  const [busy, setBusy] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  const rubricItems = Array.isArray(rubric) ? rubric : [];
  const locked = status === "SUBMITTED" || status === "GRADED";

  async function handleSaveDraft() {
    setBusy(true);
    const res = await saveAssignmentDraft(lessonId, enrollmentId, userId, {
      textResponse: text,
      githubUrl: github,
      filePaths: files.map((f) => ({
        fileName: f.fileName,
        filePath: f.filePath,
      })),
    });
    setBusy(false);
    if (res.success) showToast("Draft saved", "success");
    else showToast(res.error ?? "Failed to save", "error");
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files;
    if (!list?.length) return;
    setBusy(true);
    for (const file of Array.from(list)) {
      setUploadPct(0);
      const url = await uploadFile(file, setUploadPct);
      if (url) {
        setFiles((prev) => [
          ...prev,
          { id: url, fileName: file.name, filePath: url },
        ]);
      } else {
        showToast(`Failed to upload ${file.name}`, "error");
      }
    }
    setBusy(false);
    setUploadPct(0);
    e.target.value = "";
  }

  async function handleSubmit() {
    setBusy(true);
    await saveAssignmentDraft(lessonId, enrollmentId, userId, {
      textResponse: text,
      githubUrl: github,
      filePaths: files.map((f) => ({
        fileName: f.fileName,
        filePath: f.filePath,
      })),
    });
    const res = await submitAssignment(lessonId, enrollmentId, userId, courseId);
    setBusy(false);
    if (res.success) {
      setStatus("SUBMITTED");
      showToast("Assignment submitted!", "success");
      onSubmitted?.();
    } else {
      showToast(res.error ?? "Submit failed", "error");
    }
  }

  return (
    <Card className="max-w-2xl">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-semibold">{lessonTitle}</h2>
        <Badge variant={STATUS_LABEL[status] ?? "outline"}>
          {status.replace("_", " ").toLowerCase()}
        </Badge>
      </div>

      {dueAt && (
        <p className="text-xs text-gray-500 mb-3">
          Due: {new Date(dueAt).toLocaleString("en-TZ")}
        </p>
      )}

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 whitespace-pre-wrap">
        {instructions || "Follow the instructions and submit your work below."}
      </div>

      {rubricItems.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold mb-2">Rubric (max {maxScore} pts)</h4>
          <ul className="space-y-1 text-sm text-gray-600">
            {rubricItems.map((r, i) => (
              <li key={i} className="flex justify-between">
                <span>{r.label}</span>
                <span>{r.points} pts</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div
        className={`rounded-lg border-2 border-dashed p-6 text-center ${locked ? "opacity-60 pointer-events-none" : "border-gray-300 hover:border-brand"}`}
      >
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">PDF, ZIP, images, or documents (max 50 MB each)</p>
        <input type="file" multiple className="mt-3 text-sm" onChange={handleFileSelect} disabled={locked || busy} />
        {uploadPct > 0 && uploadPct < 100 && (
          <p className="mt-2 text-xs text-brand">Uploading… {uploadPct}%</p>
        )}
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1 text-sm">
          {files.map((f) => (
            <li key={f.id} className="flex justify-between rounded bg-gray-50 px-3 py-2">
              <a href={f.filePath} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline truncate">
                {f.fileName}
              </a>
              {!locked && (
                <button
                  type="button"
                  className="text-red-500 text-xs shrink-0 ml-2"
                  onClick={() => setFiles(files.filter((x) => x.id !== f.id))}
                >
                  Remove
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4">
        <Input
          label="GitHub repository (optional)"
          placeholder="https://github.com/username/repo"
          value={github}
          onChange={(e) => setGithub(e.target.value)}
          disabled={locked}
        />
      </div>

      <div className="mt-4">
        <Textarea
          label="Written response"
          className="h-28"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Describe your approach, findings, and how to run your project…"
          disabled={locked}
        />
      </div>

      {!locked && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleSaveDraft} disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save draft
          </Button>
          <Button onClick={handleSubmit} disabled={busy}>
            Submit assignment
          </Button>
        </div>
      )}

      {status === "GRADED" && initialScore != null && (
        <div className="mt-4 rounded-lg bg-green-50 p-4">
          <p className="font-semibold text-green-800 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Grade: {initialScore}/{maxScore}
          </p>
          {initialFeedback && (
            <p className="mt-2 text-sm text-green-700 whitespace-pre-wrap">{initialFeedback}</p>
          )}
        </div>
      )}

      {status === "REVISION_REQUESTED" && initialFeedback && (
        <div className="mt-4 rounded-lg bg-red-50 p-4">
          <p className="font-semibold text-red-800">Revision requested</p>
          <p className="mt-1 text-sm text-red-700 whitespace-pre-wrap">{initialFeedback}</p>
          <Button className="mt-3" size="sm" onClick={() => setStatus("DRAFT")}>
            Revise and resubmit
          </Button>
        </div>
      )}
    </Card>
  );
}
