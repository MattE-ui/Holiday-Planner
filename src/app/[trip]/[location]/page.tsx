import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bath,
  Bed,
  BedDouble,
  CalendarDays,
  Camera,
  Check,
  Footprints,
  Heart,
  Plus,
  Snowflake,
  Star,
  Users,
  Waves,
} from "lucide-react";
import { getLocation } from "@/lib/store";
import { deleteLocation } from "@/lib/actions";
import { Cover } from "@/components/cover";
import { DeleteButton } from "@/components/delete-button";
import { cn, formatGBP } from "@/lib/utils";
import type { Holiday, HolidayStatus } from "@/content/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<HolidayStatus, string> = {
  idea: "Researching",
  shortlisted: "Shortlisted",
  favourite: "Favourite so far",
  booked: "Booked",
};

/** Everything the cards need, derived honestly from a holiday. Money is shown
 *  only when it exists — a null accommodation total becomes "Price to confirm". */
function deriveStay(h: Holiday, travellers: number) {
  const total = h.accommodationTotal ?? null;
  const nights = h.nights ?? null;
  const costed = total != null;
  return {
    total,
    nights,
    costed,
    perPerson: costed && travellers > 0 ? Math.round(total / travellers) : null,
    perNight: costed && nights ? Math.round(total / nights) : null,
    // Only count images we actually hold — never claim a listing's full gallery.
    photoCount: (h.photos?.length ?? 0) + (h.image ? 1 : 0),
    rating: h.rating?.replace(/\s*\/\s*10$/, "") ?? null,
    cancel: cancellationLine(h),
  };
}

/** A short cancellation/quote line. Pulls a date out of `rateNote` when there is
 *  one; for an un-costed stay it's a quote note, shown in amber by the cards. */
function cancellationLine(h: Holiday): string {
  if (h.accommodationTotal == null) return h.rateNote?.trim() || "Awaiting quote";
  const m = h.rateNote?.match(/(?:before|until)\s+(\d{1,2}\s+\w{3,})/i);
  return m ? `Free cancellation until ${m[1]}` : "Free cancellation available";
}

export default async function LocationPage({
  params,
}: {
  params: { trip: string; location: string };
}) {
  const { trip, location } = await getLocation(params.trip, params.location);
  if (!trip || !location) notFound();

  const travellers = trip.travellers ?? 4;
  const stays = location.holidays;

  // Empty state — no stays logged for this location yet.
  if (stays.length === 0) {
    return (
      <div className="bg-background">
        <PageHeader trip={trip} location={location} stays={stays} travellers={travellers} />
        <div className="px-6 pb-10 sm:px-12">
          <div className="rounded-[22px] border border-dashed bg-muted/40 px-6 py-20 text-center">
            <Bed className="mx-auto h-8 w-8 text-accent" aria-hidden />
            <h2 className="mt-4 font-display text-2xl font-semibold">No stays added here yet</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Import a Booking.com listing for {location.name} and it&apos;ll appear here as a full
              stay — specs, photos and an honest price breakdown — or add one by hand.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href={`/import?trip=${trip.slug}&location=${location.slug}`}
                className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-bold text-primary-foreground"
              >
                Import from Booking.com
              </Link>
              <Link
                href={`/${trip.slug}/${location.slug}/add`}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-input px-5 text-[14px] font-semibold text-primary hover:bg-muted"
              >
                <Plus className="h-4 w-4" /> Add a stay by hand
              </Link>
            </div>
          </div>
        </div>
        <Footer trip={trip} location={location} />
      </div>
    );
  }

  // The favourite leads; everyone else falls in line below.
  const featured = stays.find((s) => s.status === "favourite") ?? stays[0];
  const rest = stays.filter((s) => s !== featured);

  return (
    <div className="bg-background">
      <PageHeader trip={trip} location={location} stays={stays} travellers={travellers} />

      {/* ── Front-runner ─────────────────────────────────────────────────── */}
      <div className="px-6 sm:px-12">
        <FeaturedStay
          stay={featured}
          travellers={travellers}
          href={`/${trip.slug}/${location.slug}/${featured.slug}`}
        />
      </div>

      {/* ── Also in the running ──────────────────────────────────────────── */}
      {rest.length > 0 && (
        <>
          <div className="flex items-baseline justify-between gap-4 px-6 pb-2 pt-8 sm:px-12">
            <h2 className="font-display text-2xl font-semibold tracking-[-0.01em] text-foreground">
              Also in the running
            </h2>
            <span className="shrink-0 text-[13.5px] text-muted-foreground">
              {rest.length} more being compared
            </span>
          </div>
          <div className="grid gap-6 px-6 pb-7 pt-2 sm:px-12 lg:grid-cols-2">
            {rest.map((s) => (
              <CompactStay
                key={s.slug}
                stay={s}
                travellers={travellers}
                href={`/${trip.slug}/${location.slug}/${s.slug}`}
              />
            ))}
          </div>
        </>
      )}

      <Footer trip={trip} location={location} />
    </div>
  );
}

