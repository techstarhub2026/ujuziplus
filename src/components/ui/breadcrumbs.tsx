import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({
  items,
  className,
  theme = "light",
}: {
  items: BreadcrumbItem[];
  className?: string;
  /** Use "dark" on dark hero banners / colored backgrounds. */
  theme?: "light" | "dark";
}) {
  const dark = theme === "dark";

  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1.5">
        <li className="flex items-center gap-1.5">
          <Link
            href="/"
            className={cn(
              "flex items-center transition hover:text-brand",
              dark ? "text-white/60" : "text-gray-400"
            )}
          >
            <Home className="h-3.5 w-3.5" />
            <span className="sr-only">Home</span>
          </Link>
          <ChevronRight
            className={cn("h-3.5 w-3.5", dark ? "text-white/30" : "text-gray-300")}
            aria-hidden
          />
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1.5">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "transition hover:text-brand",
                    dark ? "text-white/70" : "text-gray-500"
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    isLast
                      ? dark
                        ? "font-medium text-white"
                        : "font-medium text-navy"
                      : dark
                        ? "text-white/70"
                        : "text-gray-500"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              )}
              {!isLast && (
                <ChevronRight
                  className={cn("h-3.5 w-3.5", dark ? "text-white/30" : "text-gray-300")}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
