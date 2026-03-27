import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getPlanFromRazorpayPlanId } from "@/lib/razorpay/helpers";
import { getRazorpay } from "@/lib/razorpay/client";
import { sendUpgradeEmail } from "@/lib/email/send";
import crypto from "crypto";

function verifyWebhookSignature(body: string, signature: string): boolean {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error("[razorpay webhook] RAZORPAY_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 }
    );
  }

  const signature = request.headers.get("X-Razorpay-Signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: { event: string; payload?: { subscription?: { entity?: Record<string, unknown> }; payment?: { entity?: Record<string, unknown> } } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    if (event.event === "subscription.activated") {
      const sub = event.payload?.subscription?.entity as {
        id: string;
        plan_id?: string;
        status?: string;
        notes?: { user_id?: string };
        current_end?: number;
      } | undefined;
      if (sub?.notes?.user_id && sub.id) {
        let planId = sub.plan_id;
        let status = sub.status;
        let currentEnd = sub.current_end;
        if (!status || status !== "active") {
          const fetched = (await getRazorpay().subscriptions.fetch(sub.id)) as {
            plan_id?: string;
            status?: string;
            current_end?: number;
          };
          status = fetched.status;
          planId = fetched.plan_id ?? planId;
          currentEnd = fetched.current_end ?? currentEnd;
        }
        if (status !== "active") {
          console.warn(
            `[razorpay webhook] Ignoring subscription.activated for ${sub.id} (status=${status})`
          );
        } else {
          const plan = getPlanFromRazorpayPlanId(planId);
          if (plan === "free") {
            console.warn(
              `[razorpay webhook] Unknown plan_id for activated ${sub.id}:`,
              planId
            );
          } else {
            const periodEnd = currentEnd
              ? new Date(currentEnd * 1000).toISOString()
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

            await supabaseAdmin.from("profiles").update({
              plan,
              stripe_customer_id: `rzp_${sub.id}`,
            }).eq("id", sub.notes.user_id);

            await supabaseAdmin.from("subscriptions").upsert({
              user_id: sub.notes.user_id,
              stripe_subscription_id: sub.id,
              plan,
              status: "active",
              current_period_end: periodEnd,
            }, { onConflict: "stripe_subscription_id" });

            try {
              if (plan === "starter" || plan === "pro" || plan === "agency") {
                const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(sub.notes.user_id);
                if (user?.email) {
                  const fullName = (user.user_metadata?.full_name as string) ?? "";
                  const firstName = fullName.split(" ")[0] || user.email.split("@")[0];
                  await sendUpgradeEmail({ email: user.email, firstName, plan });
                }
              }
            } catch (emailErr) {
              console.error("[razorpay webhook] Upgrade email failed:", emailErr);
            }
          }
        }
      }
    } else if (event.event === "subscription.charged") {
      const sub = event.payload?.subscription?.entity as {
        id: string;
        plan_id?: string;
        notes?: { user_id?: string };
        current_end?: number;
      } | undefined;
      if (sub?.notes?.user_id && sub.id) {
        const periodEnd = sub.current_end
          ? new Date(sub.current_end * 1000).toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        let planId = sub.plan_id;
        if (!planId) {
          const fetched = (await getRazorpay().subscriptions.fetch(sub.id)) as {
            plan_id?: string;
          };
          planId = fetched.plan_id;
        }
        const plan = getPlanFromRazorpayPlanId(planId);
        if (plan !== "free") {
          await supabaseAdmin.from("profiles").update({
            plan,
            stripe_customer_id: `rzp_${sub.id}`,
          }).eq("id", sub.notes.user_id);

          await supabaseAdmin.from("subscriptions").upsert({
            user_id: sub.notes.user_id,
            stripe_subscription_id: sub.id,
            plan,
            status: "active",
            current_period_end: periodEnd,
          }, { onConflict: "stripe_subscription_id" });
        } else {
          await supabaseAdmin
            .from("subscriptions")
            .update({ current_period_end: periodEnd, status: "active" })
            .eq("stripe_subscription_id", sub.id);
        }
      }
    } else if (event.event === "subscription.pending") {
      const sub = event.payload?.subscription?.entity as {
        id: string;
        notes?: { user_id?: string };
      } | undefined;
      if (sub?.notes?.user_id) {
        console.warn(
          `[razorpay webhook] Subscription ${sub.id} payment pending for user ${sub.notes.user_id}`
        );
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "pending" })
          .eq("stripe_subscription_id", sub.id);
      }
    } else if (event.event === "subscription.halted") {
      const sub = event.payload?.subscription?.entity as {
        id: string;
      } | undefined;
      if (sub?.id) {
        const { data: row } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .single();

        if (row) {
          await supabaseAdmin
            .from("profiles")
            .update({ plan: "free" })
            .eq("id", row.user_id);
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "halted" })
            .eq("stripe_subscription_id", sub.id);
        }
      }
    } else if (event.event === "subscription.cancelled" || event.event === "subscription.completed") {
      const sub = event.payload?.subscription?.entity as { id: string } | undefined;
      if (sub?.id) {
        const { data: row } = await supabaseAdmin
          .from("subscriptions")
          .select("user_id")
          .eq("stripe_subscription_id", sub.id)
          .single();

        if (row) {
          await supabaseAdmin.from("profiles").update({ plan: "free" }).eq("id", row.user_id);
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", sub.id);
        }
      }
    } else if (event.event === "payment.failed") {
      const payment = event.payload?.payment?.entity as {
        id: string;
        method?: string;
        error_code?: string;
        error_description?: string;
        notes?: { user_id?: string };
      } | undefined;
      console.error("[razorpay webhook] Payment failed:", {
        payment_id: payment?.id,
        method: payment?.method,
        error_code: payment?.error_code,
        error_description: payment?.error_description,
        user_id: payment?.notes?.user_id ?? "unknown",
      });
    }
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
