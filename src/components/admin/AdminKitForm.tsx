"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { useAppStore } from "@/store/appStore";
import {
  createKit,
  updateKit,
  deleteKit,
  type KitSaveInput,
} from "@/lib/actions/kits";
import type { KitDifficulty, KitMaterialType, KitStatus } from "@prisma/client";
import { Plus, Trash2 } from "lucide-react";

const CATEGORIES = ["Robotics", "Electronics", "IoT", "Coding", "STEM"];
const DIFFICULTIES: KitDifficulty[] = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];
const MATERIAL_TYPES: KitMaterialType[] = ["GUIDE", "VIDEO", "PDF", "WORKSHEET", "PROJECT"];
const STATUSES: KitStatus[] = ["DRAFT", "PUBLISHED", "ARCHIVED"];

type KitInitial = Awaited<ReturnType<typeof import("@/lib/actions/kits").getKitById>>;

function parseJsonList(val: unknown): string[] {
  if (Array.isArray(val)) return val.map(String);
  return [""];
}

function emptyForm(): KitSaveInput {
  return {
    title: "",
    subtitle: "",
    description: "",
    thumbnailUrl: "",
    category: CATEGORIES[0],
    difficulty: "BEGINNER",
    ageRange: "12–18",
    price: 0,
    isFree: false,
    status: "DRAFT",
    learningOutcomes: [""],
    projectIdeas: [""],
    relatedCourseSlugs: [],
    inventoryCount: 0,
    components: [],
    materials: [],
    gallery: [],
  };
}

function fromKit(kit: NonNullable<KitInitial>): KitSaveInput {
  return {
    title: kit.title,
    subtitle: kit.subtitle ?? "",
    description: kit.description ?? "",
    thumbnailUrl: kit.thumbnailUrl ?? "",
    category: kit.category ?? CATEGORIES[0],
    difficulty: kit.difficulty,
    ageRange: kit.ageRange ?? "",
    price: Number(kit.price ?? 0),
    isFree: kit.isFree,
    status: kit.status,
    learningOutcomes: parseJsonList(kit.learningOutcomes),
    projectIdeas: parseJsonList(kit.projectIdeas),
    relatedCourseSlugs: parseJsonList(kit.relatedCourseSlugs),
    inventoryCount: kit.inventoryCount,
    components: kit.components.map((c) => ({
      name: c.name,
      quantity: c.quantity,
      description: c.description ?? "",
      imageUrl: c.imageUrl ?? "",
    })),
    materials: kit.materials.map((m) => ({
      title: m.title,
      type: m.type,
      description: m.description ?? "",
      url: m.url ?? "",
      durationMinutes: m.durationMinutes ?? undefined,
    })),
    gallery: kit.gallery.map((g) => ({
      url: g.url,
      caption: g.caption ?? "",
      isPrimary: g.isPrimary,
    })),
  };
}

