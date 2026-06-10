// ---------------------------------------------------------------------------
// Booking.com listing parser. Fetches a listing (share links like
// booking.com/Share-xxxx redirect to the full page) and extracts everything we
// can read honestly: name, description, address, exact coordinates, rating and
// the listing's own photos. Anything it can't find is simply left blank for
// the user to fill in — never invented.
// Server-only: uses fetch from the Node runtime to avoid CORS.
// ---------------------------------------------------------------------------

export interface ParsedBooking {
  /** The resolved listing URL (share links expand to the real page). */
  url: string;
  name?: string;
  summary?: string;
  address?: string;
  city?: string;
  country?: string;
  coords?: { lat: number; lng: number };
  /** e.g. "8.7 / 10" */
  rating?: string;
  /** Lead photo, then the rest of the gallery we found. */
  photos: string[];
  /** Derived from checkin/checkout params when the link carries them. */
  nights?: number;
  dates?: string;
  /** Unit specs mined from the page where present. */
  bedrooms?: number;
  bathrooms?: number;
  sleeps?: number;
  sizeSqft?: number;
  /** Quoted GBP total for the searched dates, when the page carries one. */
  accommodationTotal?: number;
  /** Facilities list → the stay's "What's included". */
  extras?: string[];
  /** Cancellation line, e.g. "Free cancellation before 29 September". */
  rateNote?: string;
  /** "full" = read the page; "url-only" = Booking.com blocked the fetch and
   *  only the link itself was mined; "pasted" = parsed from pasted page source. */
  source: "full" | "url-only" | "pasted";
}

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export function isBookingUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname;
    return host === "booking.com" || host.endsWith(".booking.com");
  } catch {
    return false;
  }
}

export async function parseBookingListing(rawUrl: string): Promise<ParsedBooking> {
  const url = rawUrl.trim();
  if (!isBookingUrl(url)) {
    throw new Error("That doesn't look like a Booking.com link.");
  }

  const res = await fetch(url, {
    headers: {
      "User-Agent": UA,
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "en-GB,en;q=0.9",
    },
    redirect: "follow",
    cache: "no-store",
  });
  const finalUrl = res.url || url;
  const html = res.ok ? await res.text() : "";

  // Booking.com fronts listings with a JS bot-check; a server fetch usually
  // gets the challenge shell, not the page. The redirect still resolved the
  // share link though, and the real URL carries name, country and dates —
  // mine those, and let the user paste the page source for the rest.
  const looksBlocked = !res.ok || html.length < 20000 || !/application\/ld\+json|data-atlas-latlng/.test(html);
  if (looksBlocked) {
    return parseFromUrl(finalUrl);
  }

  const parsed = parseBookingHtml(html, finalUrl);
  return { ...parsed, source: "full" };
}

/** Mine what the listing URL itself carries — property slug, country, dates. */
function parseFromUrl(finalUrl: string): ParsedBooking {
  const result: ParsedBooking = { url: finalUrl, photos: [], source: "url-only" };

  const slugMatch = finalUrl.match(/\/hotel\/([a-z]{2})\/([a-z0-9-]+?)(?:\.[a-z]{2}(?:-[a-z]{2})?)?\.html/i);
  if (!slugMatch) {
    throw new Error(
      "Booking.com blocked the automated read and the link doesn't identify a property. Open the listing in a browser and paste the property page URL (…/hotel/…), or paste the page source below.",
    );
  }
  result.country = COUNTRY_NAMES[slugMatch[1]] ?? slugMatch[1].toUpperCase();
  result.name = slugMatch[2]
    .split("-")
    .map((w) => (w.length > 2 ? w[0].toUpperCase() + w.slice(1) : w.toUpperCase()))
    .join(" ");

  try {
    const params = new URL(finalUrl).searchParams;
    const checkin = params.get("checkin");
    const checkout = params.get("checkout");
    if (checkin && checkout) {
      const inDate = new Date(checkin);
      const outDate = new Date(checkout);
      const nights = Math.round((outDate.getTime() - inDate.getTime()) / 86400000);
      if (nights > 0) {
        result.nights = nights;
        result.dates = formatDateRange(inDate, outDate);
      }
    }
  } catch {
    /* dates stay blank */
  }
  return result;
}

