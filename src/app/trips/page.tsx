import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, MapPin, Plus, Users } from "lucide-react";
import { readTrips } from "@/lib/store";
import { Cover } from "@/components/cover";
import { formatGBP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = { title: "All trips · Holiday Planner" };

export default async function TripsPage() {
  const trips = await readTrips();

  return (
    <div className="bg-background">
      <header className="px-6 pb-7 pt-8 sm:px-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
              All trips
            </h1>
            <p className="mt-3 max-w-[480px] text-[16px] leading-[1.55] text-muted-foreground">
              Everything you&rsquo;re planning, side by side. Open a trip to compare its locations
              and stays.
            </p>
          </div>
          <Link
            href="/new"
            className="inline-flex h-12 shrink-0 items-center gap-2 self-start rounded-full bg-primary px-6 text-[14.5px] font-bold text-primary-foreground shadow-lift transition-transform duration-300 hover:-translate-y-0.5 md:self-auto"
          >
            <Plus className="h-[17px] w-[17px]" /> New trip
          </Link>
        </div>
      </header>

      {trips.length === 0 ? (
        <div className="px-6 pb-12 sm:px-12">
          <div className="rounded-[22px] border border-dashed bg-muted/40 px-6 py-20 text-center">
            <h2 className="font-display text-2xl font-semibold">Nothing planned yet</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Start a trip, or paste a Booking.com link and build the first one around it.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/new"
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-bold text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> New trip
              </Link>
              <Link
                href="/import"
                className="inline-flex h-11 items-center gap-2 rounded-full border border-input px-5 text-[14px] font-semibold text-primary hover:bg-muted"
              >
                Import from Booking.com
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 px-6 pb-12 sm:px-12 lg:grid-cols-2">
          {trips.map((trip) => {
            const stays = trip.locations.flatMap((l) => l.holidays);
            const prices = stays
              .map((h) => h.accommodationTotal)
              .filter((n): n is number => typeof n === "number");
            const from = prices.length ? Math.min(...prices) : null;
            const image =
              trip.image ??
              trip.locations.find((l) => l.image)?.image ??
              stays.find((h) => h.image)?.image;

            return (
              <Link
                key={trip.slug}
                href={`/${trip.slug}`}
                className="group flex overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:shadow-lift"
              >
                <div className="relative w-[140px] shrink-0 overflow-hidden sm:w-[220px]">
                  {image ? (
                    <Image
                      src={image}
                      alt={trip.imageAlt ?? ""}
                      fill
                      sizes="220px"
                      className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  ) : (
                    <Cover seed={trip.slug} className="absolute inset-0 h-full w-full" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-4 p-5 sm:p-6">
                  <div>
                    <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-foreground">
                      {trip.name}
                    </h2>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-[13.5px] text-muted-foreground">
                      {trip.window && (
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-4 w-4" /> {trip.window}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" /> {trip.locations.length} location
                        {trip.locations.length === 1 ? "" : "s"}
                      </span>
                      {trip.travellers != null && (
                        <span className="inline-flex items-center gap-1.5">
                          <Users className="h-4 w-4" /> {trip.travellers}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end justify-between gap-3">
                    {from != null ? (
                      <div>
                        <span className="text-[12.5px] text-muted-foreground">from </span>
                        <span className="font-display text-[22px] font-semibold tabular-nums text-foreground">
                          {formatGBP(from)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[13.5px] font-semibold text-warning">
                        Prices to confirm
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-primary">
                      Open <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
