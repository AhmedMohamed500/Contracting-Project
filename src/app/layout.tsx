import type { Metadata } from "next";
import { branding, brandTitle } from "@/config/branding";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: brandTitle,
  description: branding.taglineArabic,
  openGraph: {
    title: brandTitle,
    description: branding.tagline,
    type: "website",
    images: [{ url: branding.logo, width: 1732, height: 917, alt: brandTitle }],
  },
  twitter: {
    card: "summary_large_image",
    title: brandTitle,
    description: branding.tagline,
    images: [branding.logo],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
