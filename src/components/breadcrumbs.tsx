import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  href?: string;
  label: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link href={item.href} className="rounded px-1 py-0.5 transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className="px-1 py-0.5 font-medium text-foreground" aria-current="page">
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
