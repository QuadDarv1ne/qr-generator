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

export const metadata: Metadata = {
  title: "QR Generator — Профессиональный генератор QR-кодов",
  description:
    "Бесплатный генератор QR-кодов с кастомным дизайном. 13 типов данных (URL, Wi-Fi, vCard, YouTube и др.), градиенты, логотипы, 11 форм точек, экспорт PNG/SVG/PDF, пресеты для печати.",
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
    "QR YouTube",
  ],
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
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
