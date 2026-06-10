"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { CarHire, CostLine, Flight, Holiday, HolidayStatus } from "@/content/types";
import * as store from "@/lib/store";
import { isOwner } from "@/lib/member";
import { parseBookingHtml, parseBookingListing, type ParsedBooking } from "@/lib/booking";

// ---------------------------------------------------------------------------
// Server actions — every mutation in the app goes through here. Each action
// revalidates the whole tree (the data file feeds every page) and redirects
// to wherever the user would naturally land next.
//
// All plan mutations are owner-gated: family members browse, vote and leave
// notes (social-actions.ts), but only the owner key may change the plan.
// ---------------------------------------------------------------------------

/** Bounce non-owners home instead of mutating. UI hides edit chrome for
 *  them too; this is the hard stop behind it. */
function requireOwner() {
  if (!isOwner()) redirect("/");
}

function str(fd: FormData, name: string): string | undefined {
  const v = fd.get(name);
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : undefined;
}

function num(fd: FormData, name: string): number | undefined {
  const t = str(fd, name);
  if (t == null) return undefined;
  const n = Number(t.replace(/[£$,\s]/g, ""));
  return isFinite(n) ? n : undefined;
}

function bool(fd: FormData, name: string): boolean {
  return fd.get(name) != null;
}

/** Textarea → list: one entry per line, blanks dropped. */
function lines(fd: FormData, name: string): string[] | undefined {
  const t = str(fd, name);
  if (!t) return undefined;
  const list = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  return list.length ? list : undefined;
}

function refreshAll() {
  revalidatePath("/", "layout");
}

// ---- trips -----------------------------------------------------------------

export async function createTrip(formData: FormData) {
  requireOwner();
  const name = str(formData, "name");
  if (!name) return;
  const trip = await store.addTrip({
    name,
    subtitle: str(formData, "subtitle"),
    window: str(formData, "window"),
    travellers: num(formData, "travellers"),
  });
  refreshAll();
  redirect(`/${trip.slug}`);
}

export async function updateTrip(tripSlug: string, formData: FormData) {
  requireOwner();
  const name = str(formData, "name");
  if (!name) return;
  await store.updateTrip(tripSlug, {
    name,
    subtitle: str(formData, "subtitle"),
    window: str(formData, "window"),
    travellers: num(formData, "travellers"),
    image: str(formData, "image"),
    imageAlt: str(formData, "imageAlt"),
  });
  refreshAll();
  redirect(`/${tripSlug}`);
}

export async function deleteTrip(tripSlug: string) {
  requireOwner();
  await store.deleteTrip(tripSlug);
  refreshAll();
  redirect("/");
}

// ---- locations ---------------------------------------------------------------

export async function createLocation(tripSlug: string, formData: FormData) {
  requireOwner();
  const name = str(formData, "name");
  const country = str(formData, "country");
  if (!name || !country) return;
  const high = num(formData, "seasonHigh");
  const sea = num(formData, "seasonSea");
  const sun = num(formData, "seasonSun");

  // No photo chosen → fetch the best destination shot automatically (the
  // picker on the edit page can always override it).
  let image = str(formData, "image");
  let imageAlt = str(formData, "imageAlt");
  if (!image) {
    const { autoLocationImage } = await import("@/lib/images");
    const auto = await autoLocationImage(`${name} ${country}`);
    if (auto) {
      image = auto.url;
      imageAlt = imageAlt ?? auto.alt;
    }
  }

  const location = await store.addLocation(tripSlug, {
    name,
    country,
    blurb: str(formData, "blurb"),
    airport: str(formData, "airport"),
    flightSummary: str(formData, "flightSummary"),
    flightTime: str(formData, "flightTime"),
    season: high != null && sea != null && sun != null ? { high, sea, sun } : undefined,
    seasonNote: str(formData, "seasonNote"),
    image,
    imageAlt,
  });
  refreshAll();
  redirect(`/${tripSlug}/${location.slug}`);
}

