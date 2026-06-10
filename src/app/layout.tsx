import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Holiday Planner",
  description: "Compare holidays — accommodation, flights, car hire and full price breakdowns.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <SiteHeader />
        <main>{children}</main>
        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          Holiday Planner · built for comparing trips before booking
        </footer>
      </body>
    </html>
  );
}
