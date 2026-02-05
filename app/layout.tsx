import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ReferrerTracker } from "@/components/referrer-tracker";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "TikDNA | DNA Trait Reports",
  description:
    "Upload your raw DNA file, normalize SNPs, and explore educational trait reports. Privacy-first and non-medical.",
  metadataBase: new URL("https://iliarudich0.github.io"),
  openGraph: {
    title: "TikDNA | DNA Trait Reports",
    description: "Educational trait reports from consumer DNA files.",
    url: "https://iliarudich0.github.io/dnax",
    siteName: "TikDNA",
    images: [
      {
        url: "https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?auto=format&fit=crop&w=1400&q=80",
        width: 1400,
        height: 788,
        alt: "TikDNA preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TikDNA",
    description: "Educational trait reports from your DNA file.",
    images: [
      "https://images.unsplash.com/photo-1489278353717-f64c6ee8a4d2?auto=format&fit=crop&w=1200&q=80",
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.variable} ${spaceMono.variable} bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <Suspense>
              <ReferrerTracker />
            </Suspense>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
