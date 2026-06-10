import type { Holiday, Location, Trip } from "@/content/types";
import * as fileStore from "@/lib/store-file";
import * as pgStore from "@/lib/store-pg";

// ---------------------------------------------------------------------------
// Trip store — the single API the app talks to. Server-only: import this from
// server components and server actions.
//
// Backend is chosen by environment: with DATABASE_URL / POSTGRES_URL set the
// Postgres (Neon) backend is used — required in production, where the
// serverless filesystem is read-only — otherwise the JSON file backend keeps
// local development zero-setup (data/trips.json). Both implement the same
// function set, and a fresh database seeds itself from the committed JSON.
// ---------------------------------------------------------------------------

const usePostgres = Boolean(process.env.DATABASE_URL ?? process.env.POSTGRES_URL);
const backend = usePostgres ? pgStore : fileStore;

export { slugify, uniqueSlug } from "@/lib/slugs";

export const readTrips = (): Promise<Trip[]> => backend.readTrips();

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

// ---- mutations ---------------------------------------------------------------

export const addTrip = (trip: Omit<Trip, "slug" | "locations">): Promise<Trip> =>
  backend.addTrip(trip);

export const updateTrip = (
  tripSlug: string,
  patch: Partial<Omit<Trip, "slug" | "locations">>,
): Promise<void> => backend.updateTrip(tripSlug, patch);

export const deleteTrip = (tripSlug: string): Promise<void> => backend.deleteTrip(tripSlug);

export const addLocation = (
  tripSlug: string,
  location: Omit<Location, "slug" | "holidays">,
): Promise<Location> => backend.addLocation(tripSlug, location);

export const updateLocation = (
  tripSlug: string,
  locationSlug: string,
  patch: Partial<Omit<Location, "slug" | "holidays">>,
): Promise<void> => backend.updateLocation(tripSlug, locationSlug, patch);

export const deleteLocation = (tripSlug: string, locationSlug: string): Promise<void> =>
  backend.deleteLocation(tripSlug, locationSlug);

export const addHoliday = (
  tripSlug: string,
  locationSlug: string,
  holiday: Omit<Holiday, "slug">,
): Promise<Holiday> => backend.addHoliday(tripSlug, locationSlug, holiday);

export const updateHoliday = (
  tripSlug: string,
  locationSlug: string,
  holidaySlug: string,
  patch: Partial<Omit<Holiday, "slug">>,
): Promise<void> => backend.updateHoliday(tripSlug, locationSlug, holidaySlug, patch);

export const deleteHoliday = (
  tripSlug: string,
  locationSlug: string,
  holidaySlug: string,
): Promise<void> => backend.deleteHoliday(tripSlug, locationSlug, holidaySlug);
