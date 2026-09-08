"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { createProject } from "@/lib/actions/projects";
import { useAppStore } from "@/store/appStore";
import type { ProjectStatus } from "@prisma/client";

const STEPS = ["Basic Info", "Team & Impact", "Links & Media", "Publish"];

export function SubmitProjectForm({ userId }: { userId: string }) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [objectives, setObjectives] = useState("");
  const [teamMembers, setTeamMembers] = useState("");
  const [documentation, setDocumentation] = useState("");
  const [impact, setImpact] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("PROTOTYPE");

  const publish = () => {
    startTransition(async () => {
      const res = await createProject(userId, {
        title,
        description,
        category,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        status,
        githubUrl: githubUrl || undefined,
        demoUrl: demoUrl || undefined,
        thumbnailUrl: thumbnailUrl || undefined,
        objectives: objectives || undefined,
        documentation: documentation || undefined,
        impact: impact || undefined,
        teamMembers: teamMembers
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .map((name) => ({ name, role: "CONTRIBUTOR" as const })),
      });
      if (res.success) {
        showToast("Project published!", "success");
        router.push(`/projects/${res.data.slug}`);
      } else showToast(res.error ?? "Failed", "error");
    });
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Submit Project"
        breadcrumbs={[{ label: "Projects", href: "/dashboard/projects" }, { label: "New" }]}
      />
      <div className="mb-6 flex gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded ${i <= step ? "bg-brand" : "bg-gray-200"}`} />
        ))}
      </div>
      <Card className="p-4">
        {step === 0 && (
          <div className="space-y-4">
            <Input label="Project title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <Textarea
              label="Description"
              className="h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <Input
              label="Category"
              placeholder="IoT, AI, Robotics..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              label="Tags (comma-separated)"
              placeholder="ESP32, Agriculture"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <Textarea
              label="Objectives (optional)"
              placeholder="What problem is this project solving, and what does success look like?"
              className="h-24"
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
            />
            <Input
              label="Team members (comma-separated, optional)"
              placeholder="Amina Mwakyusa, James Okello"
              value={teamMembers}
              onChange={(e) => setTeamMembers(e.target.value)}
            />
            <Textarea
              label="Documentation (optional)"
              placeholder="Build notes, wiring details, or a link to fuller documentation"
              className="h-24"
              value={documentation}
              onChange={(e) => setDocumentation(e.target.value)}
            />
            <Textarea
              label="Impact assessment (optional)"
              placeholder="Who has this helped so far, and how do you know?"
              className="h-24"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
            />
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <Input label="GitHub URL" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} />
            <Input label="Demo URL" value={demoUrl} onChange={(e) => setDemoUrl(e.target.value)} />
            <ImageUploadField label="Thumbnail" value={thumbnailUrl} onChange={setThumbnailUrl} />
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="font-medium">Project stage</span>
              <select
                className="mt-1 block w-full rounded-lg border px-3 py-2"
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              >
                <option value="IDEA">Idea</option>
                <option value="PROTOTYPE">Prototype</option>
                <option value="MVP">MVP</option>
                <option value="LAUNCHED">Launched</option>
              </select>
            </label>
            <p className="text-sm text-gray-500">
              Your project will appear on the public innovation showcase immediately.
            </p>
          </div>
        )}
        <div className="mt-6 flex justify-between">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>
            Back
          </Button>
          {step < STEPS.length - 1 ? (
            <Button
              disabled={step === 0 && (!title.trim() || !description.trim())}
              onClick={() => setStep(step + 1)}
            >
              Next
            </Button>
          ) : (
            <Button disabled={isPending} onClick={publish}>
              Publish project
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
