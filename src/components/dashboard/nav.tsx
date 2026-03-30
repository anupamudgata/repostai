"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Zap,
  LayoutDashboard,
  History,
  Mic,
  Settings,
  LogOut,
  Sparkles,
  Menu,
  X,
  Link2,
  CalendarClock,
  Plug,
  BarChart3,
  Bot,
  ImagePlus,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { useI18n } from "@/contexts/i18n-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";

interface NavProps {
  user: {
    email: string;
    name: string;
    avatar_url?: string;
    plan: string;
  };
}

const NAV_LINKS = [
  { href: "/dashboard", labelKey: "nav.repurpose", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/agent", labelKey: "nav.contentAgent", icon: Bot, badgeKey: "nav.badgeNew" },
  { href: "/dashboard/create", labelKey: "nav.create", icon: Sparkles, badgeKey: "nav.badgePro" },
  { href: "/dashboard/photos", labelKey: "nav.photos", icon: ImagePlus },
  { href: "/dashboard/history", labelKey: "nav.history", icon: History },
  { href: "/dashboard/connections", labelKey: "nav.connections", icon: Link2 },
  { href: "/dashboard/scheduled", labelKey: "nav.calendar", icon: CalendarClock },
  { href: "/dashboard/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { href: "/integrations", labelKey: "nav.integrations", icon: Plug },
  { href: "/dashboard/brand-voice", labelKey: "nav.brandVoice", icon: Mic },
] as const;

const PLAN_COLORS: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  starter: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  pro: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  agency: "bg-violet-500/10 text-violet-600 border-violet-500/20",
};

export function DashboardNav({ user }: NavProps) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase()
    : (user.email?.[0] || "U").toUpperCase();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Zap className="h-4.5 w-4.5 text-primary" />
            </div>
            <span className="font-bold tracking-tight">{t("brandName")}</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href, "exact" in link ? link.exact : false);
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "gap-1.5 text-xs font-medium transition-all rounded-lg px-2.5",
                      active
                        ? "bg-primary/8 text-primary hover:bg-primary/12"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                    )}
                  >
                    <link.icon className={cn("h-3.5 w-3.5", active && "text-primary")} />
                    {t(link.labelKey)}
                    {"badgeKey" in link && link.badgeKey && (
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-[9px] px-1.5 py-0 h-4 font-semibold",
                          link.badgeKey === "nav.badgeNew" && "bg-green-500/10 text-green-600 border-green-500/20",
                          link.badgeKey === "nav.badgePro" && "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        )}
                      >
                        {t(link.badgeKey)}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Plan badge */}
          <span className={cn(
            "hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border",
            PLAN_COLORS[user.plan] || PLAN_COLORS.free
          )}>
            {user.plan !== "free" && <Crown className="h-3 w-3" />}
            {user.plan === "free" ? t("common.free") : user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
          </span>

          {user.plan === "free" && (
            <Link href="/#pricing" onClick={() => track(AnalyticsEvent.UPGRADE_CLICKED, { source: "nav" })}>
              <Button size="sm" className="h-8 px-3 text-xs gap-1.5 bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 shadow-sm font-semibold">
                <Zap className="h-3 w-3" />
                Upgrade
              </Button>
            </Link>
          )}

          <LanguageSwitcher variant="compact" />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 ring-2 ring-transparent hover:ring-primary/20 transition-all" aria-label="Account menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} alt={user.name || "Profile"} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 p-1.5">
              <div className="px-2.5 py-2 mb-1">
                <p className="text-sm font-semibold">{user.name || "User"}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="gap-2 cursor-pointer rounded-md">
                <Link href="/dashboard/settings">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  {t("common.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer rounded-md text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4" />
                {t("common.logOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background/98 backdrop-blur-md px-4 py-3 space-y-0.5">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href, "exact" in link ? link.exact : false);
            return (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 h-10 text-sm font-medium rounded-lg",
                    active
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <link.icon className={cn("h-4 w-4", active && "text-primary")} />
                  {t(link.labelKey)}
                  {"badgeKey" in link && link.badgeKey && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-auto">
                      {t(link.badgeKey)}
                    </Badge>
                  )}
                </Button>
              </Link>
            );
          })}
          <Link href="/dashboard/settings" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm text-muted-foreground hover:text-foreground rounded-lg">
              <Settings className="h-4 w-4" />
              {t("common.settings")}
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
