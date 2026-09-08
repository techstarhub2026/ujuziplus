import { create } from "zustand";
import { persist } from "zustand/middleware";
import { initialKits } from "@/data/mock/kits";
import type { Kit, KitComponent, KitGalleryImage, KitMaterial } from "@/types/app";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface KitState {
  kits: Kit[];
  getPublishedKits: () => Kit[];
  getKitBySlug: (slug: string) => Kit | undefined;
  getKitById: (id: string) => Kit | undefined;
  addKit: (kit: Omit<Kit, "id" | "slug" | "createdAt" | "updatedAt"> & { slug?: string }) => string;
  updateKit: (id: string, patch: Partial<Kit>) => void;
  deleteKit: (id: string) => void;
  duplicateKit: (id: string) => string;
}

export const useKitStore = create<KitState>()(
  persist(
    (set, get) => ({
      kits: initialKits,

      getPublishedKits: () => get().kits.filter((k) => k.status === "published"),

      getKitBySlug: (slug) => get().kits.find((k) => k.slug === slug),

      getKitById: (id) => get().kits.find((k) => k.id === id),

      addKit: (input) => {
        const id = `kit-${Date.now()}`;
        const slug = input.slug || slugify(input.title) || id;
        const now = new Date().toISOString().slice(0, 10);
        const kit: Kit = {
          ...input,
          id,
          slug,
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ kits: [...s.kits, kit] }));
        return id;
      },

      updateKit: (id, patch) => {
        set((s) => ({
          kits: s.kits.map((k) =>
            k.id === id ? { ...k, ...patch, updatedAt: new Date().toISOString().slice(0, 10) } : k
          ),
        }));
      },

      deleteKit: (id) => set((s) => ({ kits: s.kits.filter((k) => k.id !== id) })),

      duplicateKit: (id) => {
        const source = get().getKitById(id);
        if (!source) return "";
        const newId = get().addKit({
          ...source,
          title: `${source.title} (Copy)`,
          slug: `${source.slug}-copy-${Date.now()}`,
          status: "draft",
        });
        return newId;
      },
    }),
    { name: "ujuzi-kits" }
  )
);

export function createEmptyComponent(): KitComponent {
  return { id: `cmp-${Date.now()}`, name: "", quantity: 1, description: "" };
}

export function createEmptyMaterial(): KitMaterial {
  return {
    id: `mat-${Date.now()}`,
    title: "",
    type: "guide",
    description: "",
    order: 1,
  };
}

export function createEmptyGalleryImage(): KitGalleryImage {
  return {
    id: `img-${Date.now()}`,
    url: "",
    caption: "",
  };
}
