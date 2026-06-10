import { notFound } from "next/navigation";
import { trips, getHoliday } from "@/content/trips";
import { cn } from "@/lib/utils";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Hero } from "@/components/hero";
import { PriceBreakdown } from "@/components/price-breakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plane, Car, BedDouble, Bath, Waves, Snowflake, Footprints, Ruler, Sparkles,
  ExternalLink, Check, X, Users, CalendarDays,
} from "lucide-react";
import type { HolidayStatus } from "@/content/types";

export function generateStaticParams() {
  return trips.flatMap((t) =>
    t.locations.flatMap((l) => l.holidays.map((h) => ({ trip: t.slug, location: l.slug, holiday: h.slug }))),
  );
}

const statusStyle: Record<HolidayStatus, { label: string; variant: "default" | "secondary" | "success" | "warning" }> = {
  idea: { label: "Idea", variant: "secondary" },
  shortlisted: { label: "Shortlisted", variant: "warning" },
  favourite: { label: "Favourite", variant: "success" },
  booked: { label: "Booked", variant: "success" },
};

/** Solid, legible pill styles for status badges sitting over a photo hero. */
const heroPill: Record<"default" | "secondary" | "success" | "warning", string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-white/90 text-primary",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
};

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-md border bg-background p-3">
      <span className="mt-0.5 text-accent">{icon}</span>
      <div>
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

export default function HolidayPage({
  params,
}: {
  params: { trip: string; location: string; holiday: string };
}) {
  const { trip, location, holiday } = getHoliday(params.trip, params.location, params.holiday);
  if (!trip || !location || !holiday) notFound();

  const travellers = trip.travellers ?? 4;
  const a = holiday.accommodation;
  const s = holiday.status ? statusStyle[holiday.status] : undefined;
  const yn = (v?: boolean) => (v ? "Yes" : v === false ? "No" : "—");

  return (
    <>
      <Hero
        image={holiday.image}
        imageAlt={holiday.imageAlt}
        heightClassName="min-h-[52vh] md:min-h-[58vh]"
        top={
          <Breadcrumbs
            tone="onImage"
            items={[
              { href: "/", label: "Holidays" },
              { href: `/${trip.slug}`, label: trip.name },
              { href: `/${trip.slug}/${location.slug}`, label: location.name },
              { label: holiday.name },
            ]}
          />
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          {s && (
            <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", heroPill[s.variant])}>
              {s.label}
            </span>
          )}
          {holiday.rating && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-primary">
              ★ {holiday.rating}
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-[clamp(2.25rem,5.5vw,4rem)] font-semibold leading-[1.04] tracking-tight [text-wrap:balance]">
          {holiday.name}
        </h1>
        <p className="mt-2 text-white/85">
          {location.name}, {location.country}
        </p>
      </Hero>

      <div className="container py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* main column */}
        <div className="space-y-8">
          {holiday.summary && <p className="text-lg text-muted-foreground">{holiday.summary}</p>}

          {/* Accommodation */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">Accommodation</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Fact icon={<BedDouble className="h-4 w-4" />} label="Bedrooms" value={a.bedrooms ?? "—"} />
              <Fact icon={<Users className="h-4 w-4" />} label="Sleeps" value={a.sleeps ?? "—"} />
              <Fact icon={<Bath className="h-4 w-4" />} label="Bathrooms" value={a.bathrooms ?? "—"} />
              <Fact icon={<Waves className="h-4 w-4" />} label="Private pool" value={yn(a.privatePool)} />
              <Fact icon={<Snowflake className="h-4 w-4" />} label="Air conditioning" value={yn(a.airCon)} />
              <Fact icon={<Sparkles className="h-4 w-4" />} label="Modern" value={yn(a.modern)} />
              {a.sizeSqft && <Fact icon={<Ruler className="h-4 w-4" />} label="Size" value={`${a.sizeSqft} ft²`} />}
              {a.walkToAmenities && (
                <Fact icon={<Footprints className="h-4 w-4" />} label="Walk to shops / food" value={a.walkToAmenities} />
              )}
            </div>
            {a.extras && a.extras.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {a.extras.map((x) => (
                  <Badge key={x} variant="secondary">{x}</Badge>
                ))}
              </div>
            )}
          </section>

          {/* Flights */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">Flights</h2>
            {holiday.flights && holiday.flights.length > 0 ? (
              <div className="space-y-3">
                {holiday.flights.map((f, i) => (
                  <Card key={i} className="p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 font-medium">
                        <Plane className="h-4 w-4 text-accent" /> {f.airport}
                      </span>
                      {f.price != null && <span className="font-semibold tabular-nums">£{f.price}</span>}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[f.airline, f.outDate && f.backDate ? `${f.outDate}–${f.backDate}` : null,
                        f.bagsIncluded != null ? (f.bagsIncluded ? "bags included" : "bags extra") : null, f.notes]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-dashed p-4 text-sm text-muted-foreground">
                Not added yet — flight options for {location.name} will be logged here.
              </Card>
            )}
          </section>

          {/* Car hire */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">Car hire &amp; transfers</h2>
            <Card className="p-4">
              <p className="flex items-start gap-2 text-sm">
                <Car className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                {holiday.carHire ? (
                  <span>
                    {[holiday.carHire.provider, holiday.carHire.vehicle,
                      holiday.carHire.days ? `${holiday.carHire.days} days` : null]
                      .filter(Boolean)
                      .join(" · ") || "Car hire"}
                    {holiday.carHire.price != null && (
                      <span className="font-semibold"> — £{holiday.carHire.price}</span>
                    )}
                    {holiday.carHire.notes && (
                      <span className="block text-muted-foreground">{holiday.carHire.notes}</span>
                    )}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not added yet — add a quote to fold it into the total.</span>
                )}
              </p>
            </Card>
          </section>

          {/* Pros / Cons */}
          {((holiday.pros && holiday.pros.length > 0) || (holiday.cons && holiday.cons.length > 0)) && (
            <section className="grid gap-4 sm:grid-cols-2">
              <Card className="border-success/20 bg-success/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-success">Pros</CardTitle>
                </CardHeader>
                <CardContent>
                  {holiday.pros && holiday.pros.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {holiday.pros.map((p, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {p}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">To add</p>
                  )}
                </CardContent>
              </Card>
              <Card className="border-danger/20 bg-danger/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-danger">Cons</CardTitle>
                </CardHeader>
                <CardContent>
                  {holiday.cons && holiday.cons.length > 0 ? (
                    <ul className="space-y-2 text-sm">
                      {holiday.cons.map((c, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-danger" /> {c}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm italic text-muted-foreground">To add</p>
                  )}
                </CardContent>
              </Card>
            </section>
          )}

          {holiday.notes && (
            <section>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-accent">Notes</h2>
              <p className="text-sm text-muted-foreground">{holiday.notes}</p>
            </section>
          )}
        </div>

        {/* sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-base">Price breakdown</CardTitle>
              {holiday.dates && (
                <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" /> {holiday.nights} nights · {holiday.dates}
                </p>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <PriceBreakdown holiday={holiday} travellers={travellers} />
              {holiday.rateNote && <p className="text-xs text-muted-foreground">{holiday.rateNote}</p>}
              {holiday.listingUrl && (
                <a
                  href={holiday.listingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  View listing <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </CardContent>
          </Card>
        </aside>
        </div>
      </div>
    </>
  );
}
