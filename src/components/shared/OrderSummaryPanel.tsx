import { cn } from "@/lib/utils";
import { Card, CardTitle } from "@/components/ui/card";

export function OrderSummaryPanel({
  title = "Order summary",
  children,
  footer,
  className,
  sticky = true,
}: {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  sticky?: boolean;
}) {
  return (
    <Card
      padding="md"
      variant="elevated"
      className={cn(
        "ring-1 ring-gray-100/80",
        sticky && "lg:sticky lg:top-24",
        className
      )}
    >
      <CardTitle className="section-accent-title mb-4 text-base">{title}</CardTitle>
      {children}
      {footer}
    </Card>
  );
}

export function SummaryRow({
  label,
  value,
  emphasis,
  className,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex justify-between gap-2 text-sm",
        emphasis ? "border-t border-gray-100 pt-3 text-base font-bold" : "text-gray-600",
        className
      )}
    >
      <span>{label}</span>
      <span className={cn(emphasis && "text-brand")}>{value}</span>
    </div>
  );
}
