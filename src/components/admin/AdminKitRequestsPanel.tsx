"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrgKitRequestStatus } from "@prisma/client";
import { ExternalLink } from "lucide-react";

type RequestRow = {
  id: string;
  quantity: number;
  status: OrgKitRequestStatus;
  notes: string | null;
  createdAt: Date;
  org: { slug: string; name: string };
  kit: { slug: string; title: string };
  requester: { fullName: string; email: string };
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "outline" | "error"> = {
  PENDING: "warning",
  APPROVED: "outline",
  FULFILLED: "success",
  REJECTED: "error",
};

export function AdminKitRequestsPanel({ requests }: { requests: RequestRow[] }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Organization kit requests</h1>
      <p className="text-sm text-gray-500 mb-6">
        Read-only oversight. Org admins approve, reject, and fulfill requests in their org portal.
      </p>

      {requests.length === 0 ? (
        <Card className="py-12 text-center text-sm text-gray-400">No requests yet.</Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="p-4 flex flex-wrap justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{req.kit.title}</h3>
                  <Badge variant={STATUS_VARIANT[req.status] ?? "outline"}>
                    {req.status.toLowerCase()}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  <Link href={`/org/${req.org.slug}/kits`} className="text-brand hover:underline">
                    {req.org.name}
                  </Link>
                  {" · "}
                  {req.quantity} units · {req.requester.fullName} ({req.requester.email})
                </p>
                {req.notes && <p className="text-sm text-gray-600 mt-1">{req.notes}</p>}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(req.createdAt).toLocaleString("en-TZ")}
                </p>
              </div>
              <Button asChild variant="outline" size="sm" className="shrink-0">
                <Link href={`/org/${req.org.slug}/kits`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Org portal
                </Link>
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
