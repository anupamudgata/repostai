import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
