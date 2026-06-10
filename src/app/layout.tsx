import type { Metadata } from "next";
import { Spectral } from "next/font/google";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";
import { getMember, isOwner } from "@/lib/member";

const display = Spectral({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Cambria", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  title: "Holiday Planner",
  description: "Compare holidays — accommodation, flights, car hire and full price breakdowns.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={display.variable}>
      <body className="min-h-screen font-sans antialiased">
        <SiteChrome member={getMember()} owner={isOwner()}>
          {children}
        </SiteChrome>
      </body>
    </html>
  );
}
