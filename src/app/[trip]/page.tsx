import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bed,
  CalendarDays,
  MapPin,
  Pencil,
  Plane,
  Plus,
  Sun,
  Thermometer,
  Waves,
} from "lucide-react";
import { getTrip } from "@/lib/store";
import type { Location } from "@/content/types";
import { Cover } from "@/components/cover";
import { cn, formatGBP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TripPage({ params }: { params: { trip: string } }) {
  const trip = await getTrip(params.trip);
  if (!trip) notFound();

  const travellers = trip.travellers ?? 1;

  // Status chip derived from the stays, not hardcoded.
  const statuses = trip.locations.flatMap((loc) => loc.holidays.map((h) => h.status));
  const status = statuses.includes("booked")
    ? "Booked"
    : statuses.some((s) => s === "shortlisted" || s === "favourite")
      ? "Deciding together"
      : "Just an idea";

  return (
    <div className="bg-background">
      {/* ── Editorial intro ─────────────────────────────────────────────── */}
      <header className="max-w-[1240px] px-6 pb-9 pt-8 sm:px-12">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-[15px] w-[15px]" /> All trips
        </Link>

        <div className="mt-3.5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
          <div>
            <div className="mb-3">
              <StatusChip label={status} tone={status === "Just an idea" ? "idea" : "success"} />
            </div>
            <h1 className="font-display text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
              {trip.name}
            </h1>
            <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[15px] text-muted-foreground">
              {trip.window && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {trip.window}
                </span>
              )}
              {trip.window && trip.subtitle && (
                <span className="h-1 w-1 rounded-full bg-muted-foreground/50" aria-hidden />
              )}
              {trip.subtitle && <span>{trip.subtitle}</span>}
            </div>
          </div>
          <div className="flex flex-col items-start gap-3 md:items-end">
            {trip.locations.length > 0 && (
              <p className="max-w-[430px] text-[16.5px] leading-[1.55] text-muted-foreground [text-wrap:pretty] md:text-right">
                {trip.locations.length === 1
                  ? "One location in the running so far — add another and the comparison begins."
                  : `${trip.locations.length} locations in the running. Here's how they compare before you commit.`}
              </p>
            )}
            <Link
              href={`/${trip.slug}/edit`}
              className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-primary transition-opacity hover:opacity-80"
            >
              <Pencil className="h-[14px] w-[14px]" /> Edit trip
            </Link>
          </div>
        </div>
      </header>

      {/* ── Cinematic location bands ────────────────────────────────────── */}
      {trip.locations.length === 0 ? (
        <div className="px-6 pb-10 sm:px-12">
          <div className="rounded-[22px] border border-dashed bg-muted/40 px-6 py-20 text-center">
            <MapPin className="mx-auto h-8 w-8 text-accent" aria-hidden />
            <h2 className="mt-4 font-display text-2xl font-semibold">No locations yet</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Add the first place you&rsquo;re considering for {trip.name}, or import a Booking.com
              listing and it&rsquo;ll create the location for you.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={`/${trip.slug}/add`}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-bold text-primary-foreground"
              >
                <Plus className="h-4 w-4" /> Add a location
              </Link>
              <Link
                href={`/import?trip=${trip.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-input px-5 text-[14px] font-semibold text-primary hover:bg-muted"
              >
                Import from Booking.com
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {trip.locations.map((loc, i) => (
            <LocationBand key={loc.slug} loc={loc} index={i} tripSlug={trip.slug} travellers={travellers} priority={i === 0} />
          ))}
        </div>
      )}

      {/* ── Footer action bar ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-6 py-6 text-[13.5px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <span>
          Comparing {trip.locations.length} location{trip.locations.length === 1 ? "" : "s"} for{" "}
          {trip.name}
        </span>
        <Link
          href={`/${trip.slug}/add`}
          className="inline-flex items-center gap-1.5 self-start font-semibold text-primary transition-opacity hover:opacity-80"
        >
          <Plus className="h-[15px] w-[15px]" /> Add another location
        </Link>
      </div>
    </div>
  );
}

/** One full-bleed cinematic band per candidate location. Hover is CSS-only. */
function LocationBand({
  loc,
  index,
  tripSlug,
  travellers,
  priority,
}: {
  loc: Location;
  index: number;
  tripSlug: string;
  travellers: number;
  priority: boolean;
}) {
  // "from" price + stays count derive from the location's holidays (no schema field).
  const prices = loc.holidays
    .map((h) => h.accommodationTotal)
    .filter((n): n is number => typeof n === "number");
  const from = prices.length ? Math.min(...prices) : null;
  const stays = loc.holidays.length;
  const costed = from != null;
  const perPerson = from != null ? Math.round(from / travellers) : null;

  const statusLabel = costed
    ? `${stays} option${stays === 1 ? "" : "s"} costed`
    : "Researching";

  // Hero: the location's own photo, else the first stay photo, else a gradient.
  const heroImage = loc.image ?? loc.holidays.find((h) => h.image)?.image;

  return (
    <section className="group relative h-[clamp(720px,90vh,940px)] overflow-hidden text-white">
      {/* Full-bleed photo (slow-zoom on hover) or a brand gradient cover. */}
      {heroImage ? (
        <Image
          src={heroImage}
          alt={loc.imageAlt ?? ""}
          fill
          priority={priority}
          sizes="100vw"
          className={cn(
            "object-cover transition-transform duration-[1100ms]",
            "ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105",
          )}
        />
      ) : (
        <Cover seed={loc.slug} className="absolute inset-0 h-full w-full" />
      )}

      {/* Scrims: a foot gradient and a left wash. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(8,28,34,0.88)_0%,rgba(8,28,34,0.34)_46%,rgba(8,28,34,0.06)_72%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(105deg,rgba(8,28,34,0.55)_0%,rgba(8,28,34,0.12)_42%,transparent_64%)]"
      />

      {/* Top-left: serif index + status chip. */}
      <div className="absolute left-6 top-8 flex items-center gap-4 sm:left-12">
        <span className="font-display text-[22px] font-medium text-white/[0.62]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <StatusChip label={statusLabel} tone={costed ? "success" : "idea"} light />
      </div>

      {/* Top-right: edit this location (name, details and this photo). */}
      <Link
        href={`/${tripSlug}/${loc.slug}/edit`}
        className="absolute right-6 top-8 z-10 inline-flex h-[34px] items-center gap-2 rounded-full border border-white/[0.34] bg-white/[0.14] px-3.5 text-[12.5px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/[0.26] sm:right-12"
      >
        <Pencil className="h-[13px] w-[13px]" aria-hidden /> Edit location & photo
      </Link>

      {/* Bottom-left: identity, blurb, October season row, note. */}
      <div className="absolute bottom-9 left-6 right-6 max-w-[720px] sm:left-12 lg:right-[400px]">
        <h2 className="font-display text-[clamp(2.25rem,4.5vw,3.375rem)] font-semibold leading-none tracking-[-0.02em] [text-shadow:0_2px_24px_rgba(0,0,0,0.34)]">
          {loc.name}
          <span className="text-[0.56em] font-normal italic opacity-[0.86]">, {loc.country}</span>
        </h2>
        {loc.blurb && (
          <p className="mt-3 max-w-[580px] text-[16.5px] leading-[1.5] text-white/90">{loc.blurb}</p>
        )}
        {loc.season && (
          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <span className="mr-0.5 text-[12px] font-bold uppercase tracking-[0.09em] text-white/[0.66]">
              Season
            </span>
            <SeasonStat icon={Thermometer} value={`${loc.season.high}°`} label="day high" />
            <SeasonStat icon={Waves} value={`${loc.season.sea}°`} label="sea" />
            <SeasonStat icon={Sun} value={`${loc.season.sun}h`} label="sun" />
            {loc.flightTime && (
              <SeasonStat
                icon={Plane}
                value={loc.flightTime.replace("~", "")}
                label={loc.airport ? loc.airport.split(" (")[0] : "flight"}
              />
            )}
          </div>
        )}
        {loc.seasonNote && (
          <p className="mt-3.5 max-w-[560px] text-[13.5px] text-white/[0.66]">{loc.seasonNote}</p>
        )}
      </div>

      {/* Bottom-right: stays / price status + CTA into accommodations. */}
      <div className="absolute bottom-9 right-6 hidden w-[300px] rounded-[18px] border border-white/[0.18] bg-[rgba(12,30,36,0.5)] p-[22px] backdrop-blur-md lg:block">
        <div className="flex items-center gap-2 text-[13px] text-white/[0.78]">
          <Bed className="h-4 w-4" />
          {stays > 0 ? `${stays} stay${stays === 1 ? "" : "s"} being compared` : "No stays added yet"}
        </div>
        <div className="mb-[18px] mt-3">
          {costed ? (
            <div className="flex items-baseline gap-2">
              <span className="text-[13px] text-white/[0.72]">from</span>
              <span className="font-display text-[34px] font-semibold text-white">
                {formatGBP(from)}
              </span>
              {perPerson != null && (
                <span className="text-[13px] text-white/[0.72]">· ~{formatGBP(perPerson)}pp</span>
              )}
            </div>
          ) : (
            <div className="text-[14.5px] leading-[1.4] text-white/[0.82]">
              Still researching villas — <span className="font-semibold text-white">price to confirm</span>
            </div>
          )}
        </div>
        <Link
          href={`/${tripSlug}/${loc.slug}`}
          className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full bg-white text-[15px] font-bold text-primary shadow-[0_10px_26px_rgba(0,0,0,0.26)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.32)]"
        >
          {costed ? "View accommodations" : "Add accommodations"}
          <ArrowRight className="h-[18px] w-[18px]" />
        </Link>
      </div>

      {/* On narrow viewports the panel collapses; keep the band tappable. */}
      <Link
        href={`/${tripSlug}/${loc.slug}`}
        aria-label={`${costed ? "View" : "Add"} accommodations for ${loc.name}, ${loc.country}`}
        className="absolute inset-0 lg:hidden"
      />
    </section>
  );
}

/** A glass stat pill in the October season row. */
function SeasonStat({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label: string;
}) {
  return (
    <span className="inline-flex h-[38px] items-center gap-2.5 whitespace-nowrap rounded-full border border-white/[0.28] bg-white/[0.13] px-3.5 backdrop-blur-sm">
      <Icon className="h-[17px] w-[17px] opacity-90" />
      <span className="text-[15px] font-bold">{value}</span>
      <span className="text-[12.5px] text-white/[0.74]">{label}</span>
    </span>
  );
}

type ChipTone = "success" | "idea";

/** Status chip — a dot + label, never colour alone. `light` for the on-photo glass variant. */
function StatusChip({ label, tone, light }: { label: string; tone: ChipTone; light?: boolean }) {
  if (light) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.34] bg-white/[0.18] py-1 pl-2 pr-2.5 text-[12px] font-semibold text-white backdrop-blur-sm">
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
        {label}
      </span>
    );
  }
  const success = tone === "success";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full py-1 pl-2 pr-2.5 text-[12px] font-semibold",
        success ? "bg-success/15 text-success" : "bg-muted text-muted-foreground",
      )}
    >
      <span
        className={cn("h-1.5 w-1.5 rounded-full", success ? "bg-success" : "bg-muted-foreground/70")}
      />
      {label}
    </span>
  );
}
