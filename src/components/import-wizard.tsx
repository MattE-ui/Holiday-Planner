"use client";

import { useState, useTransition } from "react";
import { Check, Link2, Loader2, MapPin, Star } from "lucide-react";
import { normalizeMarkup, type ParsedBooking } from "@/lib/booking";
import { importStay, parseBookingLink, parsePastedListing, type ImportParseResult } from "@/lib/actions";
import { Field, FormSection, Input, Select, TextArea } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";

type TripOption = NonNullable<ImportParseResult["trips"]>[number];

/**
 * Two-step Booking.com import. Step 1 fetches and parses the listing
 * server-side; step 2 shows what was found, asks which trip/location the stay
 * belongs to (create either inline), lets the user fill the price the listing
 * quoted, and saves. Anything the parser couldn't read is left blank — the
 * stay still saves cleanly and shows costs as "to confirm".
 */
export function ImportWizard({
  preselectTrip,
  preselectLocation,
}: {
  preselectTrip?: string;
  preselectLocation?: string;
}) {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedBooking | null>(null);
  const [trips, setTrips] = useState<TripOption[]>([]);
  const [pending, startTransition] = useTransition();

  const parse = () => {
    setError(null);
    startTransition(async () => {
      const result = await parseBookingLink(url);
      if (!result.ok || !result.parsed) {
        setError(result.error ?? "Couldn't read that listing.");
        return;
      }
      setParsed(result.parsed);
      setTrips(result.trips ?? []);
    });
  };

  // Booking.com blocked the fetch → the user pastes the page source; merge the
  // richer result over the URL-derived one (keeping dates mined from the link).
  // The source is megabytes, so condense it to the fragments the parser reads
  // before it crosses the wire (server actions have a body size limit).
  const parsePaste = (html: string) => {
    if (!parsed) return;
    setError(null);
    startTransition(async () => {
      const result = await parsePastedListing(condenseListingHtml(html), parsed.url);
      if (!result.ok || !result.parsed) {
        setError(result.error ?? "Couldn't read that page source.");
        return;
      }
      const next = result.parsed;
      setParsed({
        ...parsed,
        ...Object.fromEntries(Object.entries(next).filter(([, v]) => v != null && v !== "")),
        photos: next.photos.length ? next.photos : parsed.photos,
        nights: next.nights ?? parsed.nights,
        dates: next.dates ?? parsed.dates,
        source: "pasted",
      });
      setTrips(result.trips ?? []);
    });
  };

  if (!parsed) {
    return (
      <div>
        <Field
          label="Booking.com link"
          hint="A share link (booking.com/Share-…) or the full property page URL both work."
        >
          <div className="flex gap-3">
            <Input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (url.trim()) parse();
                }
              }}
              placeholder="https://www.booking.com/Share-…"
              autoFocus
            />
            <button
              type="button"
              onClick={parse}
              disabled={pending || !url.trim()}
              className="inline-flex h-[46px] shrink-0 items-center gap-2 rounded-full bg-primary px-6 text-[14.5px] font-bold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
              {pending ? "Reading listing…" : "Fetch"}
            </button>
          </div>
        </Field>
        {error && (
          <p className="mt-4 rounded-[12px] border border-danger/30 bg-danger/5 px-4 py-3 text-[14px] text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <ImportDetails
      parsed={parsed}
      trips={trips}
      preselectTrip={preselectTrip}
      preselectLocation={preselectLocation}
      onBack={() => setParsed(null)}
      onPaste={parsePaste}
      pastePending={pending}
      pasteError={error}
    />
  );
}

