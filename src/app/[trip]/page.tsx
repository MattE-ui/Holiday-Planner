import Link from "next/link";
import { notFound } from "next/navigation";
import { trips, getTrip } from "@/content/trips";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Cover } from "@/components/cover";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Plane } from "lucide-react";

export function generateStaticParams() {
  return trips.map((t) => ({ trip: t.slug }));
}

export default function TripPage({ params }: { params: { trip: string } }) {
  const trip = getTrip(params.trip);
  if (!trip) notFound();

  return (
    <div className="container py-8 md:py-10">
      <Breadcrumbs items={[{ href: "/", label: "Holidays" }, { label: trip.name }]} />

      <header className="mb-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">{trip.name}</h1>
        <p className="mt-1 text-muted-foreground">
          {[trip.window, trip.subtitle].filter(Boolean).join(" · ")}
        </p>
      </header>

      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-accent">Locations</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {trip.locations.map((loc) => (
          <Link key={loc.slug} href={`/${trip.slug}/${loc.slug}`} className="group">
            <Card className="flex h-full flex-col overflow-hidden transition-shadow group-hover:shadow-lift">
              <Cover seed={loc.slug} image={loc.image} label="📍" className="h-32 p-4">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl font-semibold leading-tight">{loc.name}</h3>
                    <p className="text-sm text-white/85">{loc.country}</p>
                  </div>
                  <Badge variant="secondary" className="bg-white/85 text-primary">
                    {loc.holidays.length} {loc.holidays.length === 1 ? "option" : "options"}
                  </Badge>
                </div>
              </Cover>
              <div className="flex flex-1 flex-col p-4">
                {loc.blurb && <p className="text-sm text-muted-foreground">{loc.blurb}</p>}
                {loc.airport && (
                  <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Plane className="h-3.5 w-3.5" /> {loc.airport}
                  </p>
                )}
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">
                  View options <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