/** e.g. (2026-10-04, 2026-10-09) → "4–9 Oct 2026" */
function formatDateRange(a: Date, b: Date): string {
  const sameMonth = a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
  const month = (d: Date) => d.toLocaleString("en-GB", { month: "short" });
  if (sameMonth) return `${a.getDate()}–${b.getDate()} ${month(b)} ${b.getFullYear()}`;
  return `${a.getDate()} ${month(a)} – ${b.getDate()} ${month(b)} ${b.getFullYear()}`;
}

/** Make saved page sources parseable.
 *
 *  A browser's view-source page saved as HTML wraps the original source in
 *  syntax-highlighting spans with every original tag entity-escaped
 *  (`&lt;div <span class="html-attribute-name">…`). Unwrap that: drop the
 *  highlighter's own tags, then decode the escapes to recover the original.
 *  Also collapse pretty-printed attribute spacing (`= " value "`). */
export function normalizeMarkup(html: string): string {
  if (/class="html-(?:tag|attribute-name|attribute-value)"/.test(html)) {
    html = html
      .replace(/<[^>]+>/g, "") // highlighter chrome; the real source is escaped text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;|&apos;/g, "'")
      .replace(/&amp;/g, "&"); // last, so double-escapes resolve correctly
  }
  return html.replace(/\s*=\s*"\s*([^"]*?)\s*"/g, '="$1"');
}

