import Link from "next/link";
import { trips } from "@/content/trips";
import { Cover } from "@/components/cover";
import { Card } from "@/components/ui/card";
import { ArrowRight, MapPin, CalendarDays } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container py-10 md:py-14">
      <section className="mx-auto max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">Where to next</p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">
          Your holidays
        </h1>
        <p className="mt-3 text-muted-foreground">
          Pick a trip to compare locations, accommodation, flights and full price breakdowns side by side.
        </p>
      </section>

      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        {trips.map((trip) => {
          const holidayCount = trip.locations.reduce((n, l) => n + l.holidays.length, 0);
          return (
            <Link key={trip.slug} href={`/${trip.slug}`} className="group">
              <Card className="overflow-hidden transition-shadow group-hover:shadow-lift">
                <Cover seed={trip.slug} image={trip.image} label="🌅" className="h-44 p-5">
                  <h2 className="font-display text-2xl font-semibold tracking-tight">{trip.name}</h2>
                  {trip.window && <p className="text-sm text-white/85">{trip.window}</p>}
                </Cover>
                <div className="flex items-center justify-between p-5">
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" /> {trip.locations.length} locations
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" /> {holidayCount} options
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
