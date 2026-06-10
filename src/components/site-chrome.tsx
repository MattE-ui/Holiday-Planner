"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "@/components/site-header";

/**
 * Wraps the page in the standard site chrome (header + footer), except on the
 * immersive landing route, which owns the full viewport and renders its own
 * on-photo top bar. Server-rendered page content is passed through as children.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const immersive = usePathname() === "/";
  return (
    <>
      {!immersive && <SiteHeader />}
      <main>{children}</main>
      {!immersive && (
        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          Holiday Planner · built for comparing trips before booking
        </footer>
      )}
    </>
  );
}
