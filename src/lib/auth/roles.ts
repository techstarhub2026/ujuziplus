import type { Role } from "@prisma/client";

export function isStudentRole(role: Role | string | undefined) {
  return role === "STUDENT";
}

export function isInstructorRole(role: Role | string | undefined) {
  return role === "INSTRUCTOR";
}

export function isAdminRole(role: Role | string | undefined) {
  return role === "ADMIN" || role === "MODERATOR";
}

/** Default landing page after sign-in (when callbackUrl is generic or missing). */
export function getPostLoginPath(role: Role | string | undefined): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "MODERATOR":
      return "/moderator";
    case "INSTRUCTOR":
      return "/instructor/dashboard";
    case "ORG_ADMIN":
      return "/dashboard/organizations";
    default:
      return "/dashboard";
  }
}

/** Prefer safe callbackUrl when user was sent to login from a protected route. */
export function resolvePostLoginPath(
  role: Role | string | undefined,
  callbackUrl: string | null | undefined
): string {
  const fallback = getPostLoginPath(role);
  if (!callbackUrl || callbackUrl === "/dashboard") return fallback;

  try {
    const path = callbackUrl.startsWith("http")
      ? new URL(callbackUrl).pathname
      : callbackUrl.split("?")[0];

    if (path.startsWith("/admin") && isAdminRole(role)) return path;
    if (path.startsWith("/moderator") && isAdminRole(role)) return path;
    if (path.startsWith("/instructor") && (isInstructorRole(role) || role === "ADMIN"))
      return path;
    if (
      path.startsWith("/dashboard") ||
      path.startsWith("/learn") ||
      path.startsWith("/org") ||
      path.startsWith("/checkout") ||
      path.startsWith("/cart") ||
      path.startsWith("/invite")
    ) {
      return path;
    }
  } catch {
    /* ignore malformed callback */
  }

  return fallback;
}
