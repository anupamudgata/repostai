"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, Sparkles, Users, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/contexts/i18n-provider";
import { useAppToast } from "@/hooks/use-app-toast";

function LoginForm() {
  const { t } = useI18n();
  const toastT = useAppToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (searchParams.get("reset") === "success") {
      toastT.success("auth.passwordResetSuccess");
      router.replace("/login", { scroll: false });
      return;
    }
    const err = searchParams.get("error");
    if (err === "auth") {
      toastT.error("auth.callbackFailed");
      router.replace("/login", { scroll: false });
      return;
    }
    if (err === "oauth") {
      const detail = searchParams.get("detail");
      if (detail) {
        toastT.errorFromApi({ error: decodeURIComponent(detail) });
      } else {
        toastT.error("auth.oauthCancelled");
      }
      router.replace("/login", { scroll: false });
    }
  }, [searchParams, router, toastT]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { toastT.errorFromApi({ error: error.message }); return; }
      router.push("/dashboard");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg === "Failed to fetch" || msg.includes("NetworkError")) {
        toastT.error(t("auth.supabaseNetworkError"));
      } else {
        toastT.errorFromApi({ error: msg });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/api/auth/callback` },
      });
      if (error) toastT.errorFromApi({ error: error.message });
    } catch {
      toastT.error("auth.supabaseNetworkError");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-gradient-to-br from-primary via-purple-600 to-violet-700 p-12 flex-col justify-between">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-1/4 -right-10 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-0 right-0 w-full h-full opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 70% 30%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <Link href="/" className="relative flex items-center gap-2.5 text-white">
          <div className="h-9 w-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">RepostAI</span>
        </Link>

        <div className="relative space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 text-white/90 text-sm font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Trusted by 50,000+ creators
            </div>
            <blockquote className="text-white text-xl font-medium leading-relaxed">
              &ldquo;RepostAI turned my single blog post into 10 platform-ready pieces in under 30 seconds.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                A
              </div>
              <div>
                <p className="text-white font-semibold text-sm">Arjun Sharma</p>
                <p className="text-white/60 text-xs">Content Creator · 50K+ followers</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Users, label: "50K+", sub: "Creators" },
              { icon: Globe, label: "10", sub: "Platforms" },
              { icon: Sparkles, label: "Free", sub: "Forever" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={sub} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10">
                <Icon className="h-5 w-5 text-white/70 mx-auto mb-1" />
                <p className="text-white font-bold text-lg">{label}</p>
                <p className="text-white/60 text-xs">{sub}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-white/40 text-xs">
          © {new Date().getFullYear()} RepostAI · All rights reserved
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xl font-bold">{t("brandName")}</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">{t("auth.welcomeBack")}</h1>
            <p className="text-muted-foreground text-sm">{t("auth.loginSubtitle")}</p>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 font-medium gap-3 border-border/60 hover:bg-accent/50 transition-all"
            onClick={handleGoogleLogin}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {t("auth.continueGoogle")}
          </Button>

          <div className="relative">
            <Separator />
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
              {t("auth.or")}
            </span>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("auth.placeholderEmail")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Link href="/forgot-password" className="text-xs text-primary hover:underline font-medium">
                  {t("auth.forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={t("auth.placeholderPassword")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  {t("auth.signingIn")}
                </span>
              ) : t("auth.signIn")}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground">
            {t("auth.noAccount")}{" "}
            <Link href="/signup" className="text-primary hover:underline font-medium">
              {t("auth.signUpFree")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="w-full max-w-md space-y-4 p-8">
          <div className="h-8 w-32 animate-pulse bg-muted rounded-lg" />
          <div className="h-11 animate-pulse bg-muted rounded-lg" />
          <div className="h-11 animate-pulse bg-muted rounded-lg" />
          <div className="h-11 animate-pulse bg-muted rounded-lg" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
