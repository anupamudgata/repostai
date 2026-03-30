import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SUPERUSER_EMAIL } from "@/config/constants";
import { DashboardNav } from "@/components/dashboard/nav";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const isSuperUser = user.email === SUPERUSER_EMAIL;
  const plan = isSuperUser ? "pro" : (profile?.plan || "free");

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav
        user={{
          email: user.email || "",
          name: profile?.name || user.user_metadata?.full_name || "",
          avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
          plan,
        }}
      />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 animate-page-in">
        {children}
      </main>
      <SupportChatWidget />
    </div>
  );
}
