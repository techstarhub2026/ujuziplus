"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";

export function HomeHeroSearch() {
  const [q, setQ] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
    else router.push("/courses");
  }

  return (
    <form onSubmit={handleSubmit} className="home-hero-search">
      <label htmlFor="home-hero-search" className="sr-only">
        Search courses, kits, and programs
      </label>
      <Search className="home-hero-search__icon" aria-hidden />
      <input
        id="home-hero-search"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="What do you want to learn? Robotics, IoT, coding…"
        className="home-hero-search__input"
      />
      <button type="submit" className="home-hero-search__btn">
        Search
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
