import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.SITE_URL;

export const metadata: Metadata = {
  title: {
    default: "QR Generator — Профессиональный генератор QR-кодов",
    template: "%s — QR Generator",
  },
  description:
    "Бесплатный генератор QR-кодов с кастомным дизайном. 12 типов данных (URL, Wi-Fi, vCard, геолокация и др.), градиенты, логотипы, 11 форм точек, экспорт PNG/JPG/SVG/PDF, пресеты для печати.",
  keywords: [
    "QR-код",
    "генератор QR",
    "QR код",
    "бесплатный QR",
    "QR с логотипом",
    "QR для печати",
    "QR генератор онлайн",
    "QR Wi-Fi",
    "QR vCard",
    "QR геолокация",
  ],
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "QR Generator",
    title: "QR Generator — Профессиональный генератор QR-кодов",
    description:
      "Уникальный дизайн, логотипы, градиенты, экспорт для печати. 12 типов данных, 11 форм точек.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "QR Generator — Профессиональный генератор QR-кодов",
    description:
      "Бесплатный генератор QR-кодов: дизайн, логотипы, экспорт PNG/JPG/SVG/PDF.",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    title: "QR Generator",
    statusBarStyle: "default",
  },
  applicationName: "QR Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
