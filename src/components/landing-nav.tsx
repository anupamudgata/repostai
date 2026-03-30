"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Zap, Menu, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useI18n } from "@/contexts/i18n-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

const NAV_HREFS = [
  { href: "#how-it-works", labelKey: "landingNav.howItWorks" },
  { href: "#features", labelKey: "landingNav.features" },
  { href: "/integrations", labelKey: "landingNav.integrations" },
  { href: "#pricing", labelKey: "landingNav.pricing" },
  { href: "#faq", labelKey: "landingNav.faq" },
] as const;

export function LandingNav() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 safe-area-pb transition-all duration-300 ${
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border/60 shadow-sm"
          : "bg-transparent backdrop-blur-sm"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow duration-300">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg sm:text-xl font-bold tracking-tight">{t("brandName")}</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-medium text-muted-foreground">
          {NAV_HREFS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors duration-200 relative group"
            >
              {t(link.labelKey)}
              <span className="absolute -bottom-0.5 left-0 w-0 h-[1.5px] bg-primary rounded-full group-hover:w-full transition-all duration-300" />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <LanguageSwitcher variant="compact" />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 shrink-0"
                aria-label={t("landingNav.openMenu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle className="sr-only">{t("common.menu")}</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 pt-6">
                {NAV_HREFS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 text-base"
                    >
                      {t(link.labelKey)}
                    </Button>
                  </Link>
                ))}
                <div className="border-t pt-4 mt-4 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full h-12">
                      {t("landingNav.logIn")}
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button className="w-full h-12">
                      {t("landingNav.startFree")}
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/login" className="hidden md:block">
            <Button variant="ghost" size="sm" className="min-h-[40px] font-medium">
              {t("landingNav.logIn")}
            </Button>
          </Link>
          <Link href="/signup" className="hidden md:block">
            <Button
              size="sm"
              className="min-h-[40px] shadow-lg shadow-primary/30 hover:shadow-primary/50 gap-1 font-semibold transition-all duration-300 hover:scale-[1.02]"
            >
              {t("landingNav.startFree")} <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
