export function welcomeEmailHtml(firstName: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://repostai.com";
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Welcome to RepostAI</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;color:#111827;}
.wrapper{max-width:600px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;}
.header{background:#1E3A5F;padding:36px 40px;text-align:center;}
.logo{font-size:28px;font-weight:700;color:#fff;letter-spacing:-0.5px;}
.logo span{color:#60A5FA;}
.tagline{font-size:13px;color:#93C5FD;margin-top:6px;}
.body{padding:40px 40px 32px;}
.greeting{font-size:22px;font-weight:600;color:#111827;margin-bottom:12px;}
.intro{font-size:15px;line-height:1.7;color:#374151;margin-bottom:28px;}
.steps-title{font-size:13px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:16px;}
.step{display:flex;align-items:flex-start;gap:14px;margin-bottom:18px;}
.step-num{width:28px;height:28px;background:#EFF6FF;border-radius:50%;font-size:13px;font-weight:600;color:#1E3A5F;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:28px;text-align:center;}
.step-title{font-size:14px;font-weight:600;color:#111827;margin-bottom:2px;}
.step-desc{font-size:13px;color:#6B7280;line-height:1.5;}
.cta-block{text-align:center;margin:32px 0 24px;}
.cta-btn{display:inline-block;background:#2563EB;color:#fff!important;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:8px;}
.free-note{font-size:13px;color:#9CA3AF;text-align:center;margin-top:10px;}
.divider{height:1px;background:#F3F4F6;margin:28px 0;}
.founder{display:flex;align-items:flex-start;gap:14px;background:#F9FAFB;border-radius:10px;padding:18px;border:1px solid #E5E7EB;}
.avatar{width:44px;height:44px;border-radius:50%;background:#1E3A5F;font-size:16px;font-weight:600;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;text-align:center;line-height:44px;}
.founder-name{font-size:13px;font-weight:600;color:#111827;margin-bottom:4px;}
.founder-msg{font-size:13px;color:#374151;line-height:1.6;}
.footer{background:#F9FAFB;padding:24px 40px;text-align:center;border-top:1px solid #E5E7EB;}
.footer-links{font-size:12px;color:#9CA3AF;margin-bottom:8px;}
.footer-links a{color:#6B7280;text-decoration:none;margin:0 8px;}
.footer-copy{font-size:12px;color:#D1D5DB;}
</style>
</head>
<body>
<div class="wrapper">
<div class="header">
<div class="logo">Repost<span>AI</span></div>
<div class="tagline">One post. Every platform. Under 60 seconds.</div>
</div>
<div class="body">
<p class="greeting">Welcome, ${firstName}!</p>
<p class="intro">You have joined RepostAI — the fastest way to turn one piece of content into posts for LinkedIn, Twitter/X, Instagram, Facebook, Email, and Reddit, all at once. Your free account is ready.</p>
<p class="steps-title">Do these 3 things right now</p>
<div class="step"><div class="step-num">1</div><div><p class="step-title">Do your first repurpose</p><p class="step-desc">Paste any blog post, YouTube link, or plain text. Pick your platforms. Hit Repurpose. Takes under 60 seconds.</p></div></div>
<div class="step"><div class="step-num">2</div><div><p class="step-title">Set up your brand voice</p><p class="step-desc">Paste 3-5 examples of your writing. Every output will sound like you, not a robot.</p></div></div>
<div class="step"><div class="step-num">3</div><div><p class="step-title">Save hours every week</p><p class="step-desc">Your free plan includes 5 repurposes per month. When you are ready for unlimited, upgrade to Pro for $19/mo.</p></div></div>
<div class="cta-block"><a href="${appUrl}/dashboard" class="cta-btn">Start your first repurpose</a><p class="free-note">No credit card needed to start.</p></div>
<div class="divider"></div>
<div class="founder"><div class="avatar">A</div><div><p class="founder-name">Anupam — Founder, RepostAI</p><p class="founder-msg">I built this because I was tired of spending hours reformatting one blog post for every platform. If you hit any issues or have feedback, reply to this email — it goes straight to me and I read every message.</p></div></div>
</div>
<div class="footer">
<div class="footer-links"><a href="${appUrl}/dashboard">Dashboard</a><a href="${appUrl}/pricing">Pricing</a><a href="mailto:support@repostai.com">Support</a><a href="${appUrl}/privacy">Privacy</a></div>
<p class="footer-copy">&copy; ${new Date().getFullYear()} RepostAI. All rights reserved.</p>
</div>
</div>
</body>
</html>`.trim();
}
