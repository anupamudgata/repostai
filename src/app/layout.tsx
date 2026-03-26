import type { Metadata } from "next";
import { cookies } from "next/headers";
import {
  Inter,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Gurmukhi,
  Noto_Sans_Kannada,
  Noto_Sans_Oriya,
  Noto_Sans_Telugu,
} from "next/font/google";
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
  subsets: ["devanagari", "latin", "latin-ext"],
  variable: "--font-noto-devanagari",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali", "latin", "latin-ext"],
  variable: "--font-noto-bengali",
  display: "swap",
});

const notoSansKannada = Noto_Sans_Kannada({
  subsets: ["kannada", "latin", "latin-ext"],
  variable: "--font-noto-kannada",
  display: "swap",
});

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi", "latin", "latin-ext"],
  variable: "--font-noto-gurmukhi",
  display: "swap",
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu", "latin", "latin-ext"],
  variable: "--font-noto-telugu",
  display: "swap",
});

const notoSansOriya = Noto_Sans_Oriya({
  subsets: ["oriya", "latin", "latin-ext"],
  variable: "--font-noto-oriya",
  display: "swap",
});

const fontVariables = [
  inter.variable,
  notoSansDevanagari.variable,
  notoSansBengali.variable,
  notoSansKannada.variable,
  notoSansGurmukhi.variable,
  notoSansTelugu.variable,
  notoSansOriya.variable,
] as const;

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
    "social media tool India",
    "content repurpose AI",
    "Instagram caption generator",
    "WhatsApp status generator",
  ],
  openGraph: {
    title: "RepostAI - Repurpose Content for Every Platform",
    description:
      "Paste one piece of content. Get 10+ ready-to-post versions for every platform. Under 60 seconds.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RepostAI - One post. Every platform. Under 60 seconds.",
    description:
      "AI-powered content repurposing for LinkedIn, Twitter/X, Instagram, and 6 more platforms.",
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
    <html
      lang={locale}
      className={cn(...fontVariables, locale === "hi" && "locale-hi")}
      suppressHydrationWarning
    >
      <body
        className={cn(
          locale === "hi" ? "font-app-hi" : "font-app-en",
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
