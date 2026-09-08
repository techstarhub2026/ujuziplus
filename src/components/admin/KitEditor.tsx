"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { KIT_CATEGORIES } from "@/data/mock/kits";
import {
  useKitStore,
  createEmptyComponent,
  createEmptyMaterial,
  createEmptyGalleryImage,
} from "@/store/kitStore";
import { useAppStore } from "@/store/appStore";
import type { Kit, KitMaterialType, KitStatus } from "@/types/app";
import { Trash2, Plus, GripVertical } from "lucide-react";
import { ImageUploadField } from "@/components/ui/ImageUploadField";
import { courses } from "@/data/mock";

const EDITOR_TABS = [
  "Basic info",
  "Media gallery",
  "Components (BOM)",
  "Learning materials",
  "Outcomes & projects",
] as const;

const MATERIAL_TYPES: KitMaterialType[] = ["guide", "video", "pdf", "worksheet", "project"];

const emptyKit = (): Omit<Kit, "id" | "createdAt" | "updatedAt"> => ({
  slug: "",
  title: "",
  subtitle: "",
  description: "",
  thumbnailUrl: "",
  gallery: [],
  category: KIT_CATEGORIES[0],
  difficulty: "beginner",
  ageRange: "12–18",
  price: 0,
  isFree: false,
  status: "draft",
  components: [],
  materials: [],
  learningOutcomes: [""],
  projectIdeas: [""],
  relatedCourseSlugs: [],
  inventoryCount: 0,
});

