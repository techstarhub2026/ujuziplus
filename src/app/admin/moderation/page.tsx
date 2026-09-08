import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminModerationPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Moderation</h1>
      <Card className="p-6">
        <p className="text-sm text-gray-600 mb-4">
          Course review and community discussions are handled in dedicated sections with live data.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/admin/courses">Course review queue</Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/admin/discussions">Discussion moderation</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
