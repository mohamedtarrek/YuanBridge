import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import SkyBackground from "@/components/SkyBackground";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "YuanBridge – Your Bridge to Chinese Shopping",
    template: "%s | YuanBridge",
  },
  description:
    "YuanBridge is a professional purchasing service that helps you buy products from Chinese marketplaces like Taobao, 1688, Tmall, JD, and Alibaba. We handle payment in CNY and arrange worldwide shipping.",
  keywords: [
    "Chinese shopping agent",
    "buy from Taobao",
    "China purchasing service",
    "YuanBridge",
    "CNY payment",
    "Chinese marketplace",
    "1688 agent",
    "Taobao agent",
  ],
  openGraph: {
    title: "YuanBridge – Your Bridge to Chinese Shopping",
    description:
      "Professional purchasing service for Chinese marketplaces. We buy for you, handle CNY payment, and ship worldwide.",
    type: "website",
    locale: "en_US",
    siteName: "YuanBridge",
  },
  twitter: {
    card: "summary_large_image",
    title: "YuanBridge – Your Bridge to Chinese Shopping",
    description:
      "Professional purchasing service for Chinese marketplaces. We buy for you, handle CNY payment, and ship worldwide.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} dir="ltr">
      <body className="min-h-full flex flex-col relative">
        <SkyBackground />
        <div className="relative z-10 flex flex-col min-h-full">
          <LanguageProvider>{children}</LanguageProvider>
        </div>
      </body>
    </html>
  );
}
