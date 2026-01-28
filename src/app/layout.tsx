import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export const metadata: Metadata = {
  title: {
    default: "TimeWizard - Inteligentny planer zadań",
    template: "%s | TimeWizard",
  },
  description: "Optymalizuj swój harmonogram dnia i tygodnia z TimeWizard. Inteligentne planowanie zadań na podstawie priorytetów, deadline'ów i Twojej dostępności.",
  keywords: ["planer zadań", "harmonogram", "produktywność", "time management", "zarządzanie czasem", "todo", "task manager"],
  authors: [{ name: "TimeWizard Team" }],
  creator: "TimeWizard",
  publisher: "TimeWizard",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pl_PL',
    url: '/',
    siteName: 'TimeWizard',
    title: 'TimeWizard - Inteligentny planer zadań',
    description: 'Optymalizuj swój harmonogram dnia i tygodnia. Inteligentne planowanie zadań na podstawie priorytetów, deadline\'ów i Twojej dostępności.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'TimeWizard - Inteligentny planer zadań',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TimeWizard - Inteligentny planer zadań',
    description: 'Optymalizuj swój harmonogram dnia i tygodnia z TimeWizard. Inteligentne planowanie zadań.',
    images: ['/og-image.png'],
    creator: '@timewizard',
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
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
