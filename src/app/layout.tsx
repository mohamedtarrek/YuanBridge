import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientLayout } from './client-layout';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'YuanBridge AI - AI-Powered Forex Trading Strategies',
    template: '%s | YuanBridge AI',
  },
  description: 'AI-powered Forex trading strategies platform. Artificial Intelligence analyzes the Forex market 24/7 and generates professional trading strategies with high success probability.',
  keywords: ['Forex', 'Trading', 'AI', 'Artificial Intelligence', 'Forex Strategies', 'Trading Signals', 'Forex Analysis'],
  authors: [{ name: 'YuanBridge AI' }],
  openGraph: {
    title: 'YuanBridge AI - AI-Powered Forex Trading Strategies',
    description: 'Artificial Intelligence analyzes the Forex market 24/7 and generates professional trading strategies.',
    siteName: 'YuanBridge AI',
    type: 'website',
    locale: 'ar_SA',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'YuanBridge AI - AI-Powered Forex Trading Strategies',
    description: 'Artificial Intelligence analyzes the Forex market 24/7 and generates professional trading strategies.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'verification_token',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-surface-dark`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
