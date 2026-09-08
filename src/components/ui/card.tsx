import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const cardVariants = cva(
  "rounded-2xl border text-gray-800 transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border-white/80 bg-white/90 shadow-soft backdrop-blur-sm",
        elevated: "premium-card border-transparent shadow-card",
        ghost: "border-transparent bg-transparent shadow-none",
        outline: "border-gray-200/80 bg-transparent shadow-none",
        stat: "stat-card",
        glass: "border-white/40 bg-white/60 shadow-soft backdrop-blur-md",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
      interactive: {
        true: "content-card-hover cursor-pointer hover:border-brand/20",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      interactive: false,
    },
  }
);

export function Card({
  className,
  children,
  hover = false,
  variant,
  padding,
  interactive,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof cardVariants> & {
    hover?: boolean;
  }) {
  return (
    <div
      className={cn(
        cardVariants({
          variant,
          padding,
          interactive: interactive ?? hover,
        }),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-4 space-y-1", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-lg font-bold tracking-tight text-navy", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm leading-relaxed text-gray-500", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 flex items-center gap-2 border-t border-gray-100/80 pt-4", className)}
      {...props}
    />
  );
}

export function CardMedia({
  className,
  aspect = "video",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  aspect?: "video" | "wide" | "square";
}) {
  return (
    <div
      className={cn(
        "media-card-image relative w-full overflow-hidden",
        aspect === "video" && "aspect-video",
        aspect === "wide" && "aspect-[16/10]",
        aspect === "square" && "aspect-square",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
