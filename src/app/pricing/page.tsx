import Link from "next/link";
import type { Metadata } from "next";
import { PLANS } from "@/config/constants";

export const metadata: Metadata = {
  title: "Pricing - RepostAI",
  description:
    "Choose the plan that fits your needs. Free, Starter, Pro, and Agency plans for content repurposing.",
};

const PLAN_ENTRIES = [
  { key: "FREE" as const, popular: false },
  { key: "STARTER" as const, popular: false },
  { key: "PRO" as const, popular: true },
  { key: "AGENCY" as const, popular: false },
];

const FAQ = [
  {
    q: "Can I switch plans anytime?",
    a: "Yes. You can upgrade or downgrade at any time. When you upgrade, the new features are available immediately. When you downgrade, the change takes effect at the end of your billing cycle.",
  },
  {
    q: "What happens when I hit my repurpose limit?",
    a: "You'll see a prompt to upgrade. Your existing outputs stay accessible — you just can't generate new ones until the limit resets next month or you upgrade.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "The Free plan itself is a permanent free tier with 10 repurposes per month. No credit card required. You can upgrade to a paid plan whenever you're ready.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit/debit cards and UPI via our payment partner. All prices are in INR.",
  },
];

function formatPrice(price: number): string {
  if (price === 0) return "Free";
  return `₹${price}`;
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <header className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Pricing
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits your needs
          </p>
        </header>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLAN_ENTRIES.map(({ key, popular }) => {
            const plan = PLANS[key];
            const hasAnnual = "annualPrice" in plan;
            return (
              <article
                key={key}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  popular
                    ? "border-primary shadow-lg ring-1 ring-primary/20"
                    : "border-border"
                }`}
              >
                {popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground">
                    Most Popular
                  </span>
                )}

                <h2 className="text-lg font-semibold">{plan.name}</h2>

                <p className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold tracking-tight">
                    {formatPrice(plan.monthlyPrice)}
                  </span>
                  {plan.monthlyPrice > 0 && (
                    <span className="text-sm text-muted-foreground">/mo</span>
                  )}
                </p>

                {hasAnnual && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    or ₹{(plan as { annualPrice: number }).annualPrice}/yr (save{" "}
                    {Math.max(1, Math.round(
                      (1 -
                        (plan as { annualPrice: number }).annualPrice /
                          (plan.monthlyPrice * 12)) *
                        100
                    ))}
                    %)
                  </p>
                )}

                <ul className="mt-6 flex-1 space-y-2.5 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2">
                      <svg
                        className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors ${
                    popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-input bg-background hover:bg-muted"
                  }`}
                >
                  {plan.monthlyPrice === 0 ? "Get Started Free" : `Start with ${plan.name}`}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-t bg-muted/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <h2 className="text-2xl font-bold text-center mb-10">
            Frequently Asked Questions
          </h2>
          <dl className="space-y-6">
            {FAQ.map(({ q, a }) => (
              <div key={q}>
                <dt className="text-base font-semibold">{q}</dt>
                <dd className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                  {a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