/** Parse a listing's HTML — from our own fetch or pasted page source. */
export function parseBookingHtml(rawHtml: string, finalUrl: string): ParsedBooking {
  const html = normalizeMarkup(rawHtml);
  const result: ParsedBooking = { url: finalUrl, photos: [], source: "pasted" };

  // ---- JSON-LD (the most reliable source) --------------------------------
  const ldBlocks = Array.from(
    html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
  );
  for (const m of ldBlocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(m[1]);
    } catch {
      continue;
    }
    for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
      const obj = node as Record<string, any>;
      if (!obj || typeof obj !== "object") continue;
      const type = String(obj["@type"] ?? "");
      if (!/Hotel|LodgingBusiness|Apartment|House|Residence|BedAndBreakfast|Hostel|Resort/i.test(type)) continue;

      if (typeof obj.name === "string") result.name = decodeEntities(obj.name);
      if (typeof obj.description === "string") result.summary = decodeEntities(obj.description);
      const addr = obj.address;
      if (typeof addr === "string" && addr.trim()) {
        // Booking sometimes ships the address as one string — keep it whole
        // and pull a city-ish segment out of it.
        result.address = dedupeSegments(decodeEntities(addr.trim())).join(", ");
        result.city = extractCity(result.address);
      } else if (addr && typeof addr === "object") {
        // Fields often overlap (streetAddress may already carry the locality
        // and postcode) — join, then dedupe the comma segments.
        const joined = [addr.streetAddress, addr.addressLocality, addr.postalCode, addr.addressRegion]
          .filter((p: unknown): p is string => typeof p === "string" && p.trim().length > 0)
          .map((p: string) => decodeEntities(p.trim()))
          .join(", ");
        if (joined) result.address = dedupeSegments(joined).join(", ");
        // The full address line names the postal town (e.g. "07960 Kalkan"),
        // which beats addressLocality — often the wider district (e.g. Kaş).
        if (result.address) result.city = extractCity(result.address);
        if (!result.city && typeof addr.addressLocality === "string" && addr.addressLocality.trim())
          result.city = extractCity(decodeEntities(addr.addressLocality.trim()));
        if (typeof addr.addressCountry === "string") result.country = decodeEntities(addr.addressCountry.trim());
      }
      const rating = obj.aggregateRating;
      if (rating && typeof rating === "object" && rating.ratingValue != null) {
        result.rating = `${rating.ratingValue} / ${rating.bestRating ?? 10}`;
      }
      const geo = obj.geo;
      if (geo && typeof geo === "object" && isFinite(+geo.latitude) && isFinite(+geo.longitude)) {
        result.coords = { lat: +geo.latitude, lng: +geo.longitude };
      }
      if (typeof obj.image === "string") result.photos.push(normalisePhoto(obj.image));
      // hasMap sometimes carries "center=lat,lng"
      if (!result.coords && typeof obj.hasMap === "string") {
        const c = obj.hasMap.match(/center=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
        if (c) result.coords = { lat: +c[1], lng: +c[2] };
      }
    }
  }

  // ---- Coordinates: the hotel pin, not the city centre --------------------
  if (!result.coords) {
    const atlas = html.match(/data-atlas-latlng=["'](-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)["']/);
    if (atlas) result.coords = { lat: +atlas[1], lng: +atlas[2] };
  }
  if (!result.coords) {
    const lat = html.match(/b_map_center_latitude\s*[=:]\s*(-?\d+(?:\.\d+)?)/);
    const lng = html.match(/b_map_center_longitude\s*[=:]\s*(-?\d+(?:\.\d+)?)/);
    if (lat && lng) result.coords = { lat: +lat[1], lng: +lng[1] };
  }

  // ---- Fallbacks from og: meta tags ---------------------------------------
  if (!result.name) {
    const og = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    if (og) result.name = decodeEntities(og[1]).replace(/,?\s*(?:updated )?\d{4}? ?prices.*$/i, "").trim();
  }
  if (!result.summary) {
    const og = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    if (og) result.summary = decodeEntities(og[1]);
  }
  if (result.photos.length === 0) {
    const og = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
    if (og) result.photos.push(normalisePhoto(decodeEntities(og[1])));
  }

  // ---- Gallery photos -------------------------------------------------------
  // Photo URLs often sit inside JSON with escaped slashes — normalise first.
  const photoHtml = html.replace(/\\\//g, "/");
  const photoIds = new Set<string>(result.photos.map(photoId).filter(Boolean) as string[]);
  const photoMatches = Array.from(
    photoHtml.matchAll(/https:\/\/cf\.bstatic\.com\/xdata\/images\/hotel\/[^"'\\\s]+?\.jpe?g[^"'\\\s]*/g),
  );
  for (const m of photoMatches) {
    if (result.photos.length >= 200) break;
    const photo = normalisePhoto(decodeEntities(m[0]));
    const id = photoId(photo);
    if (!id || photoIds.has(id)) continue;
    photoIds.add(id);
    result.photos.push(photo);
  }

  // ---- Summary: prefer the "About this property" text -----------------------
  // The JSON-LD/meta description is truncated with "…"; the description
  // section carries the real copy. Try the known anchors for it in turn.
  for (const re of [
    /property_description_content[\s\S]{0,7000}/i,
    /data-testid="property-description"[\s\S]{0,7000}/i,
    /About this property[\s\S]{0,7000}/i,
  ]) {
    const section = html.match(re);
    if (!section) continue;
    // Strip tags, decode entities, then strip again — the section can occur
    // inside entity-escaped markup where tags only appear after decoding.
    const text = decodeEntities(
      section[0]
        .slice(section[0].indexOf(">") + 1)
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " "),
    )
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^About this property\s*/i, "")
      .trim();
    if (text.length > 80) {
      result.summary = text.slice(0, 700).trim();
      break;
    }
  }

  // ---- Stay dates: the classic page embeds the searched dates -------------
  const ci = html.match(/b_checkin_date["']?\s*[=:]\s*["'](\d{4}-\d{2}-\d{2})/);
  const co = html.match(/b_checkout_date["']?\s*[=:]\s*["'](\d{4}-\d{2}-\d{2})/);
  if (ci && co) {
    const inDate = new Date(ci[1]);
    const outDate = new Date(co[1]);
    const nights = Math.round((outDate.getTime() - inDate.getTime()) / 86400000);
    if (nights > 0) {
      result.nights = nights;
      result.dates = formatDateRange(inDate, outDate);
    }
  }

  // ---- Unit specs & quoted price -------------------------------------------
  result.sleeps = firstInt(html, [
    /"(?:max_persons|maxPersons|maxGuests|max_occupancy|maxOccupancy)"\s*:\s*"?(\d+)/,
    /b_max_persons\s*[=:]\s*'?(\d+)/,
    /max\.?\s*(?:people|persons|guests)\D{0,6}(\d+)/i,
    /Recommended for\s*(\d+)\s*adults?/i,
    /sleeps\s*(\d+)/i,
  ], 1, 50);
  result.bedrooms = firstInt(html, [/(\d+)\s*bedrooms?\b/i, /"(?:nr_bedrooms|numberOfBedrooms)"\s*:\s*"?(\d+)/], 1, 20);
  result.bathrooms = firstInt(html, [/(\d+)\s*bathrooms?\b/i, /"(?:nr_bathrooms|numberOfBathrooms)"\s*:\s*"?(\d+)/], 1, 20);
  // Size: the page shows ft² or m² depending on locale — handle both.
  const sqft = firstFloat(html, [/(\d+(?:[.,]\d+)?)\s*(?:ft²|ft&#178;|ft&sup2;|sq\.?\s?ft|sqft)/i], 100, 50000);
  if (sqft != null) {
    result.sizeSqft = Math.round(sqft);
  } else {
    const sqm = firstFloat(html, [/(\d+(?:[.,]\d+)?)\s*(?:m²|m&#178;|m&sup2;|\bsqm\b)/i], 10, 5000);
    if (sqm != null) result.sizeSqft = Math.round(sqm * 10.7639);
  }

  // Quoted total: a figure explicitly tagged GBP in the embedded state, then
  // the visible price blocks, then the £ amount that recurs most across the
  // page. (No loose currency-adjacency matching — that latches onto exchange
  // rates.) Always user-checkable in the wizard.
  result.accommodationTotal =
    firstFloat(html, [
      /"grossPrice"\s*:\s*\{[^{}]*?"currency"\s*:\s*"GBP"[^{}]*?"value"\s*:\s*([\d.]+)/,
      /"grossPrice"\s*:\s*\{[^{}]*?"value"\s*:\s*([\d.]+)[^{}]*?"currency"\s*:\s*"GBP"/,
    ], 50, 100000) ??
    priceNearTaxesLine(html) ??
    priceFromDisplayBlock(html) ??
    priceFromStayBlock(html, result.nights) ??
    commonestPoundAmount(html);

  // Facilities → "What's included".
  const extras = extractFacilities(html);
  if (extras.length) result.extras = extras;

  // Rate note: read the selected room's own block — "Non-refundable" there
  // beats a generic "Free cancellation" mentioned elsewhere on the page. A
  // free-cancellation claim is only trusted when it carries a date.
  const stayIdx = html.search(/\d+\s*nights?,\s*\d+\s*adults?/i);
  const stayScope = stayIdx >= 0 ? html.slice(Math.max(0, stayIdx - 2000), stayIdx + 800) : "";
  if (/non-?refundable/i.test(stayScope)) {
    result.rateNote = "Non-refundable";
  } else {
    const cancel = (stayScope || html).match(/Free cancellation\s+(?:before|until)\s+[^<>"&{}]{3,40}\d[^<>"&{}]{0,20}/i)
      ?? html.match(/Free cancellation\s+(?:before|until)\s+\d[^<>"&{}]{2,40}/i);
    if (cancel) result.rateNote = decodeEntities(cancel[0]).replace(/\s+/g, " ").trim();
  }

  // Country fallback from the canonical URL (e.g. /hotel/tr/villa-x.html)
  if (!result.country) {
    const cc = finalUrl.match(/\/hotel\/([a-z]{2})\//);
    if (cc) result.country = COUNTRY_NAMES[cc[1]] ?? cc[1].toUpperCase();
  }

  if (!result.name && result.photos.length === 0 && !result.coords) {
    throw new Error(
      "Couldn't find listing details in that page source — make sure you copied the full source (right-click the listing → View page source → select all → copy).",
    );
  }
  return result;
}

/** First pattern that yields an integer inside [min, max] wins. */
function firstInt(html: string, patterns: RegExp[], min: number, max: number): number | undefined {
  const v = firstFloat(html, patterns, min, max);
  return v != null ? Math.round(v) : undefined;
}

function firstFloat(html: string, patterns: RegExp[], min: number, max: number): number | undefined {
  for (const re of patterns) {
    const m = html.match(re);
    if (!m) continue;
    const n = parseFloat(m[1].replace(",", "."));
    if (isFinite(n) && n >= min && n <= max) return n;
  }
  return undefined;
}

/** Drop struck-through "was" prices (<s>/<del> elements and Booking's
 *  strikethrough/original price classes) so they can't be read as the total. */
function stripStruckPrices(fragment: string): string {
  return fragment
    .replace(/<(s|del|strike)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<[^>]*(?:strikethrough|line[-_]?through|__original|rack[-_]?rate)[^>]*>[\s\S]{0,60}?<\/[^>]+>/gi, " ");
}

function poundAmounts(fragment: string): number[] {
  return Array.from(
    stripStruckPrices(fragment).matchAll(/(?:£|&#163;|&pound;)\s?([\d,]+(?:\.\d{1,2})?)/g),
    (m) => parseFloat(m[1].replace(/,/g, "")),
  ).filter((n) => isFinite(n) && n >= 50 && n <= 100000);
}

/** The visible price element shows the original and the discounted figure —
 *  the lower non-struck one inside that block is what you'd actually pay. */
function priceFromDisplayBlock(html: string): number | undefined {
  const block = html.match(/data-testid="price-and-discounted-price"[\s\S]{0,600}/);
  if (!block) return undefined;
  const amounts = poundAmounts(block[0]);
  return amounts.length ? Math.min(...amounts) : undefined;
}

/** Facility names: embedded-state patterns first, then the visible
 *  "Most popular facilities" section's text nodes. Deduped, human labels only. */
function extractFacilities(html: string): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  const add = (raw: string): boolean => {
    const name = decodeEntities(raw).replace(/\\u[\da-f]{4}/gi, "").replace(/\s+/g, " ").trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) return false;
    // Human label: starts with a letter, no JSON/markup junk, not a UI string.
    if (!/^[a-z][a-z0-9\s/&'’()+-]*$/i.test(name)) return false;
    if (/facilit|availab|reserve|see all|show |popular|read more|guests? say|price|night|per stay|book|about|review|house rules|fine print|polic/i.test(name))
      return false;
    seen.add(key);
    names.push(name);
    return names.length >= 16;
  };

  // Visible pill/facility sources MERGE (the highlight pills under the
  // gallery and the "Most popular facilities" list overlap but differ):
  // 1. important_facility elements' data-name-en (classic page) — scoped to
  //    those tags since data-name-en also sits on review bars/tooltips.
  for (const m of Array.from(html.matchAll(/<[^>]*important_facilit[^>]*>/gi))) {
    const attr = m[0].match(/data-name-en="([^"]{3,40})"/);
    if (attr && add(attr[1])) return names;
  }
  // 2. The property-highlights pill list. Each pill carries a multi-KB inline
  //    SVG icon, so the window must be wide and the SVGs stripped before the
  //    label text-nodes are read; the list's own </ul> bounds it.
  collectPillLabels(html, /(?:data-testid="property-highlights"|property[-_]highlights)([\s\S]{0,30000})/i, add);
  // 3. The "Most popular facilities" list, same treatment.
  collectPillLabels(html, /Most popular facilities([\s\S]{0,30000})/i, add);
  if (names.length) return names;

  // Embedded-state shapes (the React page) as the last resort.
  const statePatterns = [
    /"__typename"\s*:\s*"(?:Facility|FacilityBlockFacility|BaseFacility)"[^{}]*?"name"\s*:\s*"([^"]{3,40})"/g,
    /"name"\s*:\s*"([^"]{3,40})"\s*,\s*"__typename"\s*:\s*"(?:Facility|FacilityBlockFacility|BaseFacility)"/g,
    /"facility_name"\s*:\s*"([^"]{3,40})"/g,
  ];
  for (const re of statePatterns) {
    for (const m of Array.from(html.matchAll(re))) if (add(m[1])) return names;
  }
  return names;
}

/** Pull pill labels out of an icon list: window from the anchor, drop the
 *  inline SVG icons, stop at the list's end, then read the text nodes. */
function collectPillLabels(
  html: string,
  anchor: RegExp,
  add: (raw: string) => boolean,
): void {
  const m = html.match(anchor);
  if (!m) return;
  const noSvg = m[1].replace(/<svg[\s\S]*?<\/svg>/gi, " ");
  const sectionEnd = noSvg.search(/<\/(?:section|ul|table)>/i);
  const scope = sectionEnd > 0 ? noSvg.slice(0, sectionEnd) : noSvg;
  for (const t of Array.from(scope.matchAll(/>\s*([A-Za-z][A-Za-z0-9\s/&'’()+-]{2,39})\s*</g))) {
    if (add(t[1])) return;
  }
}

/** The most precise visual anchor: the payable total renders immediately
 *  before "Includes taxes and charges" — take the last £ amount before it. */
function priceNearTaxesLine(html: string): number | undefined {
  for (const m of Array.from(html.matchAll(/Includes taxes and charges/gi))) {
    const back = html.slice(Math.max(0, m.index! - 400), m.index);
    const amounts = poundAmounts(back);
    if (amounts.length) return amounts[amounts.length - 1];
  }
  return undefined;
}

/** The stay summary ("5 nights, 4 adults") with prices nearby. Blocks mix the
 *  total with per-night rates and strikethroughs, so when nights are known,
 *  prefer the amount that's ~nights× another (i.e. an actual stay total). */
function priceFromStayBlock(html: string, nights?: number): number | undefined {
  const idx = html.search(/\d+\s*nights?,\s*\d+\s*adults?/i);
  if (idx < 0) return undefined;
  const amounts = poundAmounts(html.slice(Math.max(0, idx - 400), idx + 2000));
  if (!amounts.length) return undefined;
  if (nights && nights > 1) {
    const totals = amounts.filter((b) =>
      amounts.some((a) => a !== b && Math.abs(a * nights - b) / b < 0.02),
    );
    // Several candidate totals → the discounted one is the lower.
    if (totals.length) return Math.min(...totals);
    // No per-night/total pair: treat lone small figures as per-night rates.
    const max = Math.max(...amounts);
    if (max < 1000 && nights >= 3) return undefined; // ambiguous — leave blank
  }
  return Math.max(...amounts);
}

/** Last-resort price: the £ amount that appears most often on the page. The
 *  stay's own total repeats (header, sidebar, booking box); needs ≥3 showings
 *  to avoid latching onto a one-off figure. */
function commonestPoundAmount(html: string): number | undefined {
  const counts = new Map<number, number>();
  for (const m of Array.from(html.matchAll(/(?:£|&#163;|&pound;)\s?([\d,]+(?:\.\d{1,2})?)/g))) {
    const n = parseFloat(m[1].replace(/,/g, ""));
    if (!isFinite(n) || n < 100 || n > 100000) continue;
    counts.set(n, (counts.get(n) ?? 0) + 1);
  }
  let best: number | undefined;
  let bestCount = 2; // require at least 3 occurrences
  for (const [amount, count] of Array.from(counts.entries())) {
    if (count > bestCount || (count === bestCount && best != null && amount < best)) {
      best = amount;
      bestCount = count;
    }
  }
  return best;
}

/** Split an address on commas and drop redundant segments — exact repeats and
 *  segments fully contained in another (Booking's JSON-LD fields overlap,
 *  which otherwise doubles the line: "07960" next to "07960 Kalkan", etc.). */
function dedupeSegments(text: string): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of text.split(",").map((x) => x.trim()).filter(Boolean)) {
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out.filter((s, i) =>
    !out.some((other, k) => k !== i && other.toLowerCase().includes(s.toLowerCase())),
  );
}

/** Pull a city-ish segment out of an address line. A "07960 Kalkan"-style
 *  postal-town segment wins (that's the town as posted); otherwise drop the
 *  country, strip codes and take the last remaining lettered segment. */
function extractCity(addressText: string): string | undefined {
  const segs = dedupeSegments(addressText);
  if (!segs.length) return undefined;
  const countries = new Set(Object.values(COUNTRY_NAMES).map((c) => c.toLowerCase()));
  let parts = segs;
  if (parts.length > 1 && countries.has(parts[parts.length - 1].toLowerCase())) {
    parts = parts.slice(0, -1);
  }
  // Postal-town pattern first, scanning from the end.
  for (let i = parts.length - 1; i >= 0; i--) {
    const m = parts[i].match(/^\d{4,7}\s+([^\d]+)$/);
    if (m && /[a-zA-Z]/.test(m[1])) return m[1].trim();
  }
  for (let i = parts.length - 1; i >= 0; i--) {
    const cleaned = parts[i].replace(/\b[\dA-Z-]*\d[\dA-Z-]*\b/g, "").replace(/\s{2,}/g, " ").trim();
    if (cleaned && /[a-zA-Z]/.test(cleaned)) return cleaned;
  }
  return undefined;
}

/** Upgrade a bstatic photo URL to a consistent large size. */
function normalisePhoto(url: string): string {
  return url.replace(/\/xdata\/images\/hotel\/[^/]+\//, "/xdata/images/hotel/max1024x768/");
}

/** The numeric image id used to dedupe size variants of the same photo. */
function photoId(url: string): string | null {
  const m = url.match(/\/(\d+)\.jpe?g/);
  return m ? m[1] : null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

/** Common holiday-country codes for the URL fallback; anything else shows the code. */
const COUNTRY_NAMES: Record<string, string> = {
  tr: "Turkey", gr: "Greece", es: "Spain", pt: "Portugal", it: "Italy", fr: "France",
  hr: "Croatia", cy: "Cyprus", mt: "Malta", us: "United States", gb: "United Kingdom",
  ie: "Ireland", nl: "Netherlands", de: "Germany", at: "Austria", ch: "Switzerland",
  th: "Thailand", ae: "United Arab Emirates", eg: "Egypt", ma: "Morocco", tn: "Tunisia",
  mx: "Mexico", id: "Indonesia", mv: "Maldives", bg: "Bulgaria", al: "Albania", me: "Montenegro",
};
