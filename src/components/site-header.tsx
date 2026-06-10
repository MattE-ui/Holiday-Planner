import Link from "next/link";
import { Link2, Plane, Plus } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Plane className="h-4 w-4" />
          </span>
          Holiday Planner
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/trips"
            className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
          >
            All trips
          </Link>
          <Link
            href="/import"
            className="hidden items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <Link2 className="h-4 w-4" /> Import
          </Link>
          <Link
            href="/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-soft transition-transform duration-300 hover:-translate-y-0.5"
          >
            <Plus className="h-4 w-4" /> New trip
          </Link>
        </nav>
      </div>
    </header>
  );
}
