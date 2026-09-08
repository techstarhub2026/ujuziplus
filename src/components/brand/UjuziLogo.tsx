import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BRAND } from "@/lib/brand-assets";
import { BRAND_LOGO_ASPECT } from "@/lib/brand-logo-aspect";
import { PLATFORM } from "@/lib/constants";

type UjuziLogoProps = {
  variant?: "full" | "icon";
  theme?: "light" | "on-dark";
  href?: string;
  className?: string;
  logoHeight?: number;
  logoWidth?: number;
  showName?: boolean;
};

export function UjuziLogo({
  variant = "full",
  theme = "light",
  href = "/",
  className,
  logoHeight = 64,
  logoWidth,
  showName = false,
}: UjuziLogoProps) {
  const onDark = theme === "on-dark";
  const src =
    variant === "icon"
      ? onDark
        ? BRAND.markOnDark
        : BRAND.mark
      : onDark
        ? BRAND.logoOnDark
        : BRAND.logo;

  const isIcon = variant === "icon";
  const iconSize = logoHeight ?? logoWidth ?? 56;
  const width = isIcon ? iconSize : (logoWidth ?? Math.round(logoHeight * BRAND_LOGO_ASPECT));
  const height = isIcon ? iconSize : logoWidth ? Math.round(logoWidth / BRAND_LOGO_ASPECT) : logoHeight;

  const content = (
    <Image
      src={src}
      alt={PLATFORM.name}
      width={width}
      height={height}
      className={cn(
        "block shrink-0 object-contain",
        isIcon ? "mx-auto" : "object-left"
      )}
      style={
        isIcon
          ? { width: iconSize, height: iconSize, maxWidth: "100%", maxHeight: "100%" }
          : { width, height, maxWidth: "100%", maxHeight: "100%" }
      }
      priority
    />
  );

  const inner = (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        isIcon ? "max-h-full max-w-full" : "",
        className
      )}
    >
      {content}
      {showName && (
        <span className="font-display text-lg font-bold tracking-tight">{PLATFORM.name}</span>
      )}
    </span>
  );

  if (!href) return inner;

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-visible",
        isIcon ? "max-h-full max-w-full py-1" : ""
      )}
    >
      {inner}
    </Link>
  );
}
