import { revalidatePath, revalidateTag } from "next/cache";

/** Invalidate published course catalog caches and public pages. */
export function revalidateCourseCatalog(courseSlug?: string) {
  revalidateTag("published-courses");
  revalidateTag("published-course-detail");
  revalidatePath("/courses");
  revalidatePath("/");
  if (courseSlug) revalidatePath(`/courses/${courseSlug}`);
}

/** Invalidate published kit catalog caches and public pages. */
export function revalidateKitCatalog(kitSlug?: string) {
  revalidateTag("published-kits");
  revalidatePath("/kits");
  if (kitSlug) revalidatePath(`/kits/${kitSlug}`);
}

/**
 * Invalidate published programme caches and public pages.
 *
 * The programme list is held in an `unstable_cache` tagged
 * "published-programs", and nothing cleared that tag: every programme
 * mutation called `revalidatePath` alone, which drops the rendered page but
 * leaves the cached query behind it untouched. An admin edit therefore took
 * up to the cache's own 60-second expiry to appear, and looked like a save
 * that had not worked.
 */
export function revalidateProgramCatalog(programSlug?: string) {
  revalidateTag("published-programs");
  revalidatePath("/programs");
  revalidatePath("/");
  if (programSlug) revalidatePath(`/programs/${programSlug}`);
}
