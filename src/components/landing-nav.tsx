"use client";

import { useState } from "react";
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

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "/integrations", label: "Integrations" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b bg-background/80 backdrop-blur-lg sticky top-0 z-50 safe-area-pb">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 sm:h-16">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Zap className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg sm:text-xl font-bold">RepostAI</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 lg:gap-8 text-sm text-muted-foreground">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden h-10 w-10 shrink-0"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle className="sr-only">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 pt-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className="w-full justify-start h-12 text-base"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <div className="border-t pt-4 mt-4 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    <Button variant="outline" className="w-full h-12">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    <Button className="w-full h-12">
                      Start Free
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <Link href="/login" className="hidden md:block">
            <Button variant="ghost" size="sm" className="min-h-[40px]">
              Log in
            </Button>
          </Link>
          <Link href="/signup" className="hidden md:block">
            <Button size="sm" className="min-h-[40px] shadow-md shadow-primary/25 gap-1">
              Start Free <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
