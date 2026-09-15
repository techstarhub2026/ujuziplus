import Link from "next/link";
import { existsSync } from "node:fs";
import path from "node:path";

/**
 * Open Knowledge — serves the offline reference mirror that lives in
 * `public/w3schools` inside the UjuziPlus shell.
 *
 * The mirror is ~2 GB and gitignored, so it exists on a developer's machine
 * but never ships with a deployment: production rendered an iframe pointing at
 * files that were not there, i.e. a blank page with no explanation. The page
 * now checks for the mirror first and, when it is absent, says so and sends
 * the reader to the resources that do exist. It is also unlinked from the
 * navigation while that remains the case.
 *
 * `?p=` deep-links to any page of the mirror, e.g. /open-knowledge?p=python/default.html
 */

const MIRROR_ROOT = "/api/open-knowledge";
const MIRROR_HOME = `${MIRROR_ROOT}/index.html`;

/** Only allow plain relative paths that stay inside the mirror. */
function resolveStartPage(raw?: string | string[]) {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return MIRROR_HOME;

  const clean = value.replace(/^\/+/, "");
  if (!clean || clean.includes("..") || clean.includes(":")) return MIRROR_HOME;

  return `${MIRROR_ROOT}/${clean}`;
}

function mirrorInstalled() {
  return existsSync(path.join(process.cwd(), "public", "w3schools", "index.html"));
}

export default function OpenKnowledgePage({
  searchParams,
}: {
  searchParams?: { p?: string | string[] };
}) {
  if (!mirrorInstalled()) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold text-navy">Open Knowledge is not available here</h1>
        <p className="mt-3 text-gray-600">
          The offline reference library is not installed on this server. In the meantime, the
          curated resources and lab guides below cover the same ground.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/lab-resources"
            className="rounded-xl bg-brand px-5 py-2.5 font-semibold text-white transition hover:bg-brand-dark"
          >
            Lab Resources
          </Link>
          <Link
            href="/courses"
            className="rounded-xl border border-gray-200 px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Browse courses
          </Link>
        </div>
      </div>
    );
  }

  const src = resolveStartPage(searchParams?.p);

  return (
    <iframe
      key={src}
      src={src}
      title="Open Knowledge"
      className="block w-full border-0"
      style={{ height: "calc(100vh - 64px)" }}
    />
  );
}
