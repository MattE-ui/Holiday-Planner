import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Crumb {
  href?: string;
  label: string;
}

/** "default" for breadcrumbs on a page background; "onImage" for over a photo hero. */
type BreadcrumbTone = "default" | "onImage";

export function Breadcrumbs({
  items,
  tone = "default",
  className,
}: {
  items: Crumb[];
  tone?: BreadcrumbTone;
  className?: string;
}) {
  const onImage = tone === "onImage";
  return (
    <nav aria-label="Breadcrumb" className={cn(onImage ? "mb-0" : "mb-6", className)}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1 text-sm",
          onImage ? "text-white/80" : "text-muted-foreground",
        )}
      >
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className={cn(
                    "rounded px-1 py-0.5 transition-colors",
                    onImage ? "hover:text-white" : "hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn("px-1 py-0.5 font-medium", onImage ? "text-white" : "text-foreground")}
                  aria-current="page"
                >
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
