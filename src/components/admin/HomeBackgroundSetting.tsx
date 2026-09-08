"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MediaUploadField } from "@/components/ui/MediaUploadField";
import { updateHomeSectionBackground, type HomeBackgroundMode } from "@/lib/actions/platform-settings";
import { useAppStore } from "@/store/appStore";
import { cn } from "@/lib/utils";

export function HomeBackgroundSetting({
  initialUrl,
  initialMode,
}: {
  initialUrl: string | null;
  initialMode: string;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();
  const [url, setUrl] = useState(initialUrl ?? "");
  const [mode, setMode] = useState<HomeBackgroundMode>(
    initialMode === "cover" ? "cover" : "tile"
  );

  const save = () => {
    startTransition(async () => {
      const res = await updateHomeSectionBackground(url.trim() || null, mode);
      if (res.success) {
        showToast("Homepage background updated", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  const clear = () => {
    setUrl("");
    startTransition(async () => {
      const res = await updateHomeSectionBackground(null);
      if (res.success) {
        showToast("Homepage background reset to default", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  };

  return (
    <div className="space-y-3">
      <MediaUploadField
        kind="image"
        label="Background image"
        hint="Shown behind the homepage from the mentor spotlight section down to the bottom. Leave empty for the default background."
        value={url}
        onChange={setUrl}
      />

      <div className="text-sm">
        <span className="font-medium">Display style</span>
        <div className="mt-1.5 flex gap-2">
          <button
            type="button"
            onClick={() => setMode("tile")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-left text-xs transition",
              mode === "tile" ? "border-brand bg-brand-light text-brand-dark" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <span className="block font-semibold">Tile</span>
            Repeats the image at its natural size. Best for patterns and textures.
          </button>
          <button
            type="button"
            onClick={() => setMode("cover")}
            className={cn(
              "flex-1 rounded-lg border px-3 py-2 text-left text-xs transition",
              mode === "cover" ? "border-brand bg-brand-light text-brand-dark" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <span className="block font-semibold">Cover</span>
            Stretches the image to fill the section. Best for photos.
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" disabled={isPending} onClick={save}>
          {isPending ? "Saving…" : "Save"}
        </Button>
        {initialUrl && (
          <Button size="sm" variant="ghost" disabled={isPending} onClick={clear}>
            Reset to default
          </Button>
        )}
      </div>
    </div>
  );
}
