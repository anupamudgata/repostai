import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  bootstrapProfileFromAuthAdmin,
  ensureProfileForRepurposeInsert,
} from "@/lib/supabase/ensure-profile";
import { SUPERUSER_EMAIL } from "@/config/constants";
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

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    try {
      await ensureProfileForRepurposeInsert(user, supabase);
      const refetch = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();
      profile = refetch.data;
    } catch (e) {
      console.error("[dashboard/layout] ensureProfileForRepurposeInsert:", e);
    }
  }
  if (!profile) {
    await bootstrapProfileFromAuthAdmin(user.id);
    const { data: refetch2 } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();
    profile = refetch2 ?? profile;
  }

  const isSuperUser = user.email === SUPERUSER_EMAIL;
  const plan = isSuperUser ? "pro" : (profile?.plan || "free");

  return (
    <DashboardShell
      user={{
        email: user.email || "",
        name: profile?.name || user.user_metadata?.full_name || "",
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
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
