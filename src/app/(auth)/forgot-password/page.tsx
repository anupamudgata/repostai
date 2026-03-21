"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/contexts/i18n-provider";
import { useAppToast } from "@/hooks/use-app-toast";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const toastT = useAppToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSent(false);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login?reset=success`,
    });

    if (error) {
      toastT.errorFromApi({ error: error.message });
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 mb-4"
          >
            <Zap className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">{t("brandName")}</span>
          </Link>
          <CardTitle className="text-2xl">{t("auth.resetPassword")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("auth.resetSubtitle")}
          </p>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                {t("auth.resetSent", { email })}
              </p>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  {t("auth.backToSignIn")}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.placeholderEmail")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("auth.sending") : t("auth.sendResetLink")}
              </Button>
            </form>
          )}

          <p className="text-sm text-center text-muted-foreground mt-6">
            <Link href="/login" className="text-primary hover:underline">
              {t("auth.backToSignIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
