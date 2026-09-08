import Image from "next/image";
import { cn } from "@/lib/utils";

const sizeMap = {
  xs: { px: 24, class: "h-6 w-6 text-[10px]" },
  sm: { px: 32, class: "h-8 w-8 text-xs" },
  md: { px: 40, class: "h-10 w-10 text-sm" },
  lg: { px: 56, class: "h-14 w-14 text-base" },
  xl: { px: 72, class: "h-[4.5rem] w-[4.5rem] text-lg" },
  "2xl": { px: 112, class: "h-28 w-28 text-xl" },
} as const;

export function Avatar({
  src,
  alt,
  size = "md",
  className,
  ring = false,
  ringTone = "light",
  status,
}: {
  src?: string | null;
  alt: string;
  size?: keyof typeof sizeMap;
  className?: string;
  ring?: boolean;
  /** light = white card backgrounds; dark = navy/photo heroes (no square offset) */
  ringTone?: "light" | "dark";
  status?: "online" | "offline";
}) {
  const { px, class: sizeClass } = sizeMap[size];
  const initials = alt
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "relative overflow-hidden rounded-full bg-gradient-to-br from-brand-light to-orange-100 font-semibold text-brand",
          sizeClass,
          ring &&
            ringTone === "light" &&
            "ring-2 ring-white ring-offset-2 ring-offset-white",
          ring &&
            ringTone === "dark" &&
            "ring-[3px] ring-brand shadow-lg shadow-black/25"
        )}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={px}
            height={px}
            className="h-full w-full object-cover"
            unoptimized={src.endsWith(".svg") || src.includes("dicebear.com")}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center">{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-white",
            status === "online" ? "bg-green-500" : "bg-gray-300"
          )}
        />
      )}
    </div>
  );
}
