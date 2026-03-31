import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getEffectivePlan } from "@/lib/billing/plan-entitlements";
import {
  getOrCreateUserProfile,
  getProfileDisplayFromAdmin,
} from "@/lib/supabase/ensure-profile";
import { DashboardShell } from "@/components/dashboard/dashboard-sidebar";
import { SupportChatWidget } from "@/components/support/SupportChatWidget";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const profileBootstrap = await getOrCreateUserProfile(user, supabase);
  if (!profileBootstrap.ok) {
    console.error("[dashboard/layout] getOrCreateUserProfile:", profileBootstrap);
  }

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  let name =
    profile?.name ?? (user.user_metadata?.full_name as string | undefined) ?? "";
  let avatar_url =
    profile?.avatar_url ?? (user.user_metadata?.avatar_url as string | undefined);

  if (!profile) {
    const fromAdmin = await getProfileDisplayFromAdmin(user.id);
    if (fromAdmin) {
      name = name || fromAdmin.name || "";
      avatar_url = avatar_url || fromAdmin.avatar_url || undefined;
    }
  }

  const { plan } = await getEffectivePlan(
    supabase,
    user.id,
    user.email ?? undefined
  );

  return (
    <DashboardShell
      user={{
        email: user.email || "",
        name,
        avatar_url,
        plan,
      }}
    >
      <>
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 animate-page-in">
          {children}
        </div>
        <SupportChatWidget />
      </>
    </DashboardShell>
  );
}
