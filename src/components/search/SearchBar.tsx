"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({ defaultValue = "" }: { defaultValue?: string }) {
  const [q, setQ] = useState(defaultValue);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-xl">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      <label htmlFor="global-search" className="sr-only">
        Search UjuziLab
      </label>
      <input
        id="global-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search courses, people, discussions…"
        aria-label="Search courses, people, and discussions"
        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
      />
    </form>
  );
}