export function KitEditor({ kitId, mode = "create" }: { kitId?: string; mode?: "create" | "edit" }) {
  const router = useRouter();
  const existing = useKitStore((s) => (kitId ? s.getKitById(kitId) : undefined));
  const addKit = useKitStore((s) => s.addKit);
  const updateKit = useKitStore((s) => s.updateKit);

  const [tab, setTab] = useState(0);
  const [form, setForm] = useState<Omit<Kit, "id" | "createdAt" | "updatedAt">>(
    existing ?? emptyKit()
  );

  const toast = useAppStore((s) => s.showToast);

  const patch = (p: Partial<typeof form>) => setForm((f) => ({ ...f, ...p }));

  const handleSave = (publish?: boolean) => {
    if (!form.title.trim()) {
      toast("Kit title is required", "error");
      return;
    }
    const payload = {
      ...form,
      status: (publish ? "published" : form.status) as KitStatus,
      thumbnailUrl:
        form.thumbnailUrl ||
        form.gallery.find((g) => g.isPrimary)?.url ||
        form.gallery[0]?.url ||
        "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop",
    };
    if (mode === "edit" && kitId) {
      updateKit(kitId, payload);
      toast(publish ? "Kit published" : "Kit saved", "success");
    } else {
      const id = addKit(payload);
      toast(publish ? "Kit created and published" : "Kit created as draft", "success");
      router.push(`/admin/kits/${id}/edit`);
      return;
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/kits">← All kits</Link>
      </Button>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{mode === "edit" ? "Edit kit" : "Create learning kit"}</h1>
          <p className="text-sm text-gray-500">Hardware BOM, educational materials, and gallery images</p>
        </div>
        <Badge variant={form.status === "published" ? "success" : "warning"}>{form.status}</Badge>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {EDITOR_TABS.map((label, i) => (
          <button
            key={label}
            type="button"
            onClick={() => setTab(i)}
            className={`shrink-0 rounded-lg px-4 py-2 text-sm font-medium ${
              tab === i ? "bg-brand text-white" : "border bg-white text-gray-600"
            }`}
          >
            {i + 1}. {label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {tab === 0 && (
          <Card className="space-y-4">
            <Input label="Kit title" value={form.title} onChange={(e) => patch({ title: e.target.value })} />
            <Input label="Subtitle" value={form.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} />
            <Textarea
              label="Description"
              className="h-28"
              value={form.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  className="mt-1 w-full rounded-lg border border-gray-300 p-2.5 text-sm"
                  value={form.category}
                  onChange={(e) => patch({ category: e.target.value })}
                >
                  {KIT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Input label="Age range" value={form.ageRange} onChange={(e) => patch({ ageRange: e.target.value })} />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <select
                  className="mt-1 w-full rounded-lg border p-2.5 text-sm"
                  value={form.difficulty}
                  onChange={(e) => patch({ difficulty: e.target.value as Kit["difficulty"] })}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <Input
                label="Price (TZS)"
                type="number"
                value={form.price}
                onChange={(e) => patch({ price: Number(e.target.value), isFree: Number(e.target.value) === 0 })}
              />
              <Input
                label="Inventory count"
                type="number"
                value={form.inventoryCount}
                onChange={(e) => patch({ inventoryCount: Number(e.target.value) })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isFree}
                onChange={(e) => patch({ isFree: e.target.checked, price: e.target.checked ? 0 : form.price })}
              />
              Free kit (school / grant program)
            </label>
            <ImageUploadField
              label="Thumbnail"
              value={form.thumbnailUrl}
              onChange={(url) => patch({ thumbnailUrl: url })}
              hint="Primary card image · Backend: POST /functions/v1/media/upload-ticket"
            />
          </Card>
        )}

        {tab === 1 && (
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Gallery images</h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => patch({ gallery: [...form.gallery, createEmptyGalleryImage()] })}
              >
                <Plus className="h-4 w-4" /> Add image
              </Button>
            </div>
            {form.gallery.length === 0 && (
              <p className="text-sm text-gray-500">Add product photos, unboxing shots, and wiring diagrams.</p>
            )}
            {form.gallery.map((img, idx) => (
              <div key={img.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-xs font-medium text-gray-500">Image {idx + 1}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => patch({ gallery: form.gallery.filter((g) => g.id !== img.id) })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <ImageUploadField
                  label="Photo"
                  value={img.url}
                  onChange={(url) =>
                    patch({
                      gallery: form.gallery.map((g) => (g.id === img.id ? { ...g, url } : g)),
                    })
                  }
                />
                <Input
                  label="Caption"
                  value={img.caption}
                  onChange={(e) =>
                    patch({
                      gallery: form.gallery.map((g) => (g.id === img.id ? { ...g, caption: e.target.value } : g)),
                    })
                  }
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="primary"
                    checked={!!img.isPrimary}
                    onChange={() =>
                      patch({
                        gallery: form.gallery.map((g) => ({ ...g, isPrimary: g.id === img.id })),
                        thumbnailUrl: img.url || form.thumbnailUrl,
                      })
                    }
                  />
                  Use as primary / thumbnail
                </label>
              </div>
            ))}
          </Card>
        )}

        {tab === 2 && (
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Bill of materials</h2>
              <Button
                size="sm"
                onClick={() => patch({ components: [...form.components, createEmptyComponent()] })}
              >
                <Plus className="h-4 w-4" /> Add component
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="py-2 w-8"></th>
                    <th>Component</th>
                    <th className="w-20">Qty</th>
                    <th>Notes</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {form.components.map((c) => (
                    <tr key={c.id} className="border-b">
                      <td className="py-2 text-gray-300">
                        <GripVertical className="h-4 w-4" />
                      </td>
                      <td>
                        <input
                          className="w-full rounded border px-2 py-1"
                          aria-label="Component name"
                          value={c.name}
                          placeholder="Arduino Uno"
                          onChange={(e) =>
                            patch({
                              components: form.components.map((x) =>
                                x.id === c.id ? { ...x, name: e.target.value } : x
                              ),
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          className="w-full rounded border px-2 py-1"
                          aria-label="Quantity"
                          value={c.quantity}
                          onChange={(e) =>
                            patch({
                              components: form.components.map((x) =>
                                x.id === c.id ? { ...x, quantity: Number(e.target.value) } : x
                              ),
                            })
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="w-full rounded border px-2 py-1"
                          aria-label="Notes"
                          value={c.description ?? ""}
                          onChange={(e) =>
                            patch({
                              components: form.components.map((x) =>
                                x.id === c.id ? { ...x, description: e.target.value } : x
                              ),
                            })
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => patch({ components: form.components.filter((x) => x.id !== c.id) })}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {tab === 3 && (
          <Card className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Educational content</h2>
              <Button
                size="sm"
                onClick={() =>
                  patch({
                    materials: [
                      ...form.materials,
                      { ...createEmptyMaterial(), order: form.materials.length + 1 },
                    ],
                  })
                }
              >
                <Plus className="h-4 w-4" /> Add material
              </Button>
            </div>
            {form.materials.map((m) => (
              <div key={m.id} className="rounded-lg border p-4 space-y-2">
                <div className="flex justify-between">
                  <Badge variant="outline">{m.type}</Badge>
                  <button type="button" onClick={() => patch({ materials: form.materials.filter((x) => x.id !== m.id) })}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    label="Title"
                    value={m.title}
                    onChange={(e) =>
                      patch({
                        materials: form.materials.map((x) =>
                          x.id === m.id ? { ...x, title: e.target.value } : x
                        ),
                      })
                    }
                  />
                  <div>
                    <label className="text-sm font-medium">Type</label>
                    <select
                      className="mt-1 w-full rounded-lg border p-2.5 text-sm"
                      value={m.type}
                      onChange={(e) =>
                        patch({
                          materials: form.materials.map((x) =>
                            x.id === m.id ? { ...x, type: e.target.value as KitMaterialType } : x
                          ),
                        })
                      }
                    >
                      {MATERIAL_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <Textarea
                  label="Description"
                  className="min-h-0"
                  rows={2}
                  placeholder="Description for learners..."
                  value={m.description}
                  onChange={(e) =>
                    patch({
                      materials: form.materials.map((x) =>
                        x.id === m.id ? { ...x, description: e.target.value } : x
                      ),
                    })
                  }
                />
                <Input
                  label="Resource URL (video, PDF, external link)"
                  value={m.url ?? ""}
                  onChange={(e) =>
                    patch({
                      materials: form.materials.map((x) =>
                        x.id === m.id ? { ...x, url: e.target.value } : x
                      ),
                    })
                  }
                />
              </div>
            ))}
          </Card>
        )}

        {tab === 4 && (
          <Card className="space-y-4">
            <h2 className="font-semibold">Learning outcomes</h2>
            {form.learningOutcomes.map((o, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={o}
                  onChange={(e) => {
                    const next = [...form.learningOutcomes];
                    next[i] = e.target.value;
                    patch({ learningOutcomes: next });
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => patch({ learningOutcomes: form.learningOutcomes.filter((_, j) => j !== i) })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => patch({ learningOutcomes: [...form.learningOutcomes, ""] })}>
              Add outcome
            </Button>

            <h2 className="font-semibold pt-4">Project ideas</h2>
            {form.projectIdeas.map((p, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  value={p}
                  onChange={(e) => {
                    const next = [...form.projectIdeas];
                    next[i] = e.target.value;
                    patch({ projectIdeas: next });
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => patch({ projectIdeas: form.projectIdeas.filter((_, j) => j !== i) })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button size="sm" variant="outline" onClick={() => patch({ projectIdeas: [...form.projectIdeas, ""] })}>
              Add project idea
            </Button>

            <div className="border-t pt-4">
              <h2 className="font-semibold mb-1">Related courses</h2>
              <p className="text-sm text-gray-500 mb-3">Courses that use this kit in labs (bidirectional link with course builder).</p>
              <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border p-3">
                {courses.map((c) => (
                  <label key={c.id} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={form.relatedCourseSlugs?.includes(c.slug) ?? false}
                      onChange={(e) => {
                        const current = form.relatedCourseSlugs ?? [];
                        patch({
                          relatedCourseSlugs: e.target.checked
                            ? [...current, c.slug]
                            : current.filter((s) => s !== c.slug),
                        });
                      }}
                    />
                    {c.title}
                  </label>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => handleSave()}>Save draft</Button>
        <Button variant="success" onClick={() => handleSave(true)}>
          {mode === "edit" ? "Publish kit" : "Create & publish"}
        </Button>
        {mode === "edit" && kitId && (
          <Button asChild variant="outline">
            <Link href={`/kits/${form.slug}`} target="_blank">
              Preview public page
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
