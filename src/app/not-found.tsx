import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, Home, BookOpen, LogIn } from "lucide-react";
import { getAuthSession } from "@/lib/auth-server";

export default async function NotFound() {
  const session = await getAuthSession();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <div className="relative mb-8">
        <span className="font-display text-[10rem] font-black leading-none text-gray-100">
          404
        </span>
      </div>

      <h1 className="font-display text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-3 max-w-sm text-gray-500">
        The page you are looking for does not exist or may have been moved.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {session ? (
          <Button asChild>
            <Link href="/dashboard">
              <Home className="mr-1.5 h-4 w-4" />
              Go to dashboard
            </Link>
          </Button>
        ) : (
          <Button asChild>
            <Link href="/auth/login">
              <LogIn className="mr-1.5 h-4 w-4" />
              Sign in
            </Link>
          </Button>
        )}
        <Button asChild variant="secondary">
          <Link href="/courses">
            <BookOpen className="mr-1.5 h-4 w-4" />
            Browse courses
          </Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/search">
            <Search className="mr-1.5 h-4 w-4" />
            Search
          </Link>
        </Button>
      </div>
    </div>
  );
}
