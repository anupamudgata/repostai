import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SUPPORT_EMAIL } from "@/config/constants";

export const metadata = {
  title: "Privacy Policy - RepostAI",
  description: "RepostAI Privacy Policy - How we collect, use, and protect your data.",
};

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">
          Last updated: March 2026
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information you provide directly: email address, name, and
              password when you sign up. We also store the content you paste or
              submit for repurposing, including URLs and text, to generate and save
              your outputs. Payment information is processed by our payment provider
              (Razorpay) and is not stored on our servers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. How We Use Your Data</h2>
            <p className="text-muted-foreground">
              Your content is sent to OpenAI to generate repurposed posts. We store
              your repurpose history, brand voice samples, and account data in
              Supabase (PostgreSQL). We use your email to communicate about your
              account, product updates, and support. We do not sell your data to
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">3. Cookies and Storage</h2>
            <p className="text-muted-foreground">
              We use cookies and local storage for authentication (Supabase Auth)
              and to remember your preferences (e.g., theme). These are essential
              for the service to function.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your account data, repurpose history, and brand voices for
              as long as your account is active. You may request deletion of your
              account and data at any time via Settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Your Rights & Regional Privacy</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal data.
              You may export your data or request account deletion at any time.
              We aim to comply with major privacy regulations, including the EU&apos;s GDPR,
              California&apos;s CCPA/CPRA, and Brazil&apos;s LGPD. Contact us at {SUPPORT_EMAIL} with any
              requests related to access, deletion, or privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related questions, contact {SUPPORT_EMAIL}.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