export async function updateLocation(tripSlug: string, locationSlug: string, formData: FormData) {
  requireOwner();
  const name = str(formData, "name");
  const country = str(formData, "country");
  if (!name || !country) return;
  const high = num(formData, "seasonHigh");
  const sea = num(formData, "seasonSea");
  const sun = num(formData, "seasonSun");
  await store.updateLocation(tripSlug, locationSlug, {
    name,
    country,
    blurb: str(formData, "blurb"),
    airport: str(formData, "airport"),
    flightSummary: str(formData, "flightSummary"),
    flightTime: str(formData, "flightTime"),
    season: high != null && sea != null && sun != null ? { high, sea, sun } : undefined,
    seasonNote: str(formData, "seasonNote"),
    image: str(formData, "image"),
    imageAlt: str(formData, "imageAlt"),
  });
  refreshAll();
  redirect(`/${tripSlug}/${locationSlug}`);
}

export async function deleteLocation(tripSlug: string, locationSlug: string) {
  requireOwner();
  await store.deleteLocation(tripSlug, locationSlug);
  refreshAll();
  redirect(`/${tripSlug}`);
}

// ---- stays --------------------------------------------------------------------

/** Shared FormData → Holiday mapping for the manual create/edit form.
 *  Flights and extra costs arrive as JSON in hidden fields (the form manages
 *  them as dynamic rows client-side). */
function holidayFromForm(formData: FormData): Omit<Holiday, "slug"> {
  let flights: Flight[] | undefined;
  try {
    const raw = str(formData, "flightsJson");
    if (raw) flights = (JSON.parse(raw) as Flight[]).filter((f) => f.airport?.trim());
  } catch {
    /* leave undefined */
  }
  let extraCosts: CostLine[] | undefined;
  try {
    const raw = str(formData, "extraCostsJson");
    if (raw) extraCosts = (JSON.parse(raw) as CostLine[]).filter((c) => c.label?.trim());
  } catch {
    /* leave undefined */
  }

  const carProvider = str(formData, "carProvider");
  const carVehicle = str(formData, "carVehicle");
  const carDays = num(formData, "carDays");
  const carPrice = num(formData, "carPrice");
  const carNotes = str(formData, "carNotes");
  const carHire: CarHire | undefined =
    carProvider || carVehicle || carDays != null || carPrice != null || carNotes
      ? { provider: carProvider, vehicle: carVehicle, days: carDays, price: carPrice ?? null, notes: carNotes }
      : undefined;

  const transferDetail = str(formData, "transferDetail");
  const transferAmount = num(formData, "transferAmount");
  const transfers: CostLine | undefined =
    transferDetail || transferAmount != null
      ? { label: "Airport transfers", detail: transferDetail, amount: transferAmount ?? null }
      : undefined;

  const lat = num(formData, "lat");
  const lng = num(formData, "lng");
  const photos = lines(formData, "photos");
  const image = str(formData, "image") ?? photos?.[0];

  return {
    name: str(formData, "name") ?? "Unnamed stay",
    status: (str(formData, "status") as HolidayStatus | undefined) ?? "idea",
    summary: str(formData, "summary"),
    listingUrl: str(formData, "listingUrl"),
    image,
    imageAlt: str(formData, "imageAlt"),
    photos: photos?.filter((p) => p !== image),
    rating: str(formData, "rating"),
    address: str(formData, "address"),
    coords: lat != null && lng != null ? { lat, lng } : undefined,
    accommodation: {
      bedrooms: num(formData, "bedrooms"),
      sleeps: num(formData, "sleeps"),
      bathrooms: num(formData, "bathrooms"),
      privatePool: bool(formData, "privatePool"),
      airCon: bool(formData, "airCon"),
      walkToAmenities: str(formData, "walkToAmenities"),
      modern: bool(formData, "modern"),
      sizeSqft: num(formData, "sizeSqft"),
      extras: lines(formData, "extras"),
    },
    nights: num(formData, "nights"),
    dates: str(formData, "dates"),
    checkIn: str(formData, "checkIn"),
    checkOut: str(formData, "checkOut"),
    accommodationTotal: num(formData, "accommodationTotal") ?? null,
    rateNote: str(formData, "rateNote"),
    flights,
    carHire,
    transfers,
    extraCosts,
    pros: lines(formData, "pros"),
    cons: lines(formData, "cons"),
    notes: str(formData, "notes"),
  };
}

