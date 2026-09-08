import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { getAdminMentors } from "@/lib/actions/mentors";

export default async function AdminMentorsPage() {
  const mentors = await getAdminMentors();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Mentors</h1>
          <p className="text-sm text-gray-500">{mentors.length} total · admin-curated industry practitioners</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/mentors/requests">Requests</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/mentors/new"><Plus className="h-4 w-4 mr-1" /> New mentor</Link>
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        {mentors.map((m) => (
          <Card key={m.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Avatar src={m.avatarUrl} alt={m.displayName} size="md" ring />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{m.displayName}</h3>
                  <Badge variant="outline">{m.status}</Badge>
                  {m.isFeatured && <Badge variant="success">Featured</Badge>}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {m.title ?? "Mentor"}
                  {m.company ? ` · ${m.company}` : ""}
                  {" · "}
                  {m.requestCount} requests · {m.sessionCount} sessions
                </p>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/mentors/${m.id}/edit`}>Edit</Link>
            </Button>
          </Card>
        ))}
        {mentors.length === 0 && (
          <Card className="py-12 text-center text-sm text-gray-400">
            No mentors yet. Add your first industry practitioner.
          </Card>
        )}
      </div>
    </div>
  );
}
