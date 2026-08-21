import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Binaa ERP | Construction Control",
  description: "نظام متكامل لإدارة شركات المقاولات والمشروعات والتكاليف",
  openGraph: {
    title: "Binaa ERP | Construction Control",
    description: "Construction projects, procurement, inventory, finance and profitability in one integrated control system.",
    type: "website",
    images: [{ url: "/og.png", width: 1732, height: 917, alt: "Binaa ERP Construction Control System" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Binaa ERP | Construction Control",
    description: "Integrated local-first construction ERP prototype.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
