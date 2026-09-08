import Link from "next/link";
import { getOrgInviteByToken } from "@/lib/actions/org-members";
import { AcceptOrgInviteButton } from "@/components/org/AcceptOrgInviteButton";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAuthSession } from "@/lib/auth-server";

export default async function AcceptOrgInvitePage({
  params,
}: {
  params: { token: string };
}) {
  const invite = await getOrgInviteByToken(params.token);
  const session = await getAuthSession();

  if (!invite) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <Card className="p-8">
          <h1 className="text-xl font-bold">Invitation unavailable</h1>
          <p className="mt-2 text-sm text-gray-500">
            This link may have expired or already been used.
          </p>
          <Button asChild className="mt-6">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </Card>
      </div>
    );
  }

  const emailMatch =
    session?.user?.email?.toLowerCase() === invite.email.toLowerCase();

  return (
    <div className="mx-auto max-w-md px-4 py-20">
      <Card className="p-8 text-center">
        <h1 className="text-xl font-bold">Join {invite.org.name}</h1>
        <p className="mt-2 text-sm text-gray-500">
          {invite.invitedBy.fullName} invited you as{" "}
          <span className="font-medium capitalize">{invite.role.toLowerCase()}</span>.
        </p>
        <p className="mt-4 text-xs text-gray-400">Invite for: {invite.email}</p>

        {!session ? (
          <div className="mt-6 space-y-2">
            <Button asChild className="w-full">
              <Link href={`/auth/login?callbackUrl=/invite/org/${params.token}`}>
                Sign in to accept
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/auth/register?callbackUrl=/invite/org/${params.token}`}>
                Create account
              </Link>
            </Button>
          </div>
        ) : !emailMatch ? (
          <div className="mt-6">
            <p className="text-sm text-amber-700">
              You are signed in as {session.user.email}. Sign in as {invite.email} to accept.
            </p>
            <Button asChild variant="outline" className="mt-4 w-full">
              <Link href={`/auth/login?callbackUrl=/invite/org/${params.token}`}>
                Switch account
              </Link>
            </Button>
          </div>
        ) : (
          <AcceptOrgInviteButton userId={session.user.id} token={params.token} />
        )}
      </Card>
    </div>
  );
}
