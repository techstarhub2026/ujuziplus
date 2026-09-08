import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

type Props = ImageProps & {
  aspect?: "video" | "square" | "auto";
  priority?: boolean;
  alt: string;
};

export function OptimizedImage({
  className,
  aspect = "auto",
  priority,
  sizes,
  fill,
  ...props
}: Props) {
  const defaultSizes = fill
    ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    : undefined;

  const src = typeof props.src === "string" ? props.src : "";
  const unoptimized = props.unoptimized ?? src.startsWith("/content/");

  if (fill) {
    return (
      <Image
        alt={props.alt}
        src={props.src}
        fill
        sizes={sizes ?? defaultSizes}
        priority={priority}
        unoptimized={unoptimized}
        className={cn("object-cover transition-transform duration-500 group-hover:scale-[1.04]", className)}
      />
    );
  }

  return (
    <Image
      alt={props.alt}
      src={props.src}
      width={props.width}
      height={props.height}
      sizes={sizes ?? defaultSizes}
      priority={priority}
      unoptimized={unoptimized}
      className={cn(className)}
    />
  );
}

export function ImageContainer({
  children,
  className,
  aspect = "video",
}: {
  children: React.ReactNode;
  className?: string;
  aspect?: "video" | "square" | "wide";
}) {
  return (
    <div
      className={cn(
        "media-card-image relative w-full overflow-hidden bg-gray-100",
        aspect === "video" && "aspect-video",
        aspect === "square" && "aspect-square",
        aspect === "wide" && "aspect-[16/10]",
        className
      )}
    >
      {children}
    </div>
  );
}
