/**
 * Shared with both the factory-reset action and its form.
 *
 * Kept out of the action file because a "use server" module may only export
 * async functions — exporting this phrase from there failed the build.
 */

/** Typed by the operator to confirm. Deliberately awkward to produce by accident. */
export const RESET_PHRASE = "ERASE ALL CONTENT";

export interface FactoryResetInput {
  password: string;
  confirmation: string;
}
