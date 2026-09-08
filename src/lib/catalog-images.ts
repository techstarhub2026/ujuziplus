/** Default catalog thumbnails when none uploaded in admin. */
export const PROGRAM_THUMBNAIL_DEFAULT = "/images/catalog/program-bootcamp.png";
export const COMPETITION_THUMBNAIL_DEFAULT = "/images/catalog/competition-robotics.png";

const PROGRAM_SLUG_IMAGES: Record<string, string> = {
  "arduino-educator-certification": "/images/catalog/program-arduino-educator.png",
  "arduino-educator-certification-for-african-teachers":
    "/images/catalog/program-arduino-educator.png",
  "ujuzi-stem-residency-2026": "/images/catalog/program-stem-residency.png",
  "ujuzilab-stem-residency-2026": "/images/catalog/program-stem-residency.png",
};

const COMPETITION_SLUG_IMAGES: Record<string, string> = {
  "african-robotics-league-2026": "/images/catalog/competition-robotics-league.png",
  "east-africa-iot-challenge-2026": "/images/catalog/competition-iot-challenge.png",
};

export function resolveProgramThumbnail(slug: string, thumbnailUrl?: string | null) {
  if (thumbnailUrl?.trim()) return thumbnailUrl;
  return PROGRAM_SLUG_IMAGES[slug] ?? PROGRAM_THUMBNAIL_DEFAULT;
}

export function resolveCompetitionThumbnail(slug: string, thumbnailUrl?: string | null) {
  if (thumbnailUrl?.trim()) return thumbnailUrl;
  return COMPETITION_SLUG_IMAGES[slug] ?? COMPETITION_THUMBNAIL_DEFAULT;
}
