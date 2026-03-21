"use client";

import { useEffect } from "react";

/** Client redirect so hash #pricing works (server redirect() drops fragments). */
export default function PricingPage() {
  useEffect(() => {
    window.location.replace("/#pricing");
  }, []);
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
      Taking you to pricing…
    </div>
  );
}
