import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OrgKitInventoryItem, OrgKitRequest } from "@/types/app";

const initialInventory: OrgKitInventoryItem[] = [
  {
    id: "inv-1",
    orgSlug: "techstar-university",
    kitId: "kit-001",
    kitSlug: "arduino-starter-kit",
    kitTitle: "Arduino Starter Kit",
    quantityOnHand: 24,
    quantityAllocated: 18,
    reorderLevel: 10,
  },
  {
    id: "inv-2",
    orgSlug: "techstar-university",
    kitId: "kit-002",
    kitSlug: "iot-solution-box",
    kitTitle: "IoT Solution Box",
    quantityOnHand: 8,
    quantityAllocated: 6,
    reorderLevel: 5,
  },
];

const initialRequests: OrgKitRequest[] = [
  {
    id: "req-1",
    orgSlug: "techstar-university",
    kitId: "kit-003",
    kitSlug: "robotics-motor-lab",
    kitTitle: "Robotics Motor Lab",
    requestedBy: "Sarah Mwangi",
    quantity: 15,
    status: "pending",
    notes: "Semester 2 robotics class — 15 students",
    createdAt: "2026-05-20",
  },
  {
    id: "req-2",
    orgSlug: "techstar-university",
    kitId: "kit-001",
    kitSlug: "arduino-starter-kit",
    kitTitle: "Arduino Starter Kit",
    requestedBy: "James Okello",
    quantity: 30,
    status: "approved",
    createdAt: "2026-05-10",
  },
];

interface OrgKitState {
  inventory: OrgKitInventoryItem[];
  requests: OrgKitRequest[];
  getOrgInventory: (orgSlug: string) => OrgKitInventoryItem[];
  getOrgRequests: (orgSlug: string) => OrgKitRequest[];
  submitRequest: (req: Omit<OrgKitRequest, "id" | "createdAt" | "status">) => void;
  updateRequestStatus: (id: string, status: OrgKitRequest["status"]) => void;
  adjustInventory: (id: string, patch: Partial<OrgKitInventoryItem>) => void;
}

export const useOrgKitStore = create<OrgKitState>()(
  persist(
    (set, get) => ({
      inventory: initialInventory,
      requests: initialRequests,

      getOrgInventory: (orgSlug) => get().inventory.filter((i) => i.orgSlug === orgSlug),

      getOrgRequests: (orgSlug) => get().requests.filter((r) => r.orgSlug === orgSlug),

      submitRequest: (input) => {
        const req: OrgKitRequest = {
          ...input,
          id: `req-${Date.now()}`,
          status: "pending",
          createdAt: new Date().toISOString().slice(0, 10),
        };
        set((s) => ({ requests: [...s.requests, req] }));
      },

      updateRequestStatus: (id, status) => {
        set((s) => ({
          requests: s.requests.map((r) => (r.id === id ? { ...r, status } : r)),
        }));
      },

      adjustInventory: (id, patch) => {
        set((s) => ({
          inventory: s.inventory.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        }));
      },
    }),
    { name: "ujuzi-org-kits" }
  )
);
