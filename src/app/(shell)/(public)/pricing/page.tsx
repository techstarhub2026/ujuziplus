import { FaqItem } from "@/components/shared/PricingCard";
import { PricingPlansGrid } from "@/components/pricing/PricingPlansGrid";
import { PageSection } from "@/components/motion/PageSection";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { LearnerPageHero } from "@/components/shared/LearnerPageHero";
import { getActivePricingPlans } from "@/lib/actions/pricing";
import { serializePricingPlan } from "@/lib/serialize";
import { CreditCard } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PricingPage() {
  const plans = (await getActivePricingPlans()).map(serializePricingPlan);

  return (
    <div className="learner-canvas mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <LearnerPageHero
        banner="pricing"
        title="Simple, transparent pricing"
        subtitle="Choose the plan that fits your learning journey — start free and upgrade when you're ready."
      />

      {plans.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={<CreditCard className="h-8 w-8 text-brand" />}
          title="Pricing plans coming soon"
          description="We're finalizing our plans. Browse free courses and kits in the meantime."
          actionLabel="Browse courses"
          actionHref="/courses"
        />
      ) : (
        <PricingPlansGrid plans={plans} />
      )}

      <PageSection delay={0.15}>
      <Card className="mt-12 p-6 md:p-8" padding="lg">
        <h3 className="section-accent-title text-lg">Frequently asked questions</h3>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FaqItem
            question="Can I pay with mobile money?"
            answer="Course and kit checkout supports mobile money and card in sandbox mode. Live PSP integration is planned separately."
          />
          <FaqItem
            question="Do organizations get custom pricing?"
            answer="Yes. Contact us for bulk seat licensing and white-label options."
          />
        </div>
      </Card>
      </PageSection>
    </div>
  );
}
