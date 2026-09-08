"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { UjuziLoader } from "@/components/ui/UjuziLoader";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/ui/form-alert";
import { resolvePostLoginPath } from "@/lib/auth/roles";
import { getLoginFailureHint } from "@/lib/actions/auth";
import {
  AuthShell,
  AuthCard,
  AuthLogo,
  authButtonClass,
} from "@/components/auth/AuthShell";

function LoginForm() {
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? params.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      const hint = await getLoginFailureHint(email);
      if (hint === "pending_instructor") {
        setError(
          "Your instructor application is still under review — you'll get an email once it's approved."
        );
      } else if (hint === "rejected_instructor") {
        setError("Your instructor application was not approved. Contact support for details.");
      } else {
        setError("Incorrect email or password. Please try again.");
      }
      setLoading(false);
      return;
    }

    const session = await getSession();
    const destination = resolvePostLoginPath(session?.user?.role, callbackUrl);
    window.location.assign(destination);
  }

  return (
    <AuthShell
      panelTitle="Learn by building real things"
      panelSubtitle="Courses, kits, labs, and community — everything you need to grow as a STEM innovator."
    >
      <AuthCard>
        <AuthLogo
          title="Sign in"
          subtitle={
            <>
              Don&apos;t have an account?{" "}
              <Link href="/auth/register" className="font-semibold text-brand hover:underline">
                Create one free
              </Link>
            </>
          }
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <FormAlert variant="error">{error}</FormAlert>}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <div>
            <Input
              label="Password"
              type={showPw ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              }
            />
            <div className="mt-1 text-right">
              <Link href="/auth/forgot-password" className="text-xs font-medium text-brand hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>

          <button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? <UjuziLoader size="sm" className="ujuzi-loader--on-brand" label="Signing in" /> : "Sign in"}
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
