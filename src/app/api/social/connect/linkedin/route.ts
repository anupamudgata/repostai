// src/app/api/social/connect/linkedin/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient }              from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect("/login");
  const state  = Buffer.from(JSON.stringify({ userId: user.id, platform: "linkedin" })).toString("base64");
  const params = new URLSearchParams({
    response_type: "code",
    client_id:     process.env.LINKEDIN_CLIENT_ID!,
    redirect_uri:  `${process.env.NEXT_PUBLIC_APP_URL}/api/social/callback/linkedin`,
    scope:         "openid profile email w_member_social",
    state,
  });
  return NextResponse.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
}
