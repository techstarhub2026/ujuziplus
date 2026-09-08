/** Build a login URL that returns the user to `path` after sign-in. */
export function loginUrl(path: string): string {
  const safe = path.startsWith("/") ? path : `/${path}`;
  return `/auth/login?callbackUrl=${encodeURIComponent(safe)}`;
}
