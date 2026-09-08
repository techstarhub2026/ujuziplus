/**
 * /admin/users/[userId] — user detail from DB
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { getAdminUserDetail } from "@/lib/actions/admin";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AdminUserActions } from "@/components/admin/AdminUserActions";

export default async function AdminUserDetailPage({
  params,
}: {
  params: { userId: string };
}) {
  const user = await getAdminUserDetail(params.userId);
  if (!user) notFound();

  return (
    <div>
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/admin/users">← Users</Link>
      </Button>

      <div className="flex items-start gap-4 flex-wrap">
        <Avatar src={user.avatarUrl ?? undefined} alt={user.fullName} size="lg" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.fullName}</h1>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-400">@{user.username}</p>
          <div className="mt-2 flex gap-2 flex-wrap">
            <Badge variant="outline">{user.role}</Badge>
            <Badge variant={user.isActive ? "success" : "error"}>
              {user.isActive ? "Active" : "Suspended"}
            </Badge>
            <span className="text-xs text-gray-400">
              Joined {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-gray-500">Enrollments</p>
          <p className="text-xl font-bold">{user._count.enrollments}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Orders</p>
          <p className="text-xl font-bold">{user._count.orders}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Courses taught</p>
          <p className="text-xl font-bold">{user._count.courses}</p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <h3 className="font-semibold mb-3">Recent enrollments</h3>
          {user.enrollments.length === 0 ? (
            <p className="text-sm text-gray-400">No enrollments.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {user.enrollments.map((e) => (
                <li key={e.id} className="flex justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <Link href={`/courses/${e.course.slug}`} className="hover:text-brand">
                    {e.course.title}
                  </Link>
                  <span className="text-gray-400">{e.progress.length} lessons done</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h3 className="font-semibold mb-3">Recent orders</h3>
          {user.orders.length === 0 ? (
            <p className="text-sm text-gray-400">No orders.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {user.orders.map((o) => (
                <li key={o.id} className="rounded-lg bg-gray-50 px-3 py-2">
                  <div className="flex justify-between">
                    <span>{formatCurrency(Number(o.total))}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {o.status.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatDate(o.createdAt)} ·{" "}
                    {o.items.map((i) => i.course?.title ?? i.kit?.title ?? "Item").join(", ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <AdminUserActions
        userId={user.id}
        currentRole={user.role}
        isActive={user.isActive}
      />
    </div>
  );
}
