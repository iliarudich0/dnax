import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "sonner";
import { ReferrerTracker } from "@/components/referrer-tracker";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://lumina.net.local"),
  title: "LuminaNet | Futurystyczny magazyn danych",
  description:
    "Futurystyczny landing i dashboard z mock/Firebase auth, udostępnianiem plików i trybem bez konfiguracji.",
  keywords: ["nextjs", "firebase", "storage", "landing", "dashboard"],
  openGraph: {
    title: "LuminaNet | 2100-ready data space",
    description:
      "Zaloguj się, wyślij plik, udostępnij publiczny link z kodem polecającym w 30 sekund.",
    url: "https://lumina.net.local",
    siteName: "LuminaNet",
    images: [
      {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
        width: 1400,
        height: 788,
        alt: "LuminaNet preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LuminaNet",
    description: "Przyszłościowy landing, dashboard i mock Firebase w 30 sekund.",
    images: [
      "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          <LocaleProvider>
            <AuthProvider>
              <Suspense>
                <ReferrerTracker />
              </Suspense>
              {children}
              <Toaster position="top-right" richColors theme="light" />
            </AuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
