export function proUpgradeEmailHtml(firstName: string, plan: "starter" | "pro" | "agency"): string {
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? "https://repostai.com";

  const planConfig = {
    starter: {
      name: "Starter",
      price: "₹199",
      color: "#0D9488",
      bg: "#F0FDFA",
      border: "#99F6E4",
      text: "#134E4A",
      features: ["10 repurposes per month", "All 9 platforms", "GPT-4o-mini", "No watermark", "1 brand voice", "Photo captions (10/mo)"],
    },
    pro: {
      name: "Pro",
      price: "₹499",
      color: "#2563EB",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      text: "#1E3A5F",
      features: ["60 repurposes per month", "All 9 platforms", "Claude Sonnet (premium AI)", "3 brand voices", "AI Content Starter", "Photo captions (40/mo)", "No watermark", "Priority support"],
    },
    agency: {
      name: "Agency",
      price: "₹1,499",
      color: "#7C3AED",
      bg: "#F5F3FF",
      border: "#DDD6FE",
      text: "#4C1D95",
      features: ["Unlimited repurposes", "All 9 platforms", "Claude Sonnet (premium AI)", "5 brand voices", "AI Content Starter", "Unlimited photo captions", "Team & API (roadmap)", "Dedicated support"],
    },
  } as const;

  const cfg = planConfig[plan];
  const planName   = cfg.name;
  const planPrice  = cfg.price;
  const planColor  = cfg.color;
  const planBg     = cfg.bg;
  const planBorder = cfg.border;
  const planText   = cfg.text;
  const features   = cfg.features;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>You are now on RepostAI ${planName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f5;color:#111827;}
.wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;}
.header{background:#1E3A5F;padding:36px 40px;text-align:center;}
.logo{font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px;}
.logo span{color:#60A5FA;}
.body{padding:40px 40px 32px;}
.badge-wrap{text-align:center;margin-bottom:24px;}
.badge{display:inline-block;background:${planBg};border:1px solid ${planBorder};color:${planText};font-size:13px;font-weight:600;padding:6px 16px;border-radius:999px;}
.greeting{font-size:22px;font-weight:600;color:#111827;margin-bottom:12px;}
.intro{font-size:15px;line-height:1.7;color:#374151;margin-bottom:28px;}
.plan-card{background:${planBg};border:1px solid ${planBorder};border-radius:10px;padding:24px;margin-bottom:28px;}
.plan-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.plan-title{font-size:18px;font-weight:700;color:${planText};}
.plan-price{font-size:15px;font-weight:600;color:${planText};}
.feature-list{list-style:none;}
.feature-item{font-size:14px;color:${planText};padding:5px 0;display:flex;align-items:center;gap:10px;line-height:1.5;}
.check{width:18px;height:18px;background:${planColor};border-radius:50%;flex-shrink:0;display:inline-flex;align-items:center;justify-content:center;font-size:10px;color:#fff;line-height:1;text-align:center;}
.cta-block{text-align:center;margin:0 0 28px;}
.cta-btn{display:inline-block;background:${planColor};color:#fff!important;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;}
.help-note{font-size:13px;color:#9CA3AF;text-align:center;margin-top:10px;line-height:1.5;}
.help-note a{color:#6B7280;}
.divider{height:1px;background:#F3F4F6;margin:28px 0;}
.billing-box{background:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:18px 20px;font-size:13px;color:#374151;line-height:1.7;}
.billing-box strong{color:#111827;}
.billing-box a{color:#2563EB;text-decoration:none;}
.footer{background:#F9FAFB;padding:24px 40px;text-align:center;border-top:1px solid #E5E7EB;}
.footer-links{font-size:12px;color:#9CA3AF;margin-bottom:8px;}
.footer-links a{color:#6B7280;text-decoration:none;margin:0 8px;}
.footer-copy{font-size:12px;color:#D1D5DB;}
</style>
</head>
<body>
<div class="wrapper">
<div class="header"><div class="logo">Repost<span>AI</span></div></div>
<div class="body">
<div class="badge-wrap"><span class="badge">${planName} plan activated</span></div>
<p class="greeting">You are on ${planName}, ${firstName}!</p>
<p class="intro">Your payment went through and your ${planName} features are live right now. Here is everything that just unlocked for you.</p>
<div class="plan-card">
<div class="plan-header"><span class="plan-title">RepostAI ${planName}</span><span class="plan-price">${planPrice}/month</span></div>
<ul class="feature-list">${features.map(f => `<li class="feature-item"><span class="check">&#10003;</span>${f}</li>`).join("")}</ul>
</div>
<div class="cta-block"><a href="${appUrl}/dashboard" class="cta-btn">Start repurposing now</a><p class="help-note">Questions? Reply to this email or write to <a href="mailto:support@repostai.com">support@repostai.com</a></p></div>
<div class="divider"></div>
<div class="billing-box"><strong>Your billing details</strong><br/>Your card will be charged <strong>${planPrice}/month</strong> on the same date each month. You can cancel anytime from your <a href="${appUrl}/dashboard/settings">account settings</a> — no questions asked. We also offer a <strong>14-day money-back guarantee</strong>. If you are not saving time, email us and we will refund you in full.</div>
</div>
<div class="footer"><div class="footer-links"><a href="${appUrl}/dashboard">Dashboard</a><a href="${appUrl}/pricing">Pricing</a><a href="mailto:support@repostai.com">Support</a><a href="${appUrl}/privacy">Privacy</a></div><p class="footer-copy">&copy; ${new Date().getFullYear()} RepostAI. All rights reserved.<br/>You received this because you upgraded your RepostAI account.</p></div>
</div>
</body>
</html>`.trim();
}
