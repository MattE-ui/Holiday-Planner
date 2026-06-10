import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { trips, getLocation } from "@/content/trips";
import { buildBreakdown } from "@/lib/pricing";
import { formatGBP } from "@/lib/utils";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Hero } from "@/components/hero";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plane, BedDouble, Waves, Snowflake, Footprints, Compass } from "lucide-react";
import type { Holiday, HolidayStatus } from "@/content/types";

export function generateStaticParams() {
  return trips.flatMap((t) => t.locations.map((l) => ({ trip: t.slug, location: l.slug })));
}

const statusStyle: Record<HolidayStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  idea: { label: "Idea", variant: "secondary" },
  shortlisted: { label: "Shortlisted", variant: "warning" },
  favourite: { label: "Favourite", variant: "success" },
  booked: { label: "Booked", variant: "success" },
};

export default function LocationPage({ params }: { params: { trip: string; location: string } }) {
  const { trip, location } = getLocation(params.trip, params.location);
  if (!trip || !location) notFound();

  const count = location.holidays.length;

  return (
    <>
      <Hero
        image={location.image}
        imageAlt={location.imageAlt}
        top={
          <Breadcrumbs
            tone="onImage"
            items={[
              { href: "/", label: "Holidays" },
              { href: `/${trip.slug}`, label: trip.name },
              { label: location.name },
            ]}
          />
        }
      >
        <h1 className="font-display text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-[1.02] tracking-tight [text-wrap:balance]">
          {location.name}
        </h1>
        <p className="mt-3 text-lg text-white/85 md:text-xl">{location.country}</p>
        {location.airport && (
          <p className="mt-5 inline-flex items-center gap-2 text-sm text-white/80">
            <Plane className="h-4 w-4 shrink-0" aria-hidden />
            Fly into {location.airport}
          </p>
        )}
      </Hero>

      <div className="container py-12 md:py-16">
        {location.blurb && (
          <p className="max-w-2xl font-display text-xl leading-relaxed text-foreground/80 md:text-2xl md:leading-relaxed">
            {location.blurb}
          </p>
        )}
        {location.flightSummary && (
          <p className="mt-6 flex max-w-2xl items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <Plane className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span>{location.flightSummary}</span>
          </p>
        )}

        <div className="mt-14 md:mt-16">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
              {count > 0 ? "Where you could stay" : "Stays"}
            </h2>
            {count > 0 && (
              <span className="shrink-0 text-sm text-muted-foreground">
                {count} {count === 1 ? "option" : "options"}
              </span>
            )}
          </div>

          {count === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed bg-muted/40 px-6 py-16 text-center">
              <Compass className="mx-auto h-8 w-8 text-accent" aria-hidden />
              <h3 className="mt-4 font-display text-xl font-semibold">No stays saved here yet</h3>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Send a listing link for {location.name} and it&apos;ll appear here as a full holiday — accommodation,
                flights and a complete price breakdown.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-8">
              {location.holidays.map((h) => (
                <HolidayFeature key={h.slug} holiday={h} href={`/${trip.slug}/${location.slug}/${h.slug}`} travellers={trip.travellers ?? 4} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function HolidayFeature({
  holiday: h,
  href,
  travellers,
}: {
  holiday: Holiday;
  href: string;
  travellers: number;
}) {
  const b = buildBreakdown(h, travellers);
  const s = h.status ? statusStyle[h.status] : undefined;

  return (
    <Link href={href} className="group block focus:outline-none">
      <article className="grid overflow-hidden rounded-2xl border bg-card shadow-soft transition-shadow duration-300 group-hover:shadow-lift group-focus-visible:ring-2 group-focus-visible:ring-ring group-focus-visible:ring-offset-2 md:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[22rem]">
          {h.image ? (
            <Image
              src={h.image}
              alt={h.imageAlt ?? h.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary" />
          )}
          {h.rating && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary shadow-soft backdrop-blur">
              ★ {h.rating}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-4 p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-2">
            {s && <Badge variant={s.variant}>{s.label}</Badge>}
            {h.accommodation.privatePool && (
              <Badge variant="secondary"><Waves className="h-3 w-3" /> Private pool</Badge>
            )}
            {h.accommodation.airCon && (
              <Badge variant="secondary"><Snowflake className="h-3 w-3" /> A/C</Badge>
            )}
            {h.accommodation.bedrooms != null && (
              <Badge variant="secondary"><BedDouble className="h-3 w-3" /> {h.accommodation.bedrooms} bed</Badge>
            )}
          </div>

          <h3 className="font-display text-2xl font-semibold leading-tight tracking-tight md:text-[1.75rem]">
            {h.name}
          </h3>

          {h.summary && <p className="leading-relaxed text-muted-foreground">{h.summary}</p>}

          {h.accommodation.walkToAmenities && (
            <p className="inline-flex items-start gap-1.5 text-sm text-muted-foreground">
              <Footprints className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
              {h.accommodation.walkToAmenities}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-4 border-t pt-5">
            <div>
              <div className="text-xs font-medium text-muted-foreground">{b.complete ? "Total" : "From"}</div>
              <div className="font-display text-2xl font-semibold tabular-nums">{formatGBP(b.knownTotal)}</div>
              {!b.complete && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {b.pending.join(", ").toLowerCase()} still to confirm
                </div>
              )}
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary">
              See the breakdown
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
