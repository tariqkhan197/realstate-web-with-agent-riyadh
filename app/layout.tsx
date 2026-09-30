import type { Metadata, Viewport } from "next";
import { IBM_Plex_Sans_Arabic, Manrope } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/lib/store";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Footer } from "@/components/layout/Footer";
import { CompareTray } from "@/components/layout/CompareTray";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-arabic", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "Riyah — Your AI Real Estate Agent for Saudi Arabia", template: "%s · Riyah" },
  description: "Search Saudi Arabia's property market, compare opportunities, explore neighbourhoods and get personalised recommendations from an AI real estate agent.",
  openGraph: { type: "website", siteName: "Riyah", title: "Riyah — Your AI Real Estate Agent for Saudi Arabia", description: "An AI agent that searches, ranks, compares and finances Saudi property for you." },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#0B3B2E", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${manrope.variable} ${arabic.variable}`}>
      <body className="min-h-screen font-sans">
        <AppProvider>
          <Header />
          <main id="main" className="min-h-[60vh]">{children}</main>
          <Footer />
          <CompareTray />
          <MobileNav />
        </AppProvider>
      </body>
    </html>
  );
}
