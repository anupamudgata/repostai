"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Zap, Settings, LogOut, Crown, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";
import { AnalyticsEvent } from "@/lib/analytics/events";
import { useI18n } from "@/contexts/i18n-provider";
import { LanguageSwitcher } from "@/components/language-switcher";
import { cn } from "@/lib/utils";
import {
  DASHBOARD_NAV_LINKS,
  type DashboardNavLink,
} from "@/components/dashboard/nav-config";

const MOBILE_BOTTOM_HREFS = [
  "/dashboard",
  "/dashboard/history",
  "/dashboard/analytics",
  "/dashboard/connections",
  "/dashboard/brand-voice",
] as const;

function MobileBottomNav() {
  const { t } = useI18n();
  const pathname = usePathname();
  const links: DashboardNavLink[] = MOBILE_BOTTOM_HREFS.map((href) =>
    DASHBOARD_NAV_LINKS.find((l) => l.href === href)
  ).filter((l): l is DashboardNavLink => l != null);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[padding:max(0px)]:pb-[max(0.5rem,env(safe-area-inset-bottom))] pb-2 pt-1"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around max-w-lg mx-auto px-1">
        {links.map((link) => {
          const active = isActive(link.href, link.exact);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1 text-[10px] font-medium leading-tight",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                <link.icon
                  className={cn(
                    "h-5 w-5 shrink-0",
                    active ? "text-primary" : "opacity-70"
                  )}
                />
                <span
                  className={cn(
                    "h-1 w-1 shrink-0 rounded-full",
                    active ? "bg-primary" : "bg-transparent"
                  )}
                  aria-hidden
                />
              </div>
              <span className="line-clamp-2 max-w-[4.25rem] text-center">
                {t(link.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export interface DashboardSidebarUser {
  email: string;
  name: string;
  avatar_url?: string;
  plan: string;
  isSuperUser?: boolean;
}

const PLAN_BADGE: Record<string, string> = {
  free: "bg-muted/80 text-muted-foreground border-border",
  superuser: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25",
  starter: "bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/25",
  pro: "bg-primary/10 text-primary border-primary/25",
  agency: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/25",
};

function NavList({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const { t } = useI18n();
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <nav className={cn("flex flex-col gap-0.5", className)}>
      {DASHBOARD_NAV_LINKS.map((link) => {
        const active = isActive(link.href, link.exact);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
              active
                ? "nav-item-active bg-primary/10 text-primary shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
            )}
          >
            <link.icon className={cn(
              "h-4 w-4 shrink-0 transition-colors",
              active ? "text-primary" : "opacity-60"
            )} />
            <span className="truncate flex-1">{t(link.labelKey)}</span>
            {"badgeKey" in link && link.badgeKey && (
              <Badge
                variant="secondary"
                className={cn(
                  "text-[10px] px-1.5 py-0 h-5 font-medium shrink-0",
                  link.badgeKey === "nav.badgeNew" && "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
                  link.badgeKey === "nav.badgePro" && "bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20"
                )}
              >
                {t(link.badgeKey)}
              </Badge>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardSidebar({ user }: { user: DashboardSidebarUser }) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pulseUpgrade, setPulseUpgrade] = useState(false);

  useEffect(() => {
    if (user.plan !== "free") return;
    let cancelled = false;
    let pulseOffId: number | undefined;
    let restId: number | undefined;
    const cycle = () => {
      setPulseUpgrade(true);
      pulseOffId = window.setTimeout(() => {
        if (cancelled) return;
        setPulseUpgrade(false);
        restId = window.setTimeout(() => {
          if (cancelled) return;
          cycle();
        }, 10000);
      }, 3000);
    };
    cycle();
    return () => {
      cancelled = true;
      if (pulseOffId != null) window.clearTimeout(pulseOffId);
      if (restId != null) window.clearTimeout(restId);
    };
  }, [user.plan]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : (user.email?.[0] || "U").toUpperCase();

  const sidebarInner = (
    <>
      <div className="flex h-14 items-center gap-2 px-3 border-b border-sidebar-border shrink-0 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent pointer-events-none" />
        <Link
          href="/dashboard"
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-1 py-1 relative"
          onClick={() => setMobileOpen(false)}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/25">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-bold tracking-tight truncate bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{t("brandName")}</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-3 px-2">
        <NavList onNavigate={() => setMobileOpen(false)} />
      </div>

      <div className="border-t border-sidebar-border p-3 space-y-2.5 shrink-0">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-semibold",
            user.isSuperUser ? PLAN_BADGE.superuser : (PLAN_BADGE[user.plan] || PLAN_BADGE.free)
          )}
        >
          {(user.plan !== "free" || user.isSuperUser) && <Crown className="h-3.5 w-3.5 shrink-0" />}
          <span className="truncate">
            {user.isSuperUser ? "Super" : user.plan === "free" ? t("common.free") : user.plan.charAt(0).toUpperCase() + user.plan.slice(1) + " Plan"}
          </span>
        </div>
        {user.plan === "free" && (
          <Link href="/#pricing" onClick={() => track(AnalyticsEvent.UPGRADE_CLICKED, { source: "sidebar" })}>
            <Button
              size="sm"
              className={cn(
                "btn-generate w-full h-9 text-xs font-semibold border-0",
                pulseUpgrade && "animate-pulse"
              )}
            >
              <Crown className="h-3.5 w-3.5 mr-1.5" />
              {t("nav.upgrade")}
            </Button>
          </Link>
        )}
        <LanguageSwitcher variant="compact" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center gap-2.5 rounded-lg p-2 text-left text-sm hover:bg-sidebar-accent/50 transition-all duration-200 group"
              aria-label="Account"
            >
              <div className="h-8 w-8 shrink-0 rounded-full p-0.5 bg-gradient-to-br from-primary/40 to-primary/20 group-hover:from-primary/60 group-hover:to-primary/30 transition-all">
                <Avatar className="h-full w-full">
                  <AvatarImage src={user.avatar_url} alt="" />
                  <AvatarFallback className="text-xs bg-muted font-semibold text-primary">{initials}</AvatarFallback>
                </Avatar>
              </div>
              <span className="truncate flex-1 min-w-0 text-sidebar-foreground text-xs font-medium">{user.name || user.email}</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="gap-2 cursor-pointer">
                <Settings className="h-4 w-4" />
                {t("common.settings")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              {t("common.logOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-3 backdrop-blur lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[min(100%,280px)] p-0 flex flex-col bg-sidebar text-sidebar-foreground">
            <SheetHeader className="sr-only">
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            {sidebarInner}
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <span className="font-semibold truncate">{t("brandName")}</span>
        </Link>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shrink-0">
        {sidebarInner}
      </aside>
    </>
  );
}

export function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: DashboardSidebarUser;
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <DashboardSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 min-h-0 dashboard-bg">
        <main className="flex-1 w-full pb-[4.5rem] lg:pb-0">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
