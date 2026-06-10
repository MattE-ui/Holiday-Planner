import { promises as fs } from "fs";
import path from "path";
import type { Holiday, Location, Trip } from "@/content/types";

// ---------------------------------------------------------------------------
// JSON file store. The whole content tree lives in data/trips.json so the app
// starts as a fresh canvas and everything created in the UI survives restarts.
// Server-only: import this from server components and server actions.
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "trips.json");

export async function readTrips(): Promise<Trip[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as Trip[];
  } catch {
    return []; // no file yet — a fresh canvas
  }
}

async function writeTrips(trips: Trip[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(trips, null, 2), "utf8");
}

// ---- lookups ---------------------------------------------------------------

export async function getTrip(tripSlug: string): Promise<Trip | undefined> {
  return (await readTrips()).find((t) => t.slug === tripSlug);
}

export async function getLocation(tripSlug: string, locationSlug: string) {
  const trip = await getTrip(tripSlug);
  const location = trip?.locations.find((l) => l.slug === locationSlug);
  return { trip, location };
}

export async function getHoliday(tripSlug: string, locationSlug: string, holidaySlug: string) {
  const { trip, location } = await getLocation(tripSlug, locationSlug);
  const holiday = location?.holidays.find((h) => h.slug === holidaySlug);
  return { trip, location, holiday };
}

// ---- slugs ------------------------------------------------------------------

/** Route segments that must never be shadowed by a generated slug. */
const RESERVED = new Set(["new", "import", "trips", "add", "edit", "api"]);

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "untitled";
}

export function uniqueSlug(name: string, taken: Iterable<string>): string {
  const existing = new Set(taken);
  let slug = slugify(name);
  if (RESERVED.has(slug)) slug = `${slug}-1`;
  let candidate = slug;
  for (let n = 2; existing.has(candidate); n++) candidate = `${slug}-${n}`;
  return candidate;
}

// ---- mutations ---------------------------------------------------------------

export async function addTrip(trip: Omit<Trip, "slug" | "locations">): Promise<Trip> {
  const trips = await readTrips();
  const slug = uniqueSlug(trip.name, trips.map((t) => t.slug));
  const created: Trip = { ...trip, slug, locations: [] };
  await writeTrips([...trips, created]);
  return created;
}

export async function updateTrip(
  tripSlug: string,
  patch: Partial<Omit<Trip, "slug" | "locations">>,
): Promise<void> {
  const trips = await readTrips();
  const trip = trips.find((t) => t.slug === tripSlug);
  if (!trip) throw new Error(`Trip not found: ${tripSlug}`);
  Object.assign(trip, patch);
  await writeTrips(trips);
}

export async function deleteTrip(tripSlug: string): Promise<void> {
  const trips = await readTrips();
  await writeTrips(trips.filter((t) => t.slug !== tripSlug));
}

export async function addLocation(
  tripSlug: string,
  location: Omit<Location, "slug" | "holidays">,
): Promise<Location> {
  const trips = await readTrips();
  const trip = trips.find((t) => t.slug === tripSlug);
  if (!trip) throw new Error(`Trip not found: ${tripSlug}`);
  const slug = uniqueSlug(location.name, trip.locations.map((l) => l.slug));
  const created: Location = { ...location, slug, holidays: [] };
  trip.locations.push(created);
  await writeTrips(trips);
  return created;
}

export async function updateLocation(
  tripSlug: string,
  locationSlug: string,
  patch: Partial<Omit<Location, "slug" | "holidays">>,
): Promise<void> {
  const trips = await readTrips();
  const location = trips
    .find((t) => t.slug === tripSlug)
    ?.locations.find((l) => l.slug === locationSlug);
  if (!location) throw new Error(`Location not found: ${tripSlug}/${locationSlug}`);
  Object.assign(location, patch);
  await writeTrips(trips);
}

export async function deleteLocation(tripSlug: string, locationSlug: string): Promise<void> {
  const trips = await readTrips();
  const trip = trips.find((t) => t.slug === tripSlug);
  if (!trip) return;
  trip.locations = trip.locations.filter((l) => l.slug !== locationSlug);
  await writeTrips(trips);
}

export async function addHoliday(
  tripSlug: string,
  locationSlug: string,
  holiday: Omit<Holiday, "slug">,
): Promise<Holiday> {
  const trips = await readTrips();
  const location = trips
    .find((t) => t.slug === tripSlug)
    ?.locations.find((l) => l.slug === locationSlug);
  if (!location) throw new Error(`Location not found: ${tripSlug}/${locationSlug}`);
  const slug = uniqueSlug(holiday.name, location.holidays.map((h) => h.slug));
  const created: Holiday = { ...holiday, slug };
  location.holidays.push(created);
  await writeTrips(trips);
  return created;
}

export async function updateHoliday(
  tripSlug: string,
  locationSlug: string,
  holidaySlug: string,
  patch: Partial<Omit<Holiday, "slug">>,
): Promise<void> {
  const trips = await readTrips();
  const holiday = trips
    .find((t) => t.slug === tripSlug)
    ?.locations.find((l) => l.slug === locationSlug)
    ?.holidays.find((h) => h.slug === holidaySlug);
  if (!holiday) throw new Error(`Stay not found: ${tripSlug}/${locationSlug}/${holidaySlug}`);
  Object.assign(holiday, patch);
  await writeTrips(trips);
}

export async function deleteHoliday(
  tripSlug: string,
  locationSlug: string,
  holidaySlug: string,
): Promise<void> {
  const trips = await readTrips();
  const location = trips
    .find((t) => t.slug === tripSlug)
    ?.locations.find((l) => l.slug === locationSlug);
  if (!location) return;
  location.holidays = location.holidays.filter((h) => h.slug !== holidaySlug);
  await writeTrips(trips);
}
