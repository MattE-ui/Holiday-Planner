import Link from "next/link";
import { Plane } from "lucide-react";

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
        <span className="text-sm text-muted-foreground">Compare. Decide. Book.</span>
      </div>
    </header>
  );
}
