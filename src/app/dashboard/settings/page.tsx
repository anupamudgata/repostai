"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { PLANS } from "@/config/constants";

declare global {
  interface Window {
    Razorpay?: new (options: {
      key: string;
      subscription_id: string;
      name: string;
      description: string;
      callback_url: string;
      prefill?: { email?: string; name?: string };
    }) => { open: () => void };
  }
}

export default function SettingsPage() {
  const [plan, setPlan] = useState("free");
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentProvider, setPaymentProvider] = useState<"razorpay" | "stripe">("stripe");
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");
      setUserName(user.user_metadata?.full_name || user.user_metadata?.name || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();

      if (profile) setPlan(profile.plan || "free");
    }

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch("/api/billing/provider")
      .then((r) => r.json())
      .then((d) => d.provider && setPaymentProvider(d.provider))
      .catch(() => {});
  }, []);

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Could not open billing portal");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setLoading(false);
  }

  async function handleDeleteAccount() {
    if (
      !confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      return;
    }

    toast.info(
      "Account deletion requested. Contact support@repostai.com to complete."
    );
  }

  const currentPlan =
    Object.values(PLANS).find(
      (p) => p.name.toLowerCase() === plan
    ) || PLANS.FREE;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and subscription.
        </p>
      </div>

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Current Plan:{" "}
                <Badge variant={plan === "free" ? "secondary" : "default"}>
                  {currentPlan.name}
                </Badge>
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                ${currentPlan.monthlyPrice}/month
              </p>
            </div>
            {plan !== "free" && (
              paymentProvider === "stripe" ? (
                <Button
                  variant="outline"
                  onClick={handleManageBilling}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Manage Billing"}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  To cancel or change plan, email support@repostai.com
                </p>
              )
            )}
          </div>

          {plan === "free" && (
            <div className="bg-primary/5 rounded-lg p-4">
              <p className="font-medium mb-1">Upgrade to Pro</p>
              <p className="text-sm text-muted-foreground mb-3">
                Get unlimited repurposes, all platforms, and brand voice
                training.
              </p>
              <Button
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  try {
                    if (paymentProvider === "razorpay") {
                      const res = await fetch("/api/billing/razorpay/create-subscription", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ plan: "pro", billing: "monthly" }),
                      });
                      const data = await res.json();
                      if (res.status === 503 || !data.subscriptionId || !data.keyId) {
                        toast.error(data.error || "Payments not configured");
                        setLoading(false);
                        return;
                      }
                      const baseUrl = window.location.origin;
                      const callbackUrl = `${baseUrl}/api/billing/razorpay/callback`;
                      if (!window.Razorpay) {
                        const script = document.createElement("script");
                        script.src = "https://checkout.razorpay.com/v1/checkout.js";
                        script.async = true;
                        document.body.appendChild(script);
                        await new Promise((resolve) => {
                          script.onload = resolve;
                        });
                      }
                      const rzp = new window.Razorpay!({
                        key: data.keyId,
                        subscription_id: data.subscriptionId,
                        name: "RepostAI",
                        description: "Pro — $19/month",
                        callback_url: callbackUrl,
                        prefill: { email, name: userName },
                      });
                      rzp.open();
                    } else {
                      const res = await fetch("/api/billing/checkout", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ plan: "pro" }),
                      });
                      const data = await res.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        toast.error(data.error || "Could not start checkout");
                      }
                    }
                  } catch {
                    toast.error("Something went wrong");
                  }
                  setLoading(false);
                }}
              >
                {loading ? "Loading..." : "Upgrade to Pro — $19/month"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-lg text-destructive">
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data.
              </p>
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
