"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Scissors,
  ImagePlus,
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
import { useI18n } from "@/contexts/i18n-provider";
import { LanguageSwitcher } from "@/components/language-switcher";

interface NavProps {
  user: {
    email: string;
    name: string;
    avatar_url?: string;
    plan: string;
  };
}

const NAV_LINKS = [
  { href: "/dashboard", labelKey: "nav.repurpose", icon: LayoutDashboard },
  {
    href: "/dashboard/agent",
    labelKey: "nav.contentAgent",
    icon: Bot,
    badgeKey: "nav.badgeNew",
  },
  {
    href: "/dashboard/clips",
    labelKey: "nav.videoClips",
    icon: Scissors,
  },
  {
    href: "/dashboard/create",
    labelKey: "nav.create",
    icon: Sparkles,
    badgeKey: "nav.badgePro",
  },
  { href: "/dashboard/photos", labelKey: "nav.photos", icon: ImagePlus },
  { href: "/dashboard/history", labelKey: "nav.history", icon: History },
  { href: "/dashboard/connections", labelKey: "nav.connections", icon: Link2 },
  { href: "/dashboard/scheduled", labelKey: "nav.calendar", icon: CalendarClock },
  { href: "/dashboard/analytics", labelKey: "nav.analytics", icon: BarChart3 },
  { href: "/integrations", labelKey: "nav.integrations", icon: Plug },
  { href: "/dashboard/brand-voice", labelKey: "nav.brandVoice", icon: Mic },
] as const;

export function DashboardNav({ user }: NavProps) {
  const { t } = useI18n();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  return (
    <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold">{t("brandName")}</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <link.icon className="h-4 w-4" />
                  {t(link.labelKey)}
                  {"badgeKey" in link && link.badgeKey && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {t(link.badgeKey)}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={user.plan === "free" ? "secondary" : "default"}>
            {user.plan === "free"
              ? t("common.free")
              : user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
          </Badge>

          <LanguageSwitcher variant="compact" />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account menu">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} alt={user.name || "Profile"} />
                  <AvatarFallback className="text-xs">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  {t("common.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                {t("common.logOut")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              <Button variant="ghost" className="w-full justify-start gap-2">
                <link.icon className="h-4 w-4" />
                {t(link.labelKey)}
                {"badgeKey" in link && link.badgeKey && (
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {t(link.badgeKey)}
                  </Badge>
                )}
              </Button>
            </Link>
          ))}
          <Link href="/dashboard/settings" onClick={() => setMobileOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Settings className="h-4 w-4" />
              {t("common.settings")}
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}