/** Back-link, identity + meta, and the "costed from" summary — mirrors the
 *  trip page's editorial header so the two read as one journey. */
function PageHeader({
  trip,
  location,
  stays,
  travellers,
}: {
  trip: { slug: string; name: string };
  location: { name: string; country: string };
  stays: Holiday[];
  travellers: number;
}) {
  const lead = stays.find((s) => s.status === "favourite") ?? stays[0];
  const costedTotals = stays
    .map((s) => s.accommodationTotal)
    .filter((n): n is number => typeof n === "number");
  const costedFrom = costedTotals.length ? Math.min(...costedTotals) : null;

  return (
    <header className="px-6 pb-5 pt-7 sm:px-12">
      <Link
        href={`/${trip.slug}`}
        className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-[15px] w-[15px]" /> {trip.name} · all locations
      </Link>

      <div className="mt-3.5 flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-10">
        <div>
          <h1 className="font-display text-[clamp(2.25rem,5vw,3.125rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
            Staying in {location.name}
            <span className="text-[0.6em] font-normal italic text-muted-foreground">
              , {location.country}
            </span>
          </h1>
          <div className="mt-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 text-[14.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Bed className="h-4 w-4" />
              {stays.length} stay{stays.length === 1 ? "" : "s"} being compared
            </span>
            {lead?.nights && lead?.dates && (
              <>
                <Dot />
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {lead.nights} nights · {lead.dates}
                </span>
              </>
            )}
            <Dot />
            <span className="inline-flex items-center gap-2">
              <Users className="h-4 w-4" />
              {travellers} guests
            </span>
          </div>
        </div>

        {costedFrom != null && (
          <div className="shrink-0 md:text-right">
            <div className="text-[12.5px] text-muted-foreground">Costed options from</div>
            <div className="font-display text-3xl font-semibold text-primary">
              {formatGBP(costedFrom)}
            </div>
            <div className="text-xs text-muted-foreground">
              party total · ~{formatGBP(Math.round(costedFrom / travellers))}pp
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

/** The favourite: a large image + details spread, bordered in primary teal. */
function FeaturedStay({
  stay,
  travellers,
  href,
}: {
  stay: Holiday;
  travellers: number;
  href: string;
}) {
  const a = stay.accommodation;
  const d = deriveStay(stay, travellers);

  return (
    <article className="group flex flex-col overflow-hidden rounded-[22px] border-2 border-primary bg-card shadow-lift md:min-h-[480px] md:flex-row">
      {/* Image */}
      <div className="relative aspect-[5/4] overflow-hidden md:aspect-auto md:w-[56%] md:shrink-0">
        {stay.image ? (
          <Image
            src={stay.image}
            alt={stay.imageAlt ?? stay.name}
            fill
            priority
            sizes="(min-width: 768px) 56vw, 100vw"
            className="object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        ) : (
          <Cover seed={stay.slug} className="absolute inset-0 h-full w-full" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.34),transparent_36%),linear-gradient(to_bottom,rgba(0,0,0,0.24),transparent_28%)]"
        />
        <div className="absolute left-[18px] top-[18px] flex items-center gap-2">
          {stay.status && <StatusChip label={STATUS_LABEL[stay.status]} />}
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-primary">
            <Heart className="h-4 w-4 fill-current" />
          </span>
        </div>
        {d.rating && <RatingPill rating={d.rating} />}
        {d.photoCount > 1 && <PhotoPill count={d.photoCount} />}
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between gap-6 p-7 md:p-[34px_38px]">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.08em] text-accent">
            Our front-runner
          </div>
          <h2 className="mt-2 font-display text-[clamp(1.75rem,3vw,2.25rem)] font-semibold leading-[1.04] tracking-[-0.02em] text-foreground">
            {stay.name}
          </h2>
          {stay.summary && (
            <p className="mt-3 max-w-[460px] text-[15.5px] leading-[1.55] text-muted-foreground">
              {stay.summary}
            </p>
          )}

          <SpecChips a={a} className="mt-[18px]" />

          <div className="mt-[18px] flex flex-col gap-[7px]">
            {stay.pros?.slice(0, 3).map((p) => (
              <div key={p} className="flex items-center gap-2.5 text-[13.5px] text-foreground/80">
                <Check className="h-[15px] w-[15px] shrink-0 text-success" aria-hidden /> {p}
              </div>
            ))}
            {a.walkToAmenities && (
              <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                <Footprints className="h-[15px] w-[15px] shrink-0 text-accent" aria-hidden />
                {a.walkToAmenities}
              </div>
            )}
          </div>
        </div>

        {/* Price row */}
        <div className="flex flex-wrap items-end justify-between gap-5 border-t pt-[18px]">
          <div>
            {d.costed ? (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[clamp(1.75rem,3vw,2.25rem)] font-semibold tabular-nums text-foreground">
                    {formatGBP(d.total!)}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    total · {d.nights} nights
                  </span>
                </div>
                <div className="mt-0.5 text-[13.5px] text-muted-foreground">
                  ~{formatGBP(d.perPerson!)}pp
                  {d.perNight != null && <> · ~{formatGBP(d.perNight)}/night</>}
                </div>
                <CancelLine text={d.cancel} costed />
              </>
            ) : (
              <>
                <div className="font-display text-2xl font-semibold text-foreground/80">
                  Price to confirm
                </div>
                <CancelLine text={d.cancel} costed={false} />
              </>
            )}
          </div>
          <Link
            href={href}
            className="inline-flex h-[50px] items-center justify-center gap-2.5 rounded-full bg-primary px-[26px] text-[15px] font-bold text-primary-foreground shadow-lift transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            View full details <ArrowRight className="h-[18px] w-[18px]" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** A smaller horizontal tile for the comparison stays. CSS-only hover lift. */
function CompactStay({
  stay,
  travellers,
  href,
}: {
  stay: Holiday;
  travellers: number;
  href: string;
}) {
  const a = stay.accommodation;
  const d = deriveStay(stay, travellers);

  return (
    <article className="group flex overflow-hidden rounded-2xl border bg-card shadow-soft transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-[3px] hover:shadow-lift md:min-h-[208px]">
      {/* Image */}
      <div className="relative w-[140px] shrink-0 overflow-hidden sm:w-[248px]">
        {stay.image ? (
          <Image
            src={stay.image}
            alt={stay.imageAlt ?? stay.name}
            fill
            sizes="248px"
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
          />
        ) : (
          <Cover seed={stay.slug} className="absolute inset-0 h-full w-full" />
        )}
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.3),transparent_40%),linear-gradient(to_bottom,rgba(0,0,0,0.2),transparent_34%)]"
        />
        <div className="absolute left-3 top-3">
          {stay.status && <StatusChip label={STATUS_LABEL[stay.status]} />}
        </div>
        {d.rating && <RatingPill rating={d.rating} small />}
        {d.photoCount > 1 && <PhotoPill count={d.photoCount} small />}
      </div>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3.5 p-5">
        <div>
          <h3 className="font-display text-[21px] font-semibold tracking-[-0.01em] text-foreground">
            {stay.name}
          </h3>
          {stay.summary && (
            <p className="mt-1.5 line-clamp-2 text-[13px] leading-[1.45] text-muted-foreground">
              {stay.summary}
            </p>
          )}
          <SpecChips a={a} className="mt-[11px]" small />
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            {d.costed ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display text-2xl font-semibold tabular-nums text-foreground">
                    {formatGBP(d.total!)}
                  </span>
                  <span className="text-xs text-muted-foreground">· ~{formatGBP(d.perPerson!)}pp</span>
                </div>
                <CancelLine text={d.cancel} costed small />
              </>
            ) : (
              <>
                <div className="font-display text-[19px] font-semibold text-foreground/70">
                  Price to confirm
                </div>
                <CancelLine text={d.cancel} costed={false} small />
              </>
            )}
          </div>
          <Link
            href={href}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-input bg-card px-4 text-[13.5px] font-bold text-primary transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Details <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** Muted spec pills derived from the accommodation. `small` for compact tiles. */
function SpecChips({
  a,
  small,
  className,
}: {
  a: Holiday["accommodation"];
  small?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {a.bedrooms != null && (
        <SpecChip icon={BedDouble} small={small}>
          {a.bedrooms} {small ? "bed" : a.bedrooms === 1 ? "bedroom" : "bedrooms"}
        </SpecChip>
      )}
      {a.sleeps != null && (
        <SpecChip icon={Users} small={small}>
          Sleeps {a.sleeps}
        </SpecChip>
      )}
      {a.bathrooms != null && (
        <SpecChip icon={Bath} small={small}>
          {a.bathrooms} {small ? "bath" : a.bathrooms === 1 ? "bathroom" : "bathrooms"}
        </SpecChip>
      )}
      {a.privatePool && (
        <SpecChip icon={Waves} small={small}>
          {small ? "Pool" : "Private pool"}
        </SpecChip>
      )}
      {!small && a.airCon && (
        <SpecChip icon={Snowflake} small={small}>
          A/C
        </SpecChip>
      )}
    </div>
  );
}

function SpecChip({
  icon: Icon,
  children,
  small,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  small?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-muted font-semibold text-[hsl(198_28%_22%)]",
        small ? "h-[27px] px-2.5 text-[12px]" : "h-[30px] px-[11px] text-[12.5px]",
      )}
    >
      <Icon className={cn("opacity-70", small ? "h-3.5 w-3.5" : "h-[15px] w-[15px]")} />
      {children}
    </span>
  );
}

/** Green free-cancellation line (costed) or amber quote note (un-costed). */
function CancelLine({ text, costed, small }: { text: string; costed: boolean; small?: boolean }) {
  return (
    <div
      className={cn(
        "mt-2 inline-flex items-center gap-1.5 font-semibold",
        small ? "text-xs" : "text-[12.5px]",
        costed ? "text-success" : "text-warning",
      )}
    >
      {costed ? (
        <Check className={small ? "h-[13px] w-[13px]" : "h-3.5 w-3.5"} aria-hidden />
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
      )}
      {text}
    </div>
  );
}

/** Glass status chip over a photo — a dot + label, never colour alone. */
function StatusChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.34] bg-white/[0.18] py-1 pl-2 pr-2.5 text-[12px] font-semibold text-white backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
      {label}
    </span>
  );
}

