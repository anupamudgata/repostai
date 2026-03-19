import { redirect } from "next/navigation";

/** Redirect /pricing to landing page pricing section */
export default function PricingPage() {
  redirect("/#pricing");
}
