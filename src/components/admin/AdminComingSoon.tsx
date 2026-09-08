import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AdminComingSoon({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="py-16 text-center max-w-lg mx-auto">
      <h1 className="text-xl font-bold">{title}</h1>
      <p className="text-sm text-gray-500 mt-2">{description}</p>
      <p className="text-xs text-gray-400 mt-4">
        This module is planned for a future release. Core admin tools (users, courses, payments,
        discussions) are fully wired to your database.
      </p>
      <Button asChild variant="secondary" className="mt-6">
        <Link href="/admin">Back to overview</Link>
      </Button>
    </Card>
  );
}
