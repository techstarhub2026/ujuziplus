import Link from "next/link";
import { Check } from "lucide-react";
import { Card, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";

export function PricingCard({
  name,
  price,
  period,
  features,
  ctaLabel,
  ctaHref,
  isPopular,
}: {
  name: string;
  price: number;
  period?: string | null;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  isPopular?: boolean;
}) {
  const isFree = price === 0;

  return (
    <Card
      hover
      padding="none"
      variant={isPopular ? "elevated" : "default"}
      className={cn(
        "relative flex h-full flex-col overflow-hidden",
        isPopular && "ring-2 ring-brand/30"
      )}
    >
      {isPopular && (
        <>
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-glow via-brand to-brand-dark" />
          <Badge
            className="absolute -top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1/2 shadow-md"
            size="lg"
          >
            Recommended
          </Badge>
        </>
      )}

      <div className={cn("flex flex-1 flex-col p-6", isPopular && "pt-8")}>
        <h3 className="font-display text-xl font-bold tracking-tight text-gray-900">{name}</h3>
        <div className="mt-4 flex items-baseline gap-1">
          <span className="font-display text-4xl font-bold tracking-tight text-gradient-warm">
            {isFree ? "Free" : formatCurrency(price)}
          </span>
          {period && !isFree && (
            <span className="text-sm font-medium text-gray-500">/{period}</span>
          )}
        </div>

        <ul className="mt-6 space-y-3 border-t border-gray-100 pt-6">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-sm leading-relaxed text-gray-600">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-light to-orange-100 ring-1 ring-brand/20">
                <Check className="h-3 w-3 text-brand" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>

      <CardFooter className="border-0 bg-gradient-to-t from-brand-light/30 to-transparent p-6 pt-0">
        <Button asChild className="w-full" variant={isPopular ? "primary" : "outline"} size="lg">
          <Link href={ctaHref}>{ctaLabel}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="group rounded-2xl border border-white/80 bg-white/80 p-5 shadow-soft backdrop-blur-sm transition-all duration-300 hover:border-brand/20 hover:shadow-card hover:-translate-y-0.5">
      <dt className="font-display font-semibold text-gray-900 group-hover:text-brand transition-colors">
        {question}
      </dt>
      <dd className="mt-2 text-sm leading-relaxed text-gray-500">{answer}</dd>
    </div>
  );
}
