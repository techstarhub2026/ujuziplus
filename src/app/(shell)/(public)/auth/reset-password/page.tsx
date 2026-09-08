"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, KeyRound } from "lucide-react";
import { UjuziLoader } from "@/components/ui/UjuziLoader";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/ui/form-alert";
import { resetPassword } from "@/lib/actions/auth";
import {
  AuthShell,
  AuthCard,
  AuthLogo,
  authButtonClass,
} from "@/components/auth/AuthShell";

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("token", token);
    const result = await resetPassword(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setDone(true);
      setTimeout(() => router.push("/auth/login"), 3000);
    }
  }

  if (!token) {
    return (
      <AuthShell
        panelTitle="Invalid link"
        panelSubtitle="This reset link may have expired. Request a new one to continue."
      >
        <AuthCard>
          <div className="text-center">
            <p className="text-red-600">Invalid reset link. Please request a new one.</p>
            <Link
              href="/auth/forgot-password"
              className="mt-4 inline-block text-sm font-semibold text-brand hover:underline"
            >
              Request new link
            </Link>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell
        panelTitle="You're all set"
        panelSubtitle="Your password has been updated. Sign in with your new credentials."
      >
        <AuthCard>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="font-display text-xl font-bold">Password updated!</h2>
            <p className="mt-2 text-sm text-gray-600">Redirecting to sign in...</p>
          </div>
        </AuthCard>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      panelTitle="Choose a strong password"
      panelSubtitle="Use at least 8 characters with a mix of letters and numbers."
    >
      <AuthCard>
        <AuthLogo title="Set new password" subtitle="Minimum 8 characters required." />

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <FormAlert variant="error">{error}</FormAlert>}

          <Input
            label="New password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            leftIcon={<KeyRound className="h-4 w-4" />}
          />

          <Input
            label="Confirm password"
            name="confirm"
            type="password"
            required
            minLength={8}
            placeholder="Repeat your new password"
            autoComplete="new-password"
          />

          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? <UjuziLoader size="sm" className="ujuzi-loader--on-brand" label="Updating password" /> : "Update password"}
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
