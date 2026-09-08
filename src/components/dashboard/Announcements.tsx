"use client";

import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Megaphone } from "lucide-react";

const ANNOUNCEMENTS = [
  {
    id: "a1",
    title: "Dar es Salaam Hackathon registration open",
    body: "Early bird ends June 1 — join 200+ innovators.",
    href: "/competitions/dar-hackathon-2026",
    tag: "Competition",
  },
  {
    id: "a3",
    title: "Platform maintenance — May 28",
    body: "Brief downtime 02:00–04:00 EAT.",
    href: "/dashboard/notifications",
    tag: "System",
  },
];

export function Announcements() {
  return (
    <Card>
      <CardTitle className="mb-4 flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-brand" />
        Announcements
      </CardTitle>
      <ul className="space-y-3">
        {ANNOUNCEMENTS.map((a) => (
          <li key={a.id}>
            <Link href={a.href} className="block rounded-lg bg-gray-50 px-3 py-2 hover:bg-brand-light transition-colors">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-gray-900">{a.title}</span>
                <Badge variant="outline" className="shrink-0 text-[10px]">
                  {a.tag}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-gray-500">{a.body}</p>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