function RatingPill({ rating, small }: { rating: string; small?: boolean }) {
  return (
    <div
      className={cn(
        "absolute inline-flex items-center gap-1.5 rounded-full bg-white/95 font-bold text-foreground",
        small ? "right-3 top-3 h-[26px] px-2.5 text-[12.5px]" : "right-[18px] top-[18px] h-[30px] px-3 text-sm",
      )}
    >
      <Star
        className={cn("text-warning", small ? "h-3 w-3" : "h-3.5 w-3.5")}
        style={{ fill: "currentColor" }}
        aria-hidden
      />
      {rating}
    </div>
  );
}

function PhotoPill({ count, small }: { count: number; small?: boolean }) {
  return (
    <div
      className={cn(
        "absolute inline-flex items-center gap-1.5 rounded-full bg-[rgba(8,28,34,0.56)] font-semibold text-white backdrop-blur-sm",
        small ? "bottom-3 right-3 h-6 px-2.5 text-[11.5px]" : "bottom-[18px] right-[18px] h-7 px-3 text-[12.5px]",
      )}
    >
      <Camera className={small ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />
      {small ? count : `${count} photos`}
    </div>
  );
}

function Dot() {
  return <span className="h-1 w-1 rounded-full bg-muted-foreground/50" aria-hidden />;
}

/** In-content action bar — matches the trip page's footer row; the global site
 *  footer sits below it. */
function Footer({
  trip,
  location,
}: {
  trip: { slug: string };
  location: { slug: string; name: string };
}) {
  return (
    <div className="flex flex-col gap-3 px-6 py-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-12">
      <span>
        Prices are party totals for the stay · figures shown as &ldquo;to confirm&rdquo; aren&rsquo;t
        quoted yet
      </span>
      <div className="flex flex-wrap items-center gap-4">
        <DeleteButton
          action={deleteLocation.bind(null, trip.slug, location.slug)}
          confirmText={`Remove ${location.name} and all its stays from this trip?`}
          className="h-auto border-0 px-0 text-[13px] hover:bg-transparent hover:opacity-80"
        >
          Remove location
        </DeleteButton>
        <Link
          href={`/${trip.slug}/${location.slug}/add`}
          className="inline-flex items-center gap-1.5 self-start font-semibold text-primary transition-opacity hover:opacity-80"
        >
          <Plus className="h-[15px] w-[15px]" /> Add another stay
        </Link>
      </div>
    </div>
  );
}
