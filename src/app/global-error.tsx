"use client";

import { useEffect } from "react";

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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center font-sans">
        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-3 max-w-sm text-gray-500 text-sm">
          A critical error occurred. Please refresh the page or try again later.
        </p>
        {error.digest && (
          <p className="mt-2 font-mono text-xs text-gray-300">Error ID: {error.digest}</p>
        )}
        <button
          type="button"
          onClick={reset}
          className="mt-8 rounded-lg bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand/90"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
