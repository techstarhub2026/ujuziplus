import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, XCircle } from "lucide-react";
import { getAuthSession } from "@/lib/auth-server";
import { db } from "@/lib/db";
import { AuthShell, AuthCard } from "@/components/auth/AuthShell";

export default async function InstructorPendingPage() {
  const session = await getAuthSession();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "INSTRUCTOR") redirect("/dashboard");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { instructorStatus: true },
  });

  if (user?.instructorStatus === "APPROVED") redirect("/instructor/dashboard");

  const rejected = user?.instructorStatus === "REJECTED";

  return (
    <AuthShell
      panelTitle={rejected ? "Application update" : "Almost there"}
      panelSubtitle={
        rejected
          ? "Your instructor application was reviewed by our team."
          : "Our team reviews every instructor application to keep the learning experience high quality."
      }
    >
      <AuthCard>
        <div className="text-center">
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
              rejected ? "bg-red-50" : "bg-amber-50"
            }`}
          >
            {rejected ? (
              <XCircle className="h-8 w-8 text-red-500" />
            ) : (
              <Clock className="h-8 w-8 text-amber-500" />
            )}
          </div>
          <h2 className="font-display text-xl font-bold text-gray-900">
            {rejected
              ? "Your instructor application was not approved"
              : "Your instructor application is under review"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {rejected
              ? "Contact support if you'd like more details or to discuss reapplying."
              : "You'll receive an email as soon as an admin approves your account. You can sign in once approved."}
          </p>

          <Link
            href="/auth/login"
            className="mt-6 inline-block text-sm font-semibold text-brand hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </AuthCard>
    </AuthShell>
  );
}
