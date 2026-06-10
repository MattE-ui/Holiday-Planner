import Link from "next/link";
import { notFound } from "next/navigation";
import { trips, getLocation } from "@/content/trips";
import { buildBreakdown } from "@/lib/pricing";
import { formatGBP } from "@/lib/utils";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Cover } from "@/components/cover";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plane, BedDouble, Waves, Snowflake, Footprints } from "lucide-react";
import type { HolidayStatus } from "@/content/types";

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

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Holidays" },
          { href: `/${trip.slug}`, label: trip.name },
          { label: location.name },
        ]}
      />

      <header className="mb-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {location.name}
          <span className="ml-2 align-middle text-lg font-normal text-muted-foreground">{location.country}</span>
        </h1>
        {location.blurb && <p className="mt-2 max-w-3xl text-muted-foreground">{location.blurb}</p>}
      </header>

      {(location.airport || location.flightSummary) && (
        <Card className="mb-8 border-accent/20 bg-accent/5 p-4">
          <p className="flex items-start gap-2 text-sm">
            <Plane className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>
              {location.airport && <span className="font-medium">{location.airport}. </span>}
              {location.flightSummary && <span className="text-muted-foreground">{location.flightSummary}</span>}
            </span>
          </p>
        </Card>
      )}

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">Holidays</h2>

      {location.holidays.length === 0 ? (
        <Card className="border-dashed p-8 text-center text-muted-foreground">
          No options added here yet. Send a listing link and it&apos;ll appear as a holiday card with its full
          breakdown.
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {location.holidays.map((h) => {
            const b = buildBreakdown(h, trip.travellers ?? 4);
            const s = h.status ? statusStyle[h.status] : undefined;
            return (
              <Link key={h.slug} href={`/${trip.slug}/${location.slug}/${h.slug}`} className="group">
                <Card className="flex h-full flex-col overflow-hidden transition-shadow group-hover:shadow-lift">
                  <Cover seed={h.slug} image={h.image} label="🏖️" className="h-36 p-4">
                    <div className="flex items-end justify-between gap-2">
                      <h3 className="font-display text-xl font-semibold leading-tight">{h.name}</h3>
                      {h.rating && (
                        <Badge variant="secondary" className="bg-white/85 text-primary">★ {h.rating}</Badge>
                      )}
                    </div>
                  </Cover>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {s && <Badge variant={s.variant}>{s.label}</Badge>}
                      {h.accommodation.privatePool && (
                        <Badge variant="secondary"><Waves className="h-3 w-3" /> Pool</Badge>
                      )}
                      {h.accommodation.airCon && (
                        <Badge variant="secondary"><Snowflake className="h-3 w-3" /> A/C</Badge>
                      )}
                      {h.accommodation.bedrooms != null && (
                        <Badge variant="secondary"><BedDouble className="h-3 w-3" /> {h.accommodation.bedrooms} bed</Badge>
                      )}
                    </div>
                    {h.summary && <p className="mt-3 text-sm text-muted-foreground">{h.summary}</p>}
                    {h.accommodation.walkToAmenities && (
                      <p className="mt-3 inline-flex items-start gap-1.5 text-xs text-muted-foreground">
                        <Footprints className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {h.accommodation.walkToAmenities}
                      </p>
                    )}
                    <div className="mt-auto flex items-end justify-between pt-4">
                      <div>
                        <div className="text-xs text-muted-foreground">{b.complete ? "Total" : "From"}</div>
                        <div className="text-lg font-bold tabular-nums">{formatGBP(b.knownTotal)}</div>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                        Details <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
