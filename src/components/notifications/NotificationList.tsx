"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  MessageSquare,
  ThumbsUp,
  Award,
  Users,
  CheckCircle,
  ClipboardList,
  Info,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/utils";
import {
  markNotificationRead,
  markAllRead,
  deleteNotification,
} from "@/lib/actions/notifications";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string | null;
  isRead: boolean;
  createdAt: Date;
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  REPLY_ON_POST:     <MessageSquare className="h-4 w-4 text-blue-500" />,
  LIKE_ON_POST:      <ThumbsUp className="h-4 w-4 text-pink-500" />,
  NEW_ENROLLMENT:    <Users className="h-4 w-4 text-green-500" />,
  COURSE_COMPLETE:   <CheckCircle className="h-4 w-4 text-green-600" />,
  CERTIFICATE_ISSUED:<Award className="h-4 w-4 text-yellow-500" />,
  ASSIGNMENT_SUBMITTED: <ClipboardList className="h-4 w-4 text-orange-500" />,
  ASSIGNMENT_GRADED: <CheckCircle className="h-4 w-4 text-green-600" />,
  ASSIGNMENT_REVISION_REQUESTED: <MessageSquare className="h-4 w-4 text-amber-500" />,
  SYSTEM:            <Info className="h-4 w-4 text-gray-400" />,
};

export function NotificationList({
  notifications: initial,
  userId,
}: {
  notifications: Notification[];
  userId: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [markingAll, startMarkAll] = useTransition();

  const unread = items.filter((n) => !n.isRead).length;

  async function handleRead(id: string) {
    await markNotificationRead(userId, id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  }

  async function handleDelete(id: string) {
    await deleteNotification(userId, id);
    setItems((prev) => prev.filter((n) => n.id !== id));
  }

  function handleMarkAll() {
    startMarkAll(async () => {
      await markAllRead(userId);
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        variant="compact"
        icon={<Bell className="h-8 w-8 text-brand" />}
        title="All caught up!"
        description="No notifications yet — we'll let you know when something happens."
      />
    );
  }

  return (
    <div>
      {unread > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{unread}</span> unread
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkAll}
            disabled={markingAll}
          >
            <CheckCheck className="h-3.5 w-3.5 mr-1.5" />Mark all as read
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {items.map((n) => {
          const icon = TYPE_ICON[n.type] ?? <Bell className="h-4 w-4 text-gray-400" />;
          const content = (
            <div
              className={`list-item-card ${n.isRead ? "list-item-card--read" : "list-item-card--unread"}`}
            >
              <div className="mt-0.5 shrink-0 rounded-xl bg-white p-2.5 shadow-soft ring-1 ring-gray-100">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.isRead ? "text-gray-700" : "font-semibold text-gray-900"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDate(n.createdAt)}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!n.isRead && (
                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); handleRead(n.id); }}
                    className="rounded p-1 text-gray-400 hover:text-brand hover:bg-orange-100 transition"
                    title="Mark as read"
                  >
                    <CheckCircle className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => { e.preventDefault(); handleDelete(n.id); }}
                  className="rounded p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );

          return n.href ? (
            <Link key={n.id} href={n.href} onClick={() => { if (!n.isRead) handleRead(n.id); }}>
              {content}
            </Link>
          ) : (
            <div key={n.id}>{content}</div>
          );
        })}
      </div>
    </div>
  );
}
