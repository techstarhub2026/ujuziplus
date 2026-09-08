"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, Mail } from "lucide-react";
import { UjuziLoader } from "@/components/ui/UjuziLoader";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/ui/form-alert";
import { forgotPassword } from "@/lib/actions/auth";
import {
  AuthShell,
  AuthCard,
  AuthLogo,
  authButtonClass,
} from "@/components/auth/AuthShell";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [devUrl, setDevUrl] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await forgotPassword(formData);

    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSent(true);
      if (result.devResetUrl) setDevUrl(result.devResetUrl);
    }
  }

  if (sent) {
    return (
      <AuthShell
        panelTitle="We've got you covered"
        panelSubtitle="Password resets are secure and expire after a short time for your safety."
      >
        <AuthCard>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="font-display text-xl font-bold text-gray-900">Check your inbox</h2>
            <p className="mt-2 text-sm text-gray-600">
              If that email exists in our system, you&apos;ll receive a password reset link shortly.
            </p>

            {devUrl && (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left">
                <p className="mb-2 text-xs font-bold text-amber-800">
                  Dev mode — email not configured. Use this link:
                </p>
                <a href={devUrl} className="break-all text-xs text-brand hover:underline">
                  {devUrl}
                </a>
              </div>
            )}

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

  return (
    <AuthShell
      panelTitle="Forgot your password?"
      panelSubtitle="No worries — enter your email and we'll send you a secure reset link."
    >
      <AuthCard>
        <AuthLogo
          title="Reset password"
          subtitle={
            <>
              Remember it?{" "}
              <Link href="/auth/login" className="font-semibold text-brand hover:underline">
                Sign in
              </Link>
            </>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <FormAlert variant="error">{error}</FormAlert>}

          <Input
            label="Email address"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
          />

          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? <UjuziLoader size="sm" className="ujuzi-loader--on-brand" label="Sending" /> : "Send reset link"}
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
