import Image from "next/image";
import { cn } from "@/lib/utils";

interface HeroProps {
  image?: string;
  imageAlt?: string;
  /** Tailwind min-height classes controlling the hero's height. */
  heightClassName?: string;
  /** Content placed at the very top of the hero (e.g. breadcrumbs). */
  top?: React.ReactNode;
  /** Main overlaid content, bottom-aligned and constrained to a readable measure. */
  children: React.ReactNode;
  /** Eager-load + fetch priority. True for above-the-fold heroes. */
  priority?: boolean;
  className?: string;
}

/**
 * Full-bleed photographic hero. Render it OUTSIDE the page container so the
 * image fills the viewport width; the overlaid text re-enters the container
 * grid. Scrims are tuned so white text clears WCAG AA over any photograph.
 */
export function Hero({
  image,
  imageAlt,
  heightClassName = "min-h-[68vh] md:min-h-[76vh]",
  top,
  children,
  priority = true,
  className,
}: HeroProps) {
  return (
    <section className={cn("relative isolate w-full overflow-hidden bg-primary", className)}>
      {image ? (
        <Image
          src={image}
          alt={imageAlt ?? ""}
          fill
          priority={priority}
          sizes="100vw"
          className="hero-img object-cover"
        />
      ) : (
        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary" />
      )}

      {/* Foot scrim carries the title; top scrim carries the breadcrumbs. */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/5" />
      <div aria-hidden className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/55 to-transparent" />

      <div
        className={cn(
          "container relative z-10 flex flex-col py-7 text-white [text-shadow:0_1px_3px_rgb(0_0_0/0.45)]",
          heightClassName,
        )}
      >
        {top}
        <div className="hero-content mt-auto max-w-3xl">{children}</div>
      </div>
    </section>
  );
}
