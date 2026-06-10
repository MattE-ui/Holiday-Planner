import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  Clock,
  ExternalLink,
  Footprints,
  Info,
  MapPin,
  Pencil,
  Plane,
  Plus,
  Ruler,
  Snowflake,
  Star,
  Waves,
} from "lucide-react";
import { getHoliday } from "@/lib/store";
import { setStayStatus } from "@/lib/actions";
import { getTripSocial } from "@/lib/social";
import { getMember, isOwner } from "@/lib/member";
import { buildBreakdown } from "@/lib/pricing";
import { cn, formatGBP } from "@/lib/utils";
import { AccommodationGallery } from "@/components/accommodation-gallery";
import { StatusPicker } from "@/components/status-picker";
import { StayPickControl } from "@/components/vote-controls";
import { NotesSection } from "@/components/notes-section";
import type { Holiday, HolidayStatus, Location } from "@/content/types";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<HolidayStatus, string> = {
  idea: "Researching",
  shortlisted: "Shortlisted",
  favourite: "Favourite so far",
  booked: "Booked",
};

export default async function HolidayPage({
  params,
}: {
  params: { trip: string; location: string; holiday: string };
}) {
  const { trip, location, holiday } = await getHoliday(params.trip, params.location, params.holiday);
  if (!trip || !location || !holiday) notFound();

  const social = await getTripSocial(trip.slug);
  const member = getMember();
  const owner = isOwner();
  const path = `/${trip.slug}/${location.slug}/${holiday.slug}`;
  const stayVoters = social.stayVotes
    .filter((v) => v.locationSlug === location.slug && v.holidaySlug === holiday.slug)
    .map((v) => v.voter);
  const stayNotes = social.notes.filter((n) => n.holidaySlug === holiday.slug);

  const travellers = trip.travellers ?? 4;
  const a = holiday.accommodation;
  const stayCount = location.holidays.length;
  const ratingValue = holiday.rating?.replace(/\s*\/\s*10$/, "") ?? null;

  // Cover first, then extra photos. The count is honest — only images we hold.
  const images = [holiday.image, ...(holiday.photos ?? [])].filter(
    (src): src is string => Boolean(src),
  );
  const walk = a.walkToAmenities;

  return (
    <div className="bg-background pb-10">
      {/* Breadcrumb — the global SiteHeader sits above this. */}
      <div className="px-6 pb-3.5 pt-[18px] sm:px-12">
        <Link
          href={`/${trip.slug}/${location.slug}`}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-[15px] w-[15px]" /> {location.name} · {stayCount} stay
          {stayCount === 1 ? "" : "s"}
        </Link>
      </div>

      {/* Gallery */}
      <AccommodationGallery
        images={images}
        alt={holiday.imageAlt ?? holiday.name}
        name={holiday.name}
        slug={holiday.slug}
        photoCount={images.length}
        statusLabel={holiday.status ? STATUS_LABEL[holiday.status] : undefined}
      />

      {/* Body: main column + sticky price sidebar */}
      <div className="flex flex-col gap-11 px-6 pt-[30px] sm:px-12 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          {ratingValue && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
              <Star className="h-[15px] w-[15px] text-warning" style={{ fill: "currentColor" }} aria-hidden />
              {ratingValue}
              <span className="font-medium text-muted-foreground">· Excellent</span>
            </span>
          )}
          <h1 className="mt-2 font-display text-[clamp(2rem,4vw,2.875rem)] font-semibold leading-[1.02] tracking-[-0.025em] text-foreground">
            {holiday.name}
          </h1>
          <div className="mt-2.5 inline-flex items-center gap-2 text-[15px] text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden />
            {location.name}, {location.country}
            {walk && <> · {walk}</>}
          </div>
          {holiday.summary && (
            <p className="mt-4 max-w-[660px] text-[17px] leading-[1.6] text-foreground/80 [text-wrap:pretty]">
              {holiday.summary}
            </p>
          )}

          <div className="mt-5">
            <StayPickControl
              tripSlug={trip.slug}
              locationSlug={location.slug}
              holidaySlug={holiday.slug}
              path={path}
              member={member}
              voters={stayVoters}
            />
          </div>

          <EssentialsSection accommodation={a} location={location} />

          {a.extras && a.extras.length > 0 && (
            <Section title="What's included">
              <div className="grid max-w-[640px] grid-cols-1 gap-x-7 gap-y-2.5 sm:grid-cols-2">
                {a.extras.map((x) => (
                  <div key={x} className="flex items-center gap-2.5 text-[14.5px] text-foreground/80">
                    <Check className="h-4 w-4 shrink-0 text-success" aria-hidden /> {x}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {((holiday.pros && holiday.pros.length > 0) || (holiday.cons && holiday.cons.length > 0)) && (
            <Section title="Pros & cons">
              <div className="grid gap-6 md:grid-cols-2">
                {holiday.pros && holiday.pros.length > 0 && (
                  <ProsConsPanel tone="pros" heading="Why we're keen" items={holiday.pros} />
                )}
                {holiday.cons && holiday.cons.length > 0 && (
                  <ProsConsPanel tone="cons" heading="Worth noting" items={holiday.cons} />
                )}
              </div>
            </Section>
          )}

          <Section title="Where it is">
            <WhereItIs location={location} holiday={holiday} walk={walk} />
          </Section>

          <NotesSection
            className="mt-[38px]"
            intro={`Thoughts on ${holiday.name} itself — the pool, the bedrooms, the price.`}
            tripSlug={trip.slug}
            locationSlug={location.slug}
            holidaySlug={holiday.slug}
            notes={stayNotes}
            member={member}
            owner={owner}
            path={path}
            placeholder="What do you make of this one?"
          />
        </div>

        <PriceSidebar
          holiday={holiday}
          travellers={travellers}
          tripSlug={trip.slug}
          locationSlug={location.slug}
          owner={owner}
          statusAction={setStayStatus.bind(null, trip.slug, location.slug, holiday.slug)}
        />
      </div>

      {/* In-content action bar — the global footer sits below it. */}
      <div className="mt-2 flex flex-col gap-3 px-6 py-6 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-12">
        <span>Unconfirmed costs are shown honestly as &ldquo;to confirm&rdquo; — never an invented figure.</span>
        {owner && (
          <Link
            href={`/${trip.slug}/${location.slug}/add`}
            className="inline-flex items-center gap-1.5 self-start font-semibold text-primary transition-opacity hover:opacity-80"
          >
            <Plus className="h-[15px] w-[15px]" /> Compare another stay
          </Link>
        )}
      </div>
    </div>
  );
}

/** Section wrapper: a Spectral heading + content, generously spaced. */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-[38px]">
      <h2 className="mb-4 font-display text-2xl font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** A single essentials cell: accent icon tile + value + muted label. */
function Essential({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-[14px] border bg-card p-4">
      <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] bg-[hsl(190_38%_94%)] text-primary">
        <Icon className="h-[19px] w-[19px]" />
      </span>
      <div className="min-w-0">
        <div className="font-display text-[16.5px] font-semibold leading-[1.12] text-foreground">{value}</div>
        {label && <div className="mt-0.5 text-[12.5px] text-muted-foreground">{label}</div>}
      </div>
    </div>
  );
}

/** "The essentials" — a 3-col grid built honestly from whatever specs exist. */
function EssentialsSection({
  accommodation: a,
  location,
}: {
  accommodation: Holiday["accommodation"];
  location: Location;
}) {
  const cells: React.ReactNode[] = [];

  if (a.bedrooms != null)
    cells.push(
      <Essential
        key="beds"
        icon={BedDouble}
        value={`${a.bedrooms} ${a.bedrooms === 1 ? "bedroom" : "bedrooms"}`}
        label={a.sleeps != null ? `Sleeps ${a.sleeps}` : undefined}
      />,
    );
  if (a.bathrooms != null)
    cells.push(
      <Essential
        key="baths"
        icon={Bath}
        value={`${a.bathrooms} ${a.bathrooms === 1 ? "bathroom" : "bathrooms"}`}
      />,
    );
  if (a.sizeSqft != null)
    cells.push(
      <Essential
        key="size"
        icon={Ruler}
        value={`${a.sizeSqft.toLocaleString()} sq ft`}
        label={a.modern ? "Recently renovated" : undefined}
      />,
    );
  if (a.privatePool) cells.push(<Essential key="pool" icon={Waves} value="Private pool" />);
  if (a.airCon) cells.push(<Essential key="ac" icon={Snowflake} value="Air conditioning" />);
  if (location.flightTime)
    cells.push(
      <Essential
        key="flight"
        icon={Plane}
        value={`${location.flightTime.replace(/^~/, "")} flights`}
        label={location.airport?.split(" · ")[0]}
      />,
    );

  if (cells.length === 0) return null;

  return (
    <Section title="The essentials">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{cells}</div>
    </Section>
  );
}

/** The two-tone pros/cons panels — green "keen", amber "worth noting". */
function ProsConsPanel({
  tone,
  heading,
  items,
}: {
  tone: "pros" | "cons";
  heading: string;
  items: string[];
}) {
  const pros = tone === "pros";
  return (
    <div
      className={cn(
        "rounded-2xl border p-[18px_20px]",
        pros
          ? "border-[hsl(142_40%_82%)] bg-[hsl(142_45%_97%)]"
          : "border-[hsl(33_60%_82%)] bg-[hsl(36_70%_97%)]",
      )}
    >
      <div
        className={cn(
          "mb-3 text-[12.5px] font-bold uppercase tracking-[0.06em]",
          pros ? "text-success" : "text-warning",
        )}
      >
        {heading}
      </div>
      <div className="flex flex-col gap-[11px]">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2.5 text-[14.5px] text-foreground/80">
            {pros ? (
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden />
            ) : (
              <span
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center font-extrabold text-warning"
                aria-hidden
              >
                !
              </span>
            )}
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

/** "Where it is": a real map embed + a fact strip of the distances we know.
 *  With coordinates (e.g. from a Booking.com import) the map pins the exact
 *  accommodation; otherwise it falls back to the town. Either way a button
 *  opens the same spot in full Google Maps to look around. */
function WhereItIs({
  location,
  holiday,
  walk,
}: {
  location: Location;
  holiday: Holiday;
  walk?: string;
}) {
  const place = `${location.name}, ${location.country}`;
  const coords = holiday.coords;
  const mapSrc = coords
    ? `https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=16&output=embed`
    : `https://www.google.com/maps?q=${encodeURIComponent(place)}&z=12&output=embed`;
  const openHref = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${holiday.name}, ${place}`)}`;

  // Pull the harbour/town and beach distances out of the free-text walk line.
  const segments = walk?.split(";").map((s) => s.trim()) ?? [];
  const townLine = segments.find((s) => /town|harbour|harbor/i.test(s)) ?? walk;
  const beachLine = segments.find((s) => /beach|sea/i.test(s));

  const facts: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }[] = [];
  if (holiday.address) facts.push({ icon: MapPin, label: "Address", value: holiday.address });
  if (townLine && townLine !== holiday.address)
    facts.push({ icon: Footprints, label: "Town & amenities", value: townLine });
  if (location.airport)
    facts.push({
      icon: Plane,
      label: "Airport",
      value: location.flightTime
        ? `${location.airport.split(" · ")[0]} · ${location.flightTime.replace(/^~/, "")} flights`
        : location.airport,
    });
  if (beachLine && facts.length < 3) facts.push({ icon: Waves, label: "Beach", value: beachLine });

  return (
    <div className="overflow-hidden rounded-2xl border">
      <div className="relative">
        <iframe
          title={coords ? `Map showing ${holiday.name}` : `Map of ${place}`}
          src={mapSrc}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="block h-[290px] w-full border-0 grayscale-[0.15]"
        />
        <a
          href={openHref}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3.5 right-3.5 inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-bold text-primary shadow-lift transition-transform duration-300 hover:-translate-y-0.5"
        >
          Open in Google Maps <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        {!coords && (
          <span className="absolute left-3.5 top-3.5 rounded-full bg-[rgba(8,28,34,0.6)] px-3 py-1.5 text-[11.5px] font-semibold text-white backdrop-blur-sm">
            Approximate — showing {location.name}; add coordinates for the exact spot
          </span>
        )}
      </div>
      {facts.length > 0 && (
        <div
          className={cn(
            "grid divide-y bg-card sm:divide-x sm:divide-y-0",
            facts.length === 3 ? "sm:grid-cols-3" : facts.length === 2 ? "sm:grid-cols-2" : "",
          )}
        >
          {facts.map((f) => (
            <div key={f.label} className="p-[16px_18px]">
              <div className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
                <f.icon className="h-3.5 w-3.5" aria-hidden /> {f.label}
              </div>
              <div className="mt-1 text-[14.5px] font-semibold text-foreground">{f.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** A breakdown row: label + detail and either a £ figure or an amber "to confirm" pill. */
function PriceLine({ label, detail, amount }: { label: string; detail?: string; amount: number | null }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-foreground">{label}</div>
        {detail && <div className="mt-0.5 text-xs text-muted-foreground">{detail}</div>}
      </div>
      {amount != null ? (
        <span className="whitespace-nowrap text-[14.5px] font-bold tabular-nums text-foreground">
          {formatGBP(amount)}
        </span>
      ) : (
        <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-warning/10 px-2.5 py-1 text-[11.5px] font-bold text-warning">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden /> to confirm
        </span>
      )}
    </div>
  );
}

/** The honest price sidebar — headline accommodation total, full per-line
 *  breakdown, what's confirmed so far, status and the listing/edit actions. */
function PriceSidebar({
  holiday,
  travellers,
  tripSlug,
  locationSlug,
  owner,
  statusAction,
}: {
  holiday: Holiday;
  travellers: number;
  tripSlug: string;
  locationSlug: string;
  owner: boolean;
  statusAction: (status: HolidayStatus) => Promise<void>;
}) {
  const b = buildBreakdown(holiday, travellers);
  const total = holiday.accommodationTotal ?? null;
  const nights = holiday.nights ?? null;
  const perPerson = total != null && travellers > 0 ? Math.round(total / travellers) : null;
  const perNight = total != null && nights ? Math.round(total / nights) : null;
  const toConfirm = b.pending.length;

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-[90px] lg:w-[384px]">
      <div className="overflow-hidden rounded-[20px] border bg-card shadow-lift">
        {/* Headline */}
        <div className="p-[22px_24px_18px]">
          {total != null ? (
            <>
              <div className="flex items-baseline gap-2.5">
                <span className="font-display text-[38px] font-semibold leading-none text-foreground">
                  {formatGBP(total)}
                </span>
                <span className="text-[13.5px] text-muted-foreground">accommodation</span>
              </div>
              <div className="mt-1 text-[13.5px] text-muted-foreground">
                {nights != null && <>{nights} nights · </>}
                {perPerson != null && <>~{formatGBP(perPerson)}pp</>}
                {perNight != null && <> · ~{formatGBP(perNight)}/night</>}
              </div>
            </>
          ) : (
            <div className="flex items-baseline gap-2.5">
              <span className="font-display text-[30px] font-semibold leading-none text-foreground/80">
                Price to confirm
              </span>
            </div>
          )}
          {holiday.dates && (
            <div className="mt-3 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <CalendarDays className="h-[15px] w-[15px]" aria-hidden /> {holiday.dates}
            </div>
          )}
          {(holiday.checkIn || holiday.checkOut) && (
            <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Clock className="h-[15px] w-[15px] shrink-0" aria-hidden />
              <span>
                {holiday.checkIn && <>Check-in {holiday.checkIn}</>}
                {holiday.checkIn && holiday.checkOut && " · "}
                {holiday.checkOut && <>check-out {holiday.checkOut}</>}
              </span>
            </div>
          )}
        </div>

        {/* Per-line breakdown */}
        <div className="border-t px-6 py-1">
          {b.lines.map((line, i) => (
            <PriceLine key={i} label={line.label} detail={line.detail} amount={line.amount} />
          ))}
        </div>

        {/* Confirmed so far */}
        <div className="border-t bg-[hsl(190_34%_97%)] p-[16px_24px]">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <div className="text-[13px] text-muted-foreground">Confirmed so far</div>
              <div className="font-display text-[26px] font-semibold text-foreground">
                {formatGBP(b.knownTotal)}
              </div>
            </div>
            {toConfirm > 0 && (
              <div className="max-w-[130px] text-right text-[12.5px] font-semibold text-warning">
                + {toConfirm} cost{toConfirm === 1 ? "" : "s"} still to confirm
              </div>
            )}
          </div>
        </div>

        {/* Rate note */}
        {holiday.rateNote && (
          <div className="flex gap-2.5 border-t p-[14px_24px] text-[12.5px] leading-[1.45] text-muted-foreground">
            <Info className="mt-px h-4 w-4 shrink-0 text-accent" aria-hidden />
            <span>{holiday.rateNote}</span>
          </div>
        )}

        {/* Status — the owner moves stays through the pipeline; family members
            see where it stands via the chip on the gallery. */}
        {owner && (
          <div className="border-t p-[16px_24px]">
            <div className="mb-2.5 text-[13px] text-muted-foreground">Where this stay stands</div>
            <StatusPicker status={holiday.status ?? "idea"} action={statusAction} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-2.5 p-[16px_24px_22px]">
          {holiday.listingUrl && (
            <a
              href={holiday.listingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-[50px] items-center justify-center gap-2 rounded-full bg-primary text-[15px] font-bold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Open listing <ExternalLink className="h-[17px] w-[17px]" />
            </a>
          )}
          {owner && (
            <Link
              href={`/${tripSlug}/${locationSlug}/${holiday.slug}/edit`}
              className="inline-flex h-[46px] items-center justify-center gap-2 rounded-full border border-input text-[14.5px] font-bold text-primary transition-colors hover:bg-muted"
            >
              <Pencil className="h-4 w-4" aria-hidden /> Edit details & costs
            </Link>
          )}
        </div>
      </div>
      <p className="mx-1 mt-3 text-center text-xs text-muted-foreground">
        Unconfirmed costs shown honestly — nothing hidden.
      </p>
    </aside>
  );
}
