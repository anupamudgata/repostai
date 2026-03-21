"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/contexts/i18n-provider";
import { useAppToast } from "@/hooks/use-app-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MARKET_REGIONS = [
  { id: "na" },
  { id: "eu" },
  { id: "in" },
  { id: "latam" },
  { id: "other" },
] as const;

export default function SignupPage() {
  const { t } = useI18n();
  const toastT = useAppToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [marketRegion, setMarketRegion] = useState<string>("na");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, market_region: marketRegion },
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) {
      toastT.errorFromApi({ error: error.message });
      setLoading(false);
      return;
    }

    toastT.success("auth.checkEmailConfirm");
    router.push("/login");
  }

  async function handleGoogleSignup() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    if (error) toastT.errorFromApi({ error: error.message });
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
          <CardTitle className="text-2xl">{t("auth.createAccount")}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("auth.signupSubtitle")}
          </p>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleSignup}
          >
            <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("auth.continueGoogle")}
          </Button>

          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              {t("auth.or")}
            </span>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">{t("auth.fullName")}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t("auth.placeholderName")}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
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
            <div>
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("auth.placeholderPasswordMin")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label>{t("auth.marketRegion")}</Label>
              <Select
                value={marketRegion}
                onValueChange={setMarketRegion}
              >
                <SelectTrigger className="w-full mt-1.5">
                  <SelectValue placeholder={t("auth.marketPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {MARKET_REGIONS.map((region) => (
                    <SelectItem key={region.id} value={region.id}>
                      {t(`auth.regions.${region.id}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("auth.creatingAccount") : t("auth.createAccountBtn")}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {t("auth.haveAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("auth.logIn")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
