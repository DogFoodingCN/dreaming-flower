import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteThemeProvider } from "@/components/site/SiteThemeProvider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "katex/dist/katex.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "D F .CN",
  description:
    "Dreaming Flower is a personal galaxy for IP building, product experience, and blog output.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <SiteThemeProvider>{children}</SiteThemeProvider>
      </body>
      <Analytics />
      <SpeedInsights />
    </html>
  );
}
