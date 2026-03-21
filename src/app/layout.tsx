import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Noto_Sans_Devanagari } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/contexts/i18n-provider";
import {
  defaultLocale,
  isLocale,
  LOCALE_COOKIE,
  type Locale,
} from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import en from "../../messages/en.json";
import hi from "../../messages/hi.json";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

const CATALOG: Record<Locale, Messages> = { en, hi };

export const metadata: Metadata = {
  title: "RepostAI - Repurpose Content for Every Platform in 60 Seconds",
  description:
    "Paste one piece of content. Get 10+ ready-to-post versions for LinkedIn, Twitter/X, Instagram, Email & more. AI-powered, brand-voice aware. Start free.",
  keywords: [
    "content repurposing",
    "AI content tool",
    "social media automation",
    "LinkedIn post generator",
    "Twitter thread generator",
    "content marketing",
  ],
  openGraph: {
    title: "RepostAI - Repurpose Content for Every Platform",
    description:
      "Paste one piece of content. Get 10+ ready-to-post versions for every platform. Under 60 seconds.",
    type: "website",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || "https://repostai.com"}/og.png`,
        width: 1200,
        height: 630,
        alt: "RepostAI - One post. Every platform. Under 60 seconds.",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const raw = jar.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;
  const messages = CATALOG[locale];

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          notoSansDevanagari.variable,
          locale === "hi" ? "font-app-hi" : inter.className,
          "antialiased"
        )}
        suppressHydrationWarning
      >
        <I18nProvider locale={locale} messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="bottom-right" />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
