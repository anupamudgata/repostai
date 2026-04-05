import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertToken } from "@/lib/social/token-store";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { accessToken?: string; phoneNumberId?: string; recipientPhone?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { accessToken, phoneNumberId, recipientPhone } = body;
  if (!accessToken || !phoneNumberId || !recipientPhone) {
    return NextResponse.json(
      { error: "accessToken, phoneNumberId, and recipientPhone are required" },
      { status: 400 }
    );
  }

  // Validate the access token by fetching the phone number details
  let displayPhoneNumber: string;
  try {
    const res = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}?fields=display_phone_number,verified_name`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const data = await res.json() as {
      display_phone_number?: string;
      verified_name?: string;
      error?: { message?: string };
    };
    if (!res.ok || data.error) {
      return NextResponse.json(
        { error: data.error?.message ?? "Invalid access token or phone number ID" },
        { status: 400 }
      );
    }
    displayPhoneNumber = data.display_phone_number ?? phoneNumberId;
  } catch {
    return NextResponse.json({ error: "Failed to validate WhatsApp credentials" }, { status: 502 });
  }

  await upsertToken(user.id, "whatsapp", {
    accessToken,
    platformUserId: phoneNumberId,
    platformUsername: recipientPhone,
    meta: { displayPhoneNumber },
  });

  return NextResponse.json({ success: true });
}