export async function createStay(tripSlug: string, locationSlug: string, formData: FormData) {
  requireOwner();
  const holiday = await store.addHoliday(tripSlug, locationSlug, holidayFromForm(formData));
  refreshAll();
  redirect(`/${tripSlug}/${locationSlug}/${holiday.slug}`);
}

export async function updateStay(
  tripSlug: string,
  locationSlug: string,
  holidaySlug: string,
  formData: FormData,
) {
  requireOwner();
  await store.updateHoliday(tripSlug, locationSlug, holidaySlug, holidayFromForm(formData));
  refreshAll();
  redirect(`/${tripSlug}/${locationSlug}/${holidaySlug}`);
}

export async function deleteStay(tripSlug: string, locationSlug: string, holidaySlug: string) {
  requireOwner();
  await store.deleteHoliday(tripSlug, locationSlug, holidaySlug);
  refreshAll();
  redirect(`/${tripSlug}/${locationSlug}`);
}

export async function setStayStatus(
  tripSlug: string,
  locationSlug: string,
  holidaySlug: string,
  status: HolidayStatus,
) {
  requireOwner();
  await store.updateHoliday(tripSlug, locationSlug, holidaySlug, { status });
  refreshAll();
}

// ---- image search ---------------------------------------------------------------

export async function searchImages(query: string) {
  const { searchLocationImages } = await import("@/lib/images");
  try {
    return { ok: true as const, images: await searchLocationImages(query) };
  } catch (e) {
    return {
      ok: false as const,
      images: [],
      error: e instanceof Error ? e.message : "Image search failed.",
    };
  }
}

// ---- Booking.com import ----------------------------------------------------------

export interface ImportParseResult {
  ok: boolean;
  error?: string;
  parsed?: ParsedBooking;
  /** Existing trips/locations so the wizard can offer them as targets. */
  trips?: { slug: string; name: string; locations: { slug: string; name: string; country: string }[] }[];
}

async function tripOptions() {
  return (await store.readTrips()).map((t) => ({
    slug: t.slug,
    name: t.name,
    locations: t.locations.map((l) => ({ slug: l.slug, name: l.name, country: l.country })),
  }));
}

export async function parseBookingLink(url: string): Promise<ImportParseResult> {
  try {
    const parsed = await parseBookingListing(url);
    return { ok: true, parsed, trips: await tripOptions() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Couldn't read that listing." };
  }
}

/** Fallback when Booking.com blocks the server fetch: the user pastes the
 *  listing's page source and we parse the same fields out of it. */
export async function parsePastedListing(html: string, url: string): Promise<ImportParseResult> {
  try {
    const parsed = parseBookingHtml(html, url);
    return { ok: true, parsed, trips: await tripOptions() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Couldn't read that page source." };
  }
}

/** Final step of the import wizard: create trip/location as needed, then the stay. */
export async function importStay(formData: FormData) {
  requireOwner();
  // Target trip — an existing slug, or a new trip created inline.
  let tripSlug = str(formData, "tripSlug");
  if (!tripSlug || tripSlug === "__new__") {
    const name = str(formData, "newTripName");
    if (!name) return;
    const trip = await store.addTrip({
      name,
      window: str(formData, "newTripWindow"),
      travellers: num(formData, "newTripTravellers"),
    });
    tripSlug = trip.slug;
  }

  // Target location — existing in that trip, or created from the parsed city,
  // with a destination hero fetched automatically (the stay's own photos are
  // accommodation shots, not the place).
  let locationSlug = str(formData, "locationSlug");
  if (!locationSlug || locationSlug === "__new__") {
    const name = str(formData, "newLocationName");
    const country = str(formData, "newLocationCountry");
    if (!name || !country) return;
    const { autoLocationImage } = await import("@/lib/images");
    const auto = await autoLocationImage(`${name} ${country}`);
    const location = await store.addLocation(tripSlug, {
      name,
      country,
      image: auto?.url,
      imageAlt: auto?.alt,
    });
    locationSlug = location.slug;
  }

  const holiday = await store.addHoliday(tripSlug, locationSlug, holidayFromForm(formData));
  refreshAll();
  redirect(`/${tripSlug}/${locationSlug}/${holiday.slug}`);
}
