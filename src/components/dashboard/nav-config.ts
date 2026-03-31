import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  History,
  Mic,
  Sparkles,
  Link2,
  CalendarClock,
  Plug,
  BarChart3,
  Bot,
  ImagePlus,
} from "lucide-react";

export type DashboardNavLink = {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  exact?: boolean;
  badgeKey?: string;
};

export const DASHBOARD_NAV_LINKS: readonly DashboardNavLink[] = [
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
