"use client";

import Image, { type ImageProps } from "next/image";

/** Local /content/* assets skip the optimizer (seed placeholders are static files). */
export function ContentImage({ src, unoptimized, alt = "", ...props }: ImageProps) {
  const path = typeof src === "string" ? src : "";
  const isLocalContent = path.startsWith("/content/");
  return <Image src={src} alt={alt} unoptimized={unoptimized ?? isLocalContent} {...props} />;
}
