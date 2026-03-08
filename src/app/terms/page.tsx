import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORT_EMAIL } from "@/config/constants";

export const metadata = {
  title: "Terms of Service - RepostAI",
  description: "RepostAI Terms of Service - Usage terms and conditions.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold">RepostAI</span>
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: March 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Acceptance</h2>
            <p className="text-muted-foreground">
              By using RepostAI, you agree to these Terms of Service. If you do not
              agree, do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Acceptable Use</h2>
            <p className="text-muted-foreground">
              You may use RepostAI to repurpose your own content or content you
              have rights to. You may not use the service to generate content that
              is illegal, harmful, defamatory, infringing, or violates third-party
              rights. You may not abuse the API, circumvent usage limits, or
              resell access without authorization.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Subscriptions</h2>
            <p className="text-muted-foreground">
              Paid plans (Pro, Agency) are billed monthly or annually. You may
              cancel at any time; access continues until the end of the billing
              period. Refunds are offered within 14 days of purchase per our
              money-back guarantee.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. AI Output</h2>
            <p className="text-muted-foreground">
              RepostAI uses AI to generate content. We do not guarantee accuracy,
              and you are responsible for reviewing and approving all output before
              publishing. We are not liable for any consequences of published
              content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              RepostAI is provided &quot;as is.&quot; We are not liable for indirect,
              incidental, or consequential damages. Our total liability is limited
              to the amount you paid in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Changes</h2>
            <p className="text-muted-foreground">
              We may update these terms. Continued use after changes constitutes
              acceptance. We will notify users of material changes via email or
              in-app notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
            <p className="text-muted-foreground">
              For questions about these terms, contact {SUPPORT_EMAIL}.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
