/**
 * /courses — Public course catalog (DB only)
 */
import { Suspense } from "react";
import { CourseCatalogSection } from "./CourseCatalogSection";

function CoursesSkeleton() {
  return (
    <div className="learner-canvas mx-auto max-w-7xl animate-pulse px-4 py-12 sm:px-6" aria-hidden>
      <div className="mb-8 h-48 rounded-3xl bg-gray-200" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-20 rounded-2xl bg-gray-100" />
        <div className="h-20 rounded-2xl bg-gray-100" />
        <div className="h-20 rounded-2xl bg-gray-100" />
      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={<CoursesSkeleton />}>
      <CourseCatalogSection />
    </Suspense>
  );
}
