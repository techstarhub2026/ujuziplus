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
