import type { ActionResult } from "@/lib/actions/courses";

/**
 * Turns anything thrown inside a server action into the failure its form is
 * already written to display.
 *
 * Server actions here guard with `requireAdmin()` / `requireUser()`, which
 * throw, and then talk to Prisma, which throws. Almost none of them catch, so
 * a rejected save propagated out of the action and Next rendered the error
 * boundary: the operator saw "Something went wrong", lost the form they had
 * been filling in, and learned nothing about the cause. The `else showToast(
 * res.error)` branch every form carries could never run.
 *
 * The messages below name what an operator can actually act on. Anything
 * unrecognised is logged with its context and reported plainly rather than
 * dressed up as a generic apology.
 */
export function actionFailure(context: string, e: unknown): ActionResult<never> {
  const message = e instanceof Error ? e.message : String(e);

  if (message.includes("Forbidden")) {
    return { success: false, error: "You do not have permission to do that." };
  }
  if (message.includes("Unauthorized") || message.includes("UNAUTHENTICATED")) {
    return { success: false, error: "Your session has expired. Sign in again." };
  }
  if (message === "NOT_FOUND" || message.includes("No record was found")) {
    return { success: false, error: "That item no longer exists." };
  }

  // Prisma's own error codes, which carry more meaning than their message text.
  if (message.includes("Unique constraint")) {
    return {
      success: false,
      error: "Something with that name or link already exists — try a different one.",
    };
  }
  if (message.includes("Foreign key constraint")) {
    return {
      success: false,
      error: "That change refers to something that no longer exists. Reload and try again.",
    };
  }
  if (message.includes("Can't reach database") || message.includes("ECONNREFUSED")) {
    return { success: false, error: "The database is unreachable. Try again in a moment." };
  }

  console.error(`[${context}]`, e);
  return { success: false, error: message || "Something went wrong. Try again." };
}

/**
 * Wraps a server action body so a throw becomes a returned failure.
 *
 *     export async function updateThing(id: string, input: Input) {
 *       return guard("things.update", async () => {
 *         await requireAdmin();
 *         …
 *         return { success: true, data: undefined };
 *       });
 *     }
 */
export async function guard<T>(
  context: string,
  body: () => Promise<ActionResult<T>>,
): Promise<ActionResult<T>> {
  try {
    return await body();
  } catch (e) {
    return actionFailure(context, e);
  }
}
