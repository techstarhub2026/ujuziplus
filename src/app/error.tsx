"use client";

/**
 * Global runtime error boundary
 */

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-50 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-400" />
      </div>

      <h1 className="font-display text-3xl font-bold text-gray-900">Something went wrong</h1>
      <p className="mt-3 max-w-sm text-gray-500">
        We ran into an unexpected error. Please try again, or return to the dashboard.
      </p>
      {error.digest && (
        <p className="mt-2 font-mono text-xs text-gray-300">Error ID: {error.digest}</p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RefreshCw className="mr-1.5 h-4 w-4" />Try again
        </Button>
        <Button asChild variant="secondary">
          <Link href="/dashboard">
            <Home className="mr-1.5 h-4 w-4" />Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
