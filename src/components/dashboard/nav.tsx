"use client";

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

interface NavProps {
  user: {
    email: string;
    name: string;
    avatar_url?: string;
    plan: string;
  };
}

export function DashboardNav({ user }: NavProps) {
  const router = useRouter();
  const supabase = createClient();

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
    : user.email[0].toUpperCase();

  return (
    <nav className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            <span className="font-bold">RepostAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Repurpose
              </Button>
            </Link>
            <Link href="/dashboard/create">
              <Button variant="ghost" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Create
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  PRO
                </Badge>
              </Button>
            </Link>
            <Link href="/dashboard/history">
              <Button variant="ghost" size="sm" className="gap-2">
                <History className="h-4 w-4" />
                History
              </Button>
            </Link>
            <Link href="/dashboard/brand-voice">
              <Button variant="ghost" size="sm" className="gap-2">
                <Mic className="h-4 w-4" />
                Brand Voice
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant={user.plan === "free" ? "secondary" : "default"}>
            {user.plan === "free" ? "Free" : user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} />
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
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
