/**
 * Open Knowledge — serves the complete offline reference mirror that lives in
 * `public/w3schools` inside the UjuziPlus shell.
 *
 * The mirror is served through `/api/open-knowledge`, which applies UjuziPlus
 * branding on the way out rather than modifying the mirror's own files.
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

export default function OpenKnowledgePage({
  searchParams,
}: {
  searchParams?: { p?: string | string[] };
}) {
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
