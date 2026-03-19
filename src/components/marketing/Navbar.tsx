"use client";

// src/components/marketing/Navbar.tsx
// FIX #1: All nav links now use hash anchors that scroll to sections on landing page
// FIX #12: Dev tools hidden — no dev-only elements in this component

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Features",     href: "/#features"     },
  { label: "Pricing",      href: "/#pricing"       },
  { label: "FAQ",          href: "/#faq"           },
];

export function MarketingNavbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Smooth scroll to section when on landing page
  function handleNavClick(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (isLanding && href.startsWith("/#")) {
      e.preventDefault();
      const id = href.slice(2); // strip "/#"
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        setMenuOpen(false);
      }
    }
  }

  return (
    <header
      style={{
        position:        "fixed",
        top:             0,
        left:            0,
        right:           0,
        zIndex:          50,
        background:      scrolled ? "rgba(255,255,255,0.95)" : "transparent",
        backdropFilter:  scrolled ? "blur(12px)" : "none",
        borderBottom:    scrolled ? "0.5px solid #E5E7EB" : "none",
        transition:      "all 0.2s ease",
      }}
    >
      <div
        style={{
          maxWidth:        "1200px",
          margin:          "0 auto",
          padding:         "0 24px",
          height:          "64px",
          display:         "flex",
          alignItems:      "center",
          justifyContent:  "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: "20px", fontWeight: 800, color: "#1E3A5F", letterSpacing: "-0.5px" }}>
            Repost<span style={{ color: "#2563EB" }}>AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: "32px" }}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              style={{
                fontSize:       "14px",
                fontWeight:     500,
                color:          "#374151",
                textDecoration: "none",
                transition:     "color .15s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#2563EB"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#374151"; }}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTA buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Link
            href="/login"
            style={{
              fontSize:       "14px",
              fontWeight:     500,
              color:          "#374151",
              textDecoration: "none",
              padding:        "8px 16px",
            }}
          >
            Log in
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize:        "14px",
              fontWeight:      600,
              color:           "#FFFFFF",
              textDecoration:  "none",
              padding:         "9px 20px",
              borderRadius:    "8px",
              background:      "#2563EB",
              transition:      "background .15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#1D4ED8"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#2563EB"; }}
          >
            Start Free
          </Link>
        </div>
      </div>
    </header>
  );
}
