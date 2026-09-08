"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { MediaUploadField } from "@/components/ui/MediaUploadField";
import { submitShowcaseProject } from "@/lib/actions/showcase";
import { cn } from "@/lib/utils";

const TRACKS = [
  "Robotics", "IoT & Sensors", "AI & Machine Learning", "Web Development",
  "Mobile Development", "Data Science", "Electronics", "3D Design & Printing",
  "Entrepreneurship", "Other",
];

const COMMON_TECH = [
  "Arduino", "Raspberry Pi", "Python", "JavaScript", "TypeScript", "React",
  "Node.js", "TensorFlow", "Flutter", "C++", "ESP32", "MQTT", "Firebase",
  "MySQL", "MongoDB", "Figma", "SolidWorks", "KiCad",
];

export function ShowcaseSubmitForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [track, setTrack] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function addTech(tech: string) {
    const t = tech.trim();
    if (t && !techStack.includes(t)) setTechStack((prev) => [...prev, t]);
    setTechInput("");
  }

  function removeTech(tech: string) {
    setTechStack((prev) => prev.filter((t) => t !== tech));
  }

  async function handleSubmit() {
    if (!title.trim()) { setError("Project title is required."); return; }
    if (description.trim().length < 30) { setError("Description must be at least 30 characters — tell the story of your project."); return; }
    setSaving(true);
    setError("");
    const res = await submitShowcaseProject({
      title, tagline, description, thumbnailUrl, demoUrl, repoUrl, videoUrl, techStack, track,
    });
    setSaving(false);
    if (!res.success) { setError(res.error ?? "Failed to submit."); return; }
    setDone(true);
  }

  if (done) {
    return (
      <Card className="flex flex-col items-center gap-4 px-8 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="font-display font-semibold text-xl">Project submitted!</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Our team will review your project within 48 hours. Once approved it will appear in the public Innovation Showcase.
        </p>
        <div className="flex gap-3 mt-2">
          <Button onClick={() => router.push("/dashboard/showcase/submit")} variant="outline">
            Submit another
          </Button>
          <Button onClick={() => router.push("/showcase")}>
            View showcase
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="space-y-6 p-6">
      {/* Basic info */}
      <div className="space-y-4">
        <Input
          label="Project title *"
          value={title}
          placeholder="e.g. Smart Irrigation System with IoT Sensors"
          onChange={(e) => setTitle(e.target.value)}
        />

        <Input
          label="One-line tagline"
          value={tagline}
          placeholder="e.g. Saves 40% water by automating farm irrigation with ESP32"
          onChange={(e) => setTagline(e.target.value)}
        />

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label className="text-sm font-medium text-gray-700">Project description *</label>
            <span className={cn("text-xs", description.length < 30 ? "text-amber-500" : "text-gray-400")}>
              {description.length} chars
            </span>
          </div>
          <textarea
            className="w-full rounded-xl border border-gray-200 p-3 text-sm h-36 focus:ring-2 focus:ring-brand/20 focus:border-brand/40 focus:outline-none resize-none"
            value={description}
            placeholder="Tell the story: What problem does this solve? How did you build it? What did you learn? What impact does it have or could it have?"
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Track */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">Track / category</label>
        <div className="flex flex-wrap gap-2">
          {TRACKS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTrack(track === t ? "" : t)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition",
                track === t
                  ? "border-brand bg-brand text-white"
                  : "border-gray-200 text-gray-600 hover:border-brand/50 hover:text-brand"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnail */}
      <MediaUploadField
        kind="image"
        label="Project thumbnail"
        value={thumbnailUrl}
        onChange={setThumbnailUrl}
        hint="A photo or screenshot of your project — 1280×720 px recommended"
      />

      {/* Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Demo / live URL"
          type="url"
          value={demoUrl}
          placeholder="https://your-project.com"
          onChange={(e) => setDemoUrl(e.target.value)}
        />
        <Input
          label="Source code (GitHub)"
          type="url"
          value={repoUrl}
          placeholder="https://github.com/you/project"
          onChange={(e) => setRepoUrl(e.target.value)}
        />
      </div>

      <Input
        label="Demo video URL (YouTube / Loom)"
        type="url"
        value={videoUrl}
        placeholder="https://youtube.com/watch?v=..."
        onChange={(e) => setVideoUrl(e.target.value)}
      />

      {/* Tech stack */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Technologies used</label>

        {/* Quick-add chips */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          {COMMON_TECH.filter((t) => !techStack.includes(t)).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => addTech(t)}
              className="rounded border border-dashed border-gray-200 px-2 py-0.5 text-[11px] text-gray-500 hover:border-brand/50 hover:text-brand transition"
            >
              + {t}
            </button>
          ))}
        </div>

        {/* Manual input */}
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:ring-2 focus:ring-brand/20 focus:outline-none"
            value={techInput}
            placeholder="Add another technology…"
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTech(techInput); } }}
          />
          <Button size="sm" variant="outline" onClick={() => addTech(techInput)} disabled={!techInput.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Selected tags */}
        {techStack.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {techStack.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-medium text-brand">
                {t}
                <button type="button" onClick={() => removeTech(t)} className="text-brand/60 hover:text-brand">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</> : "Submit for review →"}
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        By submitting you agree that your project may be featured on the UjuziPlus Lab platform and shared with mentors and industry partners.
      </p>
    </Card>
  );
}
