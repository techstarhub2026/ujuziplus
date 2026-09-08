"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { deleteDiscussion } from "@/lib/actions/discussions";
import { useAppStore } from "@/store/appStore";

type Author = { id: string; fullName: string; email: string };
type Discussion = {
  id: string;
  title: string;
  body: string;
  channel: string;
  isPinned: boolean;
  isResolved: boolean;
  createdAt: Date;
  author: Author;
  course: { title: string } | null;
  _count: { replies: number; likes: number };
};

type Props = { discussions: Discussion[]; adminId: string };

export function DiscussionModerationPanel({ discussions, adminId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const showToast = useAppStore((s) => s.showToast);

  function handleDelete(id: string) {
    if (!confirm("Delete this discussion and all its replies?")) return;
    startTransition(async () => {
      const res = await deleteDiscussion(adminId, id);
      if (res.success) {
        showToast("Discussion deleted", "success");
        router.refresh();
      } else {
        showToast(res.error ?? "Failed", "error");
      }
    });
  }

  return (
    <Card>
      {discussions.length === 0 ? (
        <div className="py-14 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-gray-200 mb-2" />
          <p className="text-gray-400 text-sm">No discussions yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                <th className="pb-3 pr-4 font-medium">Discussion</th>
                <th className="pb-3 pr-4 font-medium">Channel</th>
                <th className="pb-3 pr-4 font-medium">Author</th>
                <th className="pb-3 pr-4 font-medium">Replies</th>
                <th className="pb-3 pr-4 font-medium">Date</th>
                <th className="pb-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {discussions.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 last:border-0">
                  <td className="py-3 pr-4">
                    <p className="font-medium line-clamp-1">{d.title}</p>
                    {d.course && (
                      <p className="text-xs text-gray-400">{d.course.title}</p>
                    )}
                    <div className="flex gap-1 mt-1">
                      {d.isPinned && <Badge variant="accent" className="text-[10px]">Pinned</Badge>}
                      {d.isResolved && <Badge variant="success" className="text-[10px]">Resolved</Badge>}
                    </div>
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant="outline" className="text-xs">{d.channel}</Badge>
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{d.author.fullName}</p>
                    <p className="text-xs text-gray-400">{d.author.email}</p>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">{d._count.replies}</td>
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">{formatDate(d.createdAt)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/dashboard/community/${d.channel}/${d.id}`} target="_blank">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(d.id)}
                        disabled={isPending}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
