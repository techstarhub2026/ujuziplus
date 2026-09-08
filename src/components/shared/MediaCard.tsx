import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardMedia } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type MediaCardProps = {
  href?: string;
  image: React.ReactNode;
  badges?: React.ReactNode;
  title: string;
  subtitle?: string;
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  aspect?: "video" | "wide" | "square";
  hover?: boolean;
  onClick?: () => void;
};

function MediaCardContent({
  href,
  image,
  badges,
  title,
  subtitle,
  meta,
  footer,
  aspect,
  linkedOnly,
}: Omit<MediaCardProps, "className" | "hover" | "onClick" | "actions"> & {
  linkedOnly?: boolean;
}) {
  const titleBlock = (
    <>
      <h3
        className={cn(
          "font-display font-bold leading-snug text-gray-900 line-clamp-2 transition-colors",
          href && "group-hover:text-brand"
        )}
      >
        {title}
      </h3>
      {subtitle && (
        <p className="mt-1.5 text-sm leading-relaxed text-gray-500 line-clamp-2">{subtitle}</p>
      )}
      {meta && <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">{meta}</div>}
      {footer && !linkedOnly && <div className="mt-auto pt-4">{footer}</div>}
    </>
  );

  const mediaBlock = (
    <CardMedia aspect={aspect}>
      {image}
      {badges && (
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1.5">{badges}</div>
      )}
    </CardMedia>
  );

  if (href && linkedOnly) {
    return (
      <>
        <Link href={href} className="block">
          {mediaBlock}
          <div className="p-3.5 pb-0">{titleBlock}</div>
        </Link>
        {footer && <div className="px-3.5 pt-3">{footer}</div>}
      </>
    );
  }

  if (href) {
    return (
      <Link href={href} className="block">
        {mediaBlock}
        <div className="p-3.5">{titleBlock}</div>
      </Link>
    );
  }

  return (
    <>
      {mediaBlock}
      <div className="flex flex-1 flex-col p-3.5">
        {titleBlock}
        {footer && <div className="mt-auto pt-4">{footer}</div>}
      </div>
    </>
  );
}

export function MediaCard({
  href,
  image,
  badges,
  title,
  subtitle,
  meta,
  footer,
  actions,
  className,
  aspect = "video",
  hover = true,
  onClick,
}: MediaCardProps) {
  const hasActions = !!actions;
  const linkedOnly = !!href && hasActions;

  return (
    <Card
      hover={hover}
      padding="none"
      variant="elevated"
      className={cn("group flex h-full flex-col overflow-hidden", className)}
      onClick={onClick}
    >
      <MediaCardContent
        href={href}
        image={image}
        badges={badges}
        title={title}
        subtitle={subtitle}
        meta={meta}
        footer={footer}
        aspect={aspect}
        linkedOnly={linkedOnly}
      />
      {actions && (
        <div className="mt-auto flex flex-wrap gap-2 border-t border-gray-100/80 bg-gradient-to-b from-transparent to-brand-light/20 px-3.5 pb-3.5 pt-2.5">
          {actions}
        </div>
      )}
    </Card>
  );
}

export function MediaCardPrice({
  isFree,
  price,
  originalPrice,
}: {
  isFree?: boolean;
  price?: string;
  originalPrice?: string;
}) {
  if (isFree) {
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-sm font-bold text-green-700 ring-1 ring-green-200">
        Free
      </span>
    );
  }
  return (
    <div className="flex items-baseline gap-1.5">
      {price && <span className="font-display text-lg font-bold text-gradient-warm">{price}</span>}
      {originalPrice && (
        <span className="text-xs text-gray-400 line-through">{originalPrice}</span>
      )}
    </div>
  );
}

export { Badge };
