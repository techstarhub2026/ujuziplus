"use client";

import { useEffect, useState } from "react";

const MAX_AGE_DAYS = 30;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; samesite=lax`;
}

/**
 * Persists a small piece of UI preference state (catalog filter/sort choice)
 * in a cookie so it survives navigation between pages, instead of resetting
 * to the default every time the user leaves and returns to a listing page.
 * Not for anything sensitive or personally identifying.
 */
export function usePersistedFilter<T extends string>(
  cookieName: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const stored = readCookie(cookieName);
    if (stored) setValue(stored as T);
  }, [cookieName]);

  const update = (next: T) => {
    setValue(next);
    writeCookie(cookieName, next);
  };

  return [value, update];
}