export function AdminKitForm({
  kitId,
  initialKit,
}: {
  kitId?: string;
  initialKit?: KitInitial;
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState<KitSaveInput>(
    initialKit ? fromKit(initialKit) : emptyForm()
  );

  const patch = (p: Partial<KitSaveInput>) => setForm((f) => ({ ...f, ...p }));

  const save = (publish?: boolean) => {
    if (!form.title.trim()) {
      showToast("Kit title is required", "error");
      return;
    }
    const payload: KitSaveInput = {
      ...form,
      status: publish ? "PUBLISHED" : form.status,
      thumbnailUrl:
        form.thumbnailUrl ||
        form.gallery.find((g) => g.isPrimary)?.url ||
        form.gallery[0]?.url ||
        "",
    };

    startTransition(async () => {
      if (kitId) {
        const res = await updateKit(kitId, payload);
        if (res.success) {
          showToast(publish ? "Kit published" : "Kit saved", "success");
          router.refresh();
        } else showToast(res.error ?? "Save failed", "error");
      } else {
        const res = await createKit(payload);
        if (res.success && res.data) {
          showToast(publish ? "Kit created and published" : "Kit created", "success");
          router.push(`/admin/kits/${res.data.kitId}/edit`);
        } else showToast(!res.success ? res.error : "Create failed", "error");
      }
    });
  };

  const handleDelete = () => {
    if (!kitId || !confirm("Delete this kit permanently?")) return;
    startTransition(async () => {
      const res = await deleteKit(kitId);
      if (res.success) {
        showToast("Kit deleted", "success");
        router.push("/admin/kits");
      } else showToast(res.error ?? "Delete failed", "error");
    });
  };

  const listField = (
    label: string,
    items: string[],
    key: "learningOutcomes" | "projectIdeas"
  ) => (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              patch({ [key]: next });
            }}
            placeholder={`${label} ${i + 1}`}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => patch({ [key]: items.filter((_, j) => j !== i) })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => patch({ [key]: [...items, ""] })}>
        <Plus className="h-3 w-3 mr-1" /> Add
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/kits">← All kits</Link>
      </Button>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{kitId ? "Edit kit" : "Create learning kit"}</h1>
          <p className="text-sm text-gray-500">Saved to MySQL — components, materials, gallery</p>
        </div>
        <Badge variant={form.status === "PUBLISHED" ? "success" : "warning"}>
          {form.status.toLowerCase()}
        </Badge>
      </div>

      <Card className="space-y-4 p-6 mb-6">
        <h2 className="font-semibold">Basic info</h2>
        <Input label="Title *" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
        <Input label="Subtitle" value={form.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
        <Textarea
          label="Description"
          className="min-h-[100px]"
          value={form.description}
          onChange={(e) => patch({ description: e.target.value })}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="font-medium">Category</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.category}
              onChange={(e) => patch({ category: e.target.value })}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="font-medium">Difficulty</span>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={form.difficulty}
              onChange={(e) => patch({ difficulty: e.target.value as KitDifficulty })}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>{d.toLowerCase()}</option>
              ))}
            </select>
          </label>
          <Input label="Age range" value={form.ageRange} onChange={(e) => patch({ ageRange: e.target.value })} />
          <Input
            label="Inventory"
            type="number"
            value={String(form.inventoryCount)}
            onChange={(e) => patch({ inventoryCount: parseInt(e.target.value, 10) || 0 })}
          />
        </div>
        <div className="flex flex-wrap gap-4 items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => patch({ isFree: e.target.checked, price: e.target.checked ? 0 : form.price })}
            />
            Free kit
          </label>
          {!form.isFree && (
            <Input
              label="Price (TZS)"
              type="number"
              value={String(form.price)}
              onChange={(e) => patch({ price: parseFloat(e.target.value) || 0 })}
              className="max-w-xs"
            />
          )}
          <label className="text-sm">
            <span className="font-medium">Status</span>
            <select
              className="mt-1 block rounded-lg border px-3 py-2"
              value={form.status}
              onChange={(e) => patch({ status: e.target.value as KitStatus })}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s.toLowerCase()}</option>
              ))}
            </select>
          </label>
        </div>
        <ImageUploadField
          label="Thumbnail"
          value={form.thumbnailUrl ?? ""}
          onChange={(url) => patch({ thumbnailUrl: url })}
        />
      </Card>

      <Card className="p-6 mb-6 space-y-3">
        <h2 className="font-semibold">Components (BOM)</h2>
        {form.components.map((c, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-4 border rounded-lg p-3">
            <Input
              placeholder="Name"
              value={c.name}
              onChange={(e) => {
                const next = [...form.components];
                next[i] = { ...c, name: e.target.value };
                patch({ components: next });
              }}
            />
            <Input
              type="number"
              placeholder="Qty"
              value={String(c.quantity)}
              onChange={(e) => {
                const next = [...form.components];
                next[i] = { ...c, quantity: parseInt(e.target.value, 10) || 1 };
                patch({ components: next });
              }}
            />
            <Input
              placeholder="Description"
              className="sm:col-span-2"
              value={c.description ?? ""}
              onChange={(e) => {
                const next = [...form.components];
                next[i] = { ...c, description: e.target.value };
                patch({ components: next });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="sm:col-span-4 justify-start"
              onClick={() => patch({ components: form.components.filter((_, j) => j !== i) })}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            patch({
              components: [...form.components, { name: "", quantity: 1, description: "" }],
            })
          }
        >
          <Plus className="h-3 w-3 mr-1" /> Add component
        </Button>
      </Card>

      <Card className="p-6 mb-6 space-y-3">
        <h2 className="font-semibold">Learning materials</h2>
        {form.materials.map((m, i) => (
          <div key={i} className="grid gap-2 sm:grid-cols-2 border rounded-lg p-3">
            <Input
              placeholder="Title"
              value={m.title}
              onChange={(e) => {
                const next = [...form.materials];
                next[i] = { ...m, title: e.target.value };
                patch({ materials: next });
              }}
            />
            <select
              className="rounded-lg border px-3 py-2 text-sm"
              value={m.type}
              onChange={(e) => {
                const next = [...form.materials];
                next[i] = { ...m, type: e.target.value as KitMaterialType };
                patch({ materials: next });
              }}
            >
              {MATERIAL_TYPES.map((t) => (
                <option key={t} value={t}>{t.toLowerCase()}</option>
              ))}
            </select>
            <Input
              placeholder="URL"
              className="sm:col-span-2"
              value={m.url ?? ""}
              onChange={(e) => {
                const next = [...form.materials];
                next[i] = { ...m, url: e.target.value };
                patch({ materials: next });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => patch({ materials: form.materials.filter((_, j) => j !== i) })}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            patch({
              materials: [...form.materials, { title: "", type: "GUIDE", url: "" }],
            })
          }
        >
          <Plus className="h-3 w-3 mr-1" /> Add material
        </Button>
      </Card>

      <Card className="p-6 mb-6 space-y-3">
        <h2 className="font-semibold">Gallery</h2>
        {form.gallery.map((g, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1">
              <ImageUploadField
                label={`Image ${i + 1}`}
                value={g.url}
                onChange={(url) => {
                  const next = [...form.gallery];
                  next[i] = { ...g, url };
                  patch({ gallery: next });
                }}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => patch({ gallery: form.gallery.filter((_, j) => j !== i) })}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => patch({ gallery: [...form.gallery, { url: "", isPrimary: form.gallery.length === 0 }] })}
        >
          <Plus className="h-3 w-3 mr-1" /> Add image
        </Button>
      </Card>

      <Card className="p-6 mb-6 space-y-6">
        {listField("Learning outcomes", form.learningOutcomes, "learningOutcomes")}
        {listField("Project ideas", form.projectIdeas, "projectIdeas")}
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button disabled={isPending} onClick={() => save()}>
          Save draft
        </Button>
        <Button variant="primary" disabled={isPending} onClick={() => save(true)}>
          Save & publish
        </Button>
        {kitId && (
          <Button variant="outline" className="text-red-600 ml-auto" disabled={isPending} onClick={handleDelete}>
            Delete kit
          </Button>
        )}
      </div>
    </div>
  );
}