function ImportDetails({
  parsed,
  trips,
  preselectTrip,
  preselectLocation,
  onBack,
  onPaste,
  pastePending,
  pasteError,
}: {
  parsed: ParsedBooking;
  trips: TripOption[];
  preselectTrip?: string;
  preselectLocation?: string;
  onBack: () => void;
  onPaste: (html: string) => void;
  pastePending: boolean;
  pasteError: string | null;
}) {
  const [pasteHtml, setPasteHtml] = useState("");
  const initialTrip =
    (preselectTrip && trips.find((t) => t.slug === preselectTrip)?.slug) ??
    (trips.length === 1 ? trips[0].slug : trips.length ? "" : "__new__");
  const [tripSlug, setTripSlug] = useState(initialTrip);
  const selectedTrip = trips.find((t) => t.slug === tripSlug);

  const initialLocation =
    preselectLocation && selectedTrip?.locations.some((l) => l.slug === preselectLocation)
      ? preselectLocation
      : "";
  const [locationSlug, setLocationSlug] = useState(initialLocation);

  const hasSpecs =
    parsed.bedrooms != null || parsed.bathrooms != null || parsed.sleeps != null || parsed.sizeSqft != null;
  const found: { ok: boolean; label: string }[] = [
    { ok: !!parsed.name, label: "Name" },
    { ok: parsed.photos.length > 0, label: `${parsed.photos.length} photos` },
    { ok: !!parsed.rating, label: "Guest rating" },
    { ok: !!parsed.address, label: "Address" },
    { ok: !!parsed.coords, label: "Exact map location" },
    { ok: hasSpecs, label: "Rooms & size" },
    { ok: parsed.accommodationTotal != null, label: "Quoted price" },
    { ok: (parsed.extras?.length ?? 0) > 0, label: "Facilities" },
  ];

  return (
    <div>
      {/* ── What we found ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-[18px] border bg-card shadow-soft">
        {parsed.photos.length > 0 && (
          <div className="flex gap-1 overflow-x-auto bg-muted/40 p-1">
            {parsed.photos.slice(0, 5).map((p) => (
              // Plain <img>: these are externally-hosted preview thumbs in a client flow.
              // eslint-disable-next-line @next/next/no-img-element
              <img key={p} src={p} alt="" className="h-[110px] w-[150px] shrink-0 rounded-[10px] object-cover" />
            ))}
          </div>
        )}
        <div className="p-5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="font-display text-[24px] font-semibold tracking-[-0.01em] text-foreground">
              {parsed.name ?? "Unnamed listing"}
            </h2>
            {parsed.rating && (
              <span className="inline-flex items-center gap-1 text-sm font-bold text-foreground">
                <Star className="h-3.5 w-3.5 text-warning" style={{ fill: "currentColor" }} aria-hidden />
                {parsed.rating}
              </span>
            )}
          </div>
          {parsed.address && (
            <div className="mt-1.5 inline-flex items-center gap-1.5 text-[13.5px] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" aria-hidden /> {parsed.address}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {found.map((f) => (
              <span
                key={f.label}
                className={
                  f.ok
                    ? "inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-[12px] font-semibold text-success"
                    : "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[12px] font-semibold text-muted-foreground line-through decoration-muted-foreground/40"
                }
              >
                {f.ok && <Check className="h-3 w-3" aria-hidden />}
                {f.label}
              </span>
            ))}
          </div>
          <button
            type="button"
            onClick={onBack}
            className="mt-3 text-[13px] font-semibold text-primary transition-opacity hover:opacity-80"
          >
            ← Use a different link
          </button>
        </div>
      </div>

      {/* Booking.com blocked the automated read — offer the page-source route. */}
      {parsed.source === "url-only" && (
        <div className="mt-5 rounded-[16px] border border-warning/40 bg-[hsl(36_70%_97%)] p-5">
          <div className="text-[13px] font-bold uppercase tracking-[0.06em] text-warning">
            Partial read
          </div>
          <p className="mt-1.5 text-[14px] leading-[1.55] text-foreground/80">
            Booking.com blocks automated reads of the full page, so only the link itself was mined
            (name, country{parsed.dates ? ", your dates" : ""}). For the photos, exact map pin,
            address and rating: open the listing in your browser, right-click →{" "}
            <strong>View page source</strong>, select all, copy, and paste it here.
          </p>
          <textarea
            value={pasteHtml}
            onChange={(e) => setPasteHtml(e.target.value)}
            rows={4}
            placeholder="Paste the listing's page source…"
            className="mt-3 w-full rounded-[12px] border border-input bg-card px-3.5 py-2.5 font-mono text-[12px] text-foreground placeholder:font-sans placeholder:text-[14px] placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="button"
            onClick={() => onPaste(pasteHtml)}
            disabled={pastePending || pasteHtml.trim().length < 100}
            className="mt-3 inline-flex h-10 items-center gap-2 rounded-full bg-primary px-5 text-[13.5px] font-bold text-primary-foreground disabled:opacity-60"
          >
            {pastePending && <Loader2 className="h-4 w-4 animate-spin" />}
            Read the pasted page
          </button>
          {pasteError && <p className="mt-2.5 text-[13px] font-semibold text-danger">{pasteError}</p>}
          <p className="mt-2.5 text-[12.5px] text-muted-foreground">
            Or just carry on below — everything can be filled in by hand and edited later.
          </p>
        </div>
      )}

      {/* ── Where it belongs + the details ───────────────────────────── */}
      <form action={importStay}>
        {/* Parsed fields the user doesn't need to retype. */}
        <input type="hidden" name="listingUrl" value={parsed.url} />
        <input type="hidden" name="rating" value={parsed.rating ?? ""} />
        <input type="hidden" name="address" value={parsed.address ?? ""} />
        <input type="hidden" name="lat" value={parsed.coords?.lat ?? ""} />
        <input type="hidden" name="lng" value={parsed.coords?.lng ?? ""} />
        <input type="hidden" name="photos" value={parsed.photos.join("\n")} />
        {/* Spec chips on the comparison cards key off these booleans. */}
        {parsed.extras?.some((e) => /\b(?:private |swimming |outdoor |plunge )?pool\b/i.test(e)) && (
          <input type="hidden" name="privatePool" value="on" />
        )}
        {parsed.extras?.some((e) => /air[- ]?condition/i.test(e)) && (
          <input type="hidden" name="airCon" value="on" />
        )}

        <FormSection title="Which holiday is this for?">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Trip">
              <Select
                name="tripSlug"
                value={tripSlug}
                onChange={(e) => {
                  setTripSlug(e.target.value);
                  setLocationSlug("");
                }}
                required
              >
                {trips.length === 0 ? null : <option value="" disabled>Choose a trip…</option>}
                {trips.map((t) => (
                  <option key={t.slug} value={t.slug}>
                    {t.name}
                  </option>
                ))}
                <option value="__new__">＋ New trip…</option>
              </Select>
            </Field>
            {tripSlug === "__new__" ? (
              <Field label="New trip name">
                <Input name="newTripName" required placeholder="e.g. Summer Holiday 2027" />
              </Field>
            ) : (
              <Field label="Location">
                <Select
                  name="locationSlug"
                  value={locationSlug}
                  onChange={(e) => setLocationSlug(e.target.value)}
                  required
                  disabled={!selectedTrip}
                >
                  <option value="" disabled>
                    {selectedTrip ? "Choose a location…" : "Choose a trip first"}
                  </option>
                  {selectedTrip?.locations.map((l) => (
                    <option key={l.slug} value={l.slug}>
                      {l.name}, {l.country}
                    </option>
                  ))}
                  <option value="__new__">＋ New location…</option>
                </Select>
              </Field>
            )}
          </div>

          {tripSlug === "__new__" && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="When (roughly)">
                <Input name="newTripWindow" placeholder="e.g. Late September – October 2027" />
              </Field>
              <Field label="Travellers">
                <Input name="newTripTravellers" type="number" min={1} placeholder="4" />
              </Field>
            </div>
          )}

          {(tripSlug === "__new__" || locationSlug === "__new__") && (
            <div className="mt-4 grid gap-4 rounded-[14px] border border-dashed bg-muted/30 p-4 sm:grid-cols-2">
              <Field label="Location name" hint="Pre-filled from the listing where possible.">
                <Input name="newLocationName" required key={`lc-${parsed.city}`} defaultValue={parsed.city ?? ""} placeholder="e.g. Kalkan" />
              </Field>
              <Field label="Country">
                <Input name="newLocationCountry" required key={`co-${parsed.country}`} defaultValue={parsed.country ?? ""} placeholder="e.g. Turkey" />
              </Field>
            </div>
          )}
        </FormSection>

        <FormSection
          title="The stay"
          hint="Check what was read from the listing and add what only you know — dates and the price you were quoted."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" className="sm:col-span-2">
              <Input name="name" required key={parsed.name} defaultValue={parsed.name ?? ""} />
            </Field>
            <Field label="Summary" className="sm:col-span-2">
              <TextArea name="summary" key={parsed.summary?.slice(0, 40)} defaultValue={trimSummary(parsed.summary)} />
            </Field>
            <Field label="Nights">
              <Input name="nights" type="number" min={1} key={`n-${parsed.nights}`} defaultValue={parsed.nights} />
            </Field>
            <Field label="Dates" hint="e.g. 4–9 Oct 2026">
              <Input name="dates" key={`d-${parsed.dates}`} defaultValue={parsed.dates} />
            </Field>
            <Field
              label="Accommodation total (£)"
              hint={
                parsed.accommodationTotal != null
                  ? "Read from the listing for your dates — double-check it."
                  : "The party total quoted — leave blank for “to confirm”."
              }
            >
              <Input
                name="accommodationTotal"
                inputMode="decimal"
                key={`t-${parsed.accommodationTotal}`}
                defaultValue={parsed.accommodationTotal ?? ""}
              />
            </Field>
            <Field label="Rate note" hint="e.g. free cancellation until 29 Sep">
              <Input name="rateNote" key={`r-${parsed.rateNote}`} defaultValue={parsed.rateNote ?? ""} />
            </Field>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-4">
            <Field label="Bedrooms">
              <Input name="bedrooms" type="number" min={0} key={`b-${parsed.bedrooms}`} defaultValue={parsed.bedrooms ?? ""} />
            </Field>
            <Field label="Sleeps">
              <Input name="sleeps" type="number" min={0} key={`s-${parsed.sleeps}`} defaultValue={parsed.sleeps ?? ""} />
            </Field>
            <Field label="Bathrooms">
              <Input name="bathrooms" type="number" min={0} step="0.5" key={`ba-${parsed.bathrooms}`} defaultValue={parsed.bathrooms ?? ""} />
            </Field>
            <Field label="Size (sq ft)">
              <Input name="sizeSqft" type="number" min={0} key={`sz-${parsed.sizeSqft}`} defaultValue={parsed.sizeSqft ?? ""} />
            </Field>
          </div>
          <div className="mt-4">
            <Field
              label="What's included"
              hint={
                parsed.extras?.length
                  ? "Facilities read from the listing — prune to what matters for the comparison."
                  : "One per line — pool, parking, WiFi…"
              }
            >
              <TextArea
                name="extras"
                rows={5}
                key={`e-${parsed.extras?.length}`}
                defaultValue={parsed.extras?.join("\n") ?? ""}
              />
            </Field>
          </div>
        </FormSection>

        <div className="mt-10 flex items-center gap-4 border-t pt-6">
          <SubmitButton>Save this stay</SubmitButton>
        </div>
      </form>
    </div>
  );
}

