"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  updateOrgKitRequestStatus,
  adjustOrgKitInventory,
  removeOrgKitInventory,
} from "@/lib/actions/org-kits";
import { useAppStore } from "@/store/appStore";
import type { OrgKitRequestStatus } from "@prisma/client";
import { Package, ClipboardList } from "lucide-react";

type InventoryRow = {
  id: string;
  quantityOnHand: number;
  quantityAllocated: number;
  reorderLevel: number;
  kit: { slug: string; title: string; thumbnailUrl: string | null };
};

type RequestRow = {
  id: string;
  quantity: number;
  status: OrgKitRequestStatus;
  notes: string | null;
  createdAt: Date;
  kit: { slug: string; title: string };
  requester: { fullName: string; email: string };
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline" | "error"> = {
  PENDING: "warning",
  APPROVED: "outline",
  FULFILLED: "success",
  REJECTED: "error",
};

export function OrgKitsPanel({
  orgSlug,
  userId,
  isOrgAdmin,
  inventory,
  requests,
}: {
  orgSlug: string;
  userId: string;
  isOrgAdmin: boolean;
  inventory: InventoryRow[];
  requests: RequestRow[];
}) {
  const router = useRouter();
  const showToast = useAppStore((s) => s.showToast);
  const [tab, setTab] = useState<"inventory" | "requests">("inventory");
  const [isPending, startTransition] = useTransition();

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  const setStatus = (requestId: string, status: OrgKitRequestStatus) => {
    startTransition(async () => {
      const res = await updateOrgKitRequestStatus(orgSlug, requestId, status, userId);
      if (res.success) {
        showToast(`Request ${status.toLowerCase()}`, "success");
        router.refresh();
      } else showToast(res.error ?? "Failed", "error");
    });
  };

  const removeInventoryItem = (item: InventoryRow) => {
    if (!confirm(`Remove "${item.kit.title}" from inventory? This cannot be undone.`)) return;
    startTransition(async () => {
      const res = await removeOrgKitInventory(orgSlug, item.id, userId);
      if (res.success) {
        showToast("Removed from inventory", "success");
        router.refresh();
      } else showToast(res.error ?? "Failed", "error");
    });
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Learning Kits</h1>
          <p className="text-sm text-gray-500">
            Inventory on hand and procurement requests for your organization
          </p>
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab("inventory")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "inventory" ? "bg-brand text-white" : "border bg-white text-gray-600"
          }`}
        >
          <Package className="h-4 w-4" /> Inventory
        </button>
        <button
          type="button"
          onClick={() => setTab("requests")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
            tab === "requests" ? "bg-brand text-white" : "border bg-white text-gray-600"
          }`}
        >
          <ClipboardList className="h-4 w-4" /> Requests
          {pendingCount > 0 && <Badge variant="warning">{pendingCount}</Badge>}
        </button>
      </div>

      {tab === "inventory" && (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left text-gray-500">
                <th className="p-3">Kit</th>
                <th>On hand</th>
                <th>Allocated</th>
                <th>Available</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => {
                const available = item.quantityOnHand - item.quantityAllocated;
                const low = available <= item.reorderLevel;
                return (
                  <tr key={item.id} className="border-b">
                    <td className="p-3">
                      <Link href={`/kits/${item.kit.slug}`} className="font-medium hover:text-brand">
                        {item.kit.title}
                      </Link>
                    </td>
                    <td>{item.quantityOnHand}</td>
                    <td>{item.quantityAllocated}</td>
                    <td>
                      <span className={low ? "font-semibold text-amber-600" : ""}>{available}</span>
                      {low && (
                        <Badge variant="warning" className="ml-2">
                          Low
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {isOrgAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isPending}
                          onClick={() => {
                            const onHand = prompt("On hand", String(item.quantityOnHand));
                            const allocated = prompt("Allocated", String(item.quantityAllocated));
                            if (onHand === null) return;
                            startTransition(async () => {
                              const res = await adjustOrgKitInventory(
                                orgSlug,
                                item.id,
                                {
                                  quantityOnHand: parseInt(onHand, 10) || item.quantityOnHand,
                                  quantityAllocated:
                                    allocated !== null
                                      ? parseInt(allocated, 10)
                                      : item.quantityAllocated,
                                },
                                userId
                              );
                              if (res.success) router.refresh();
                              else showToast(res.error ?? "Failed", "error");
                            });
                          }}
                        >
                          Adjust
                        </Button>
                      )}
                      {isOrgAdmin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          disabled={isPending}
                          onClick={() => removeInventoryItem(item)}
                        >
                          Remove
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
          {inventory.length === 0 && (
            <p className="p-8 text-center text-gray-500">
              No kits in inventory yet. Submit a request to procure kits.
            </p>
          )}
        </Card>
      )}

      {tab === "requests" && (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{req.kit.title}</h3>
                  <Badge variant={STATUS_VARIANT[req.status] ?? "outline"}>
                    {req.status.toLowerCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">
                  {req.quantity} units · {req.requester.fullName} ·{" "}
                  {new Date(req.createdAt).toLocaleDateString("en-TZ")}
                </p>
                {req.notes && <p className="mt-1 text-sm text-gray-600">{req.notes}</p>}
              </div>
              {isOrgAdmin && req.status === "PENDING" && (
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" disabled={isPending} onClick={() => setStatus(req.id, "APPROVED")}>
                    Approve
                  </Button>
                  <Button size="sm" variant="ghost" disabled={isPending} onClick={() => setStatus(req.id, "REJECTED")}>
                    Reject
                  </Button>
                </div>
              )}
              {isOrgAdmin && req.status === "APPROVED" && (
                <Button size="sm" disabled={isPending} onClick={() => setStatus(req.id, "FULFILLED")}>
                  Mark fulfilled
                </Button>
              )}
            </Card>
          ))}
          {requests.length === 0 && (
            <Card className="p-8 text-center text-gray-500">No kit requests yet.</Card>
          )}
        </div>
      )}
    </div>
  );
}
