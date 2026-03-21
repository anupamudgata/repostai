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
              We retain your account data, repurposed content and history, brand voice samples,
              scheduled posts, connected social accounts (OAuth tokens), usage counters, and
              subscription metadata for as long as your account is active.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Right to erasure (account deletion)</h2>
            <p className="text-muted-foreground mb-3">
              You may delete your account and associated personal data at any time from{" "}
              <Link href="/dashboard/settings/delete" className="text-primary underline">
                Settings → Delete account
              </Link>
              . We offer (1) a <strong>signed email link</strong> you confirm with a phrase, and
              (2) <strong>immediate deletion</strong> while you are signed in, also confirmed with a
              phrase. After deletion completes, we send a short confirmation email to the address
              we held on file (where email delivery is configured).
            </p>
            <p className="text-muted-foreground mb-3">
              Deletion removes application data we control in our primary database, including
              profiles, subscriptions, brand voices, repurpose jobs and outputs, scheduled posts,
              post analytics (engagement), AI Content Starter drafts, usage records, and connected
              account tokens. Your Supabase Auth user record is removed so you cannot sign in again
              with the same credentials.
            </p>
            <p className="text-muted-foreground">
              Some information may remain with processors under their own retention rules (e.g.
              payment provider records for tax/fraud, or short-lived server logs). For billing
              cancellations tied to third-party payment providers, contact {SUPPORT_EMAIL} if you
              need help after self-service deletion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">6. Your rights & regional privacy</h2>
            <p className="text-muted-foreground">
              You have the right to access, correct, or delete your personal data, and to object
              to or restrict certain processing where applicable. We aim to comply with major
              privacy regulations, including the EU&apos;s GDPR, California&apos;s CCPA/CPRA, and
              Brazil&apos;s LGPD. Contact us at {SUPPORT_EMAIL} with any requests related to access,
              deletion, portability, or other privacy rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">7. Contact</h2>
            <p className="text-muted-foreground">
              For privacy-related questions, contact {SUPPORT_EMAIL}.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