/**
 * Reduce pasted page source (often 3–10 MB) to just the fragments the server
 * parser reads: JSON-LD blocks, meta tags, coordinate attributes and photo
 * URLs. Typically a few KB — comfortably inside the server-action body limit.
 */
export function condenseListingHtml(rawHtml: string): string {
  const html = normalizeMarkup(rawHtml);
  const parts: string[] = [];

  // Structured data blocks (name, address, rating, geo).
  for (const m of Array.from(
    html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi),
  )) {
    parts.push(m[0]);
  }
  // og: meta tags (title/description/image fallbacks).
  for (const m of Array.from(html.matchAll(/<meta[^>]*property=["']og:[^>]*>/gi))) {
    parts.push(m[0]);
  }
  // Exact-pin coordinates.
  const atlas = html.match(/data-atlas-latlng=["'][^"']+["']/);
  if (atlas) parts.push(`<div ${atlas[0]}></div>`);
  const lat = html.match(/b_map_center_latitude\s*[=:]\s*-?\d+(?:\.\d+)?/);
  const lng = html.match(/b_map_center_longitude\s*[=:]\s*-?\d+(?:\.\d+)?/);
  if (lat && lng) parts.push(`<script>${lat[0]}; ${lng[0]};</script>`);

  // Stay dates embedded by the classic page.
  for (const re of [/b_checkin_date["']?\s*[=:]\s*["']\d{4}-\d{2}-\d{2}/, /b_checkout_date["']?\s*[=:]\s*["']\d{4}-\d{2}-\d{2}/]) {
    const m = html.match(re);
    if (m) parts.push(m[0] + "'");
  }

  // Unit specs & quoted price, in document order so the parser's
  // first-match-wins picks the property's own header figures.
  for (const re of [
    /"(?:max_persons|maxPersons|maxGuests|max_occupancy|maxOccupancy|nr_bedrooms|numberOfBedrooms|nr_bathrooms|numberOfBathrooms)"\s*:\s*"?\d+/g,
    /\d+\s*(?:bedrooms?|bathrooms?)\b/gi,
    /(?:sleeps|max\.?\s*(?:people|persons|guests)\D{0,6})\s*\d+/gi,
    /Recommended for\s*\d+\s*adults?/gi,
    /\d+(?:[.,]\d+)?\s*(?:ft²|ft&#178;|ft&sup2;|sq\.?\s?ft|sqft|m²|m&#178;|m&sup2;|\bsqm\b)/gi,
    /"grossPrice"\s*:\s*\{[^{}]*\}/g,
  ]) {
    for (const m of Array.from(html.matchAll(re)).slice(0, 12)) parts.push(m[0]);
  }
  const priceBlock = html.match(/data-testid="price-and-discounted-price"[\s\S]{0,600}/);
  if (priceBlock) parts.push(priceBlock[0]);
  // The selected room's stay block (price + refundability live around it).
  const stayIdx = html.search(/\d+\s*nights?,\s*\d+\s*adults?/i);
  if (stayIdx >= 0) parts.push(html.slice(Math.max(0, stayIdx - 2000), stayIdx + 2000));

  // The payable total renders just before "Includes taxes and charges".
  for (const m of Array.from(html.matchAll(/Includes taxes and charges/gi)).slice(0, 4)) {
    parts.push(html.slice(Math.max(0, m.index! - 400), m.index! + 30));
  }

  // "About this property" — the real summary copy (anchor varies by page age).
  const desc =
    html.match(/property_description_content[\s\S]{0,7000}/i) ??
    html.match(/data-testid="property-description"[\s\S]{0,7000}/i) ??
    html.match(/About this property[\s\S]{0,7000}/i);
  if (desc) parts.push(desc[0]);

  // Pill lists (property highlights + popular facilities). Each pill carries
  // a multi-KB inline SVG icon — strip those so the fragment stays small.
  for (const re of [
    /(?:data-testid="property-highlights"|property[-_]highlights)[\s\S]{0,30000}/i,
    /Most popular facilities[\s\S]{0,30000}/i,
  ]) {
    const m = html.match(re);
    if (m) parts.push(m[0].replace(/<svg[\s\S]*?<\/svg>/gi, " "));
  }
  // Every £ amount, so the server's frequency fallback still works.
  const pounds = Array.from(html.matchAll(/(?:£|&#163;|&pound;)\s?[\d,]+(?:\.\d{1,2})?/g), (m) => m[0]);
  if (pounds.length) parts.push(pounds.slice(0, 300).join(" "));

  // Facilities: the classic page's data-name-en pills, embedded-state shapes,
  // the visible section — plus any dated free-cancellation line.
  for (const re of [
    /<[^>]*important_facilit[^>]*>/gi,
    /"__typename"\s*:\s*"(?:Facility|FacilityBlockFacility|BaseFacility)"[^{}]*?"name"\s*:\s*"[^"]{3,40}"/g,
    /"name"\s*:\s*"[^"]{3,40}"\s*,\s*"__typename"\s*:\s*"(?:Facility|FacilityBlockFacility|BaseFacility)"/g,
    /"facility_name"\s*:\s*"[^"]{3,40}"/g,
  ]) {
    for (const m of Array.from(html.matchAll(re)).slice(0, 40)) parts.push(m[0]);
  }
  const cancel = html.match(/Free cancellation\s+(?:before|until)\s+\d[^<>"&{}]{2,40}/i);
  if (cancel) parts.push(cancel[0]);

  // Gallery photo URLs (the parser dedupes size variants and keeps up to 200).
  const photoHtml = html.replace(/\\\//g, "/");
  const photos = Array.from(
    photoHtml.matchAll(/https:\/\/cf\.bstatic\.com\/xdata\/images\/hotel\/[^"'\\\s]+?\.jpe?g[^"'\\\s]*/g),
    (m) => m[0],
  ).slice(0, 1500);
  if (photos.length) parts.push(photos.join("\n"));

  // If nothing matched (odd copy), fall back to the raw paste — the raised
  // body limit still gives it a chance.
  return parts.length ? parts.join("\n") : html;
}

/** Booking descriptions can run very long — keep the seed summary readable. */
function trimSummary(s?: string): string {
  if (!s) return "";
  if (s.length <= 360) return s;
  const cut = s.slice(0, 360);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(". ") + 1, 280))}`.trim();
}
