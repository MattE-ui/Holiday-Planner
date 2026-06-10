import { neon } from "@neondatabase/serverless";
import type { Holiday, Location, Trip } from "@/content/types";
import { uniqueSlug } from "@/lib/slugs";
import { readTrips as readBundledTrips } from "@/lib/store-file";

// ---------------------------------------------------------------------------
// Postgres (Neon) backend, used whenever DATABASE_URL / POSTGRES_URL is set —
// i.e. in production, where the serverless filesystem is read-only.
//
// Shape: a relational skeleton (slugs, ordering, cascade deletes) with each
// entity's fields in a jsonb column, so the content model can evolve without
// schema migrations. Mutations are row-level; reads assemble the same nested
// Trip[] tree the rest of the app consumes.
//
// First run bootstraps the schema and seeds it from the committed
// data/trips.json bundle, so a fresh database starts with the family's data
// rather than an empty canvas.
// ---------------------------------------------------------------------------

type Row = Record<string, any>;

let cached: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!cached) {
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!url) throw new Error("store-pg used without DATABASE_URL / POSTGRES_URL");
    cached = neon(url);
  }
  return cached;
}

// Lazy tagged-template wrapper: this module is statically imported by
// store.ts even when the file backend is active, so the client must not be
// constructed (or the env var required) until a query actually runs.
function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]> {
  return getSql()(strings, ...values) as Promise<Row[]>;
}

let ready: Promise<void> | null = null;

/** Create tables and seed from the bundled JSON exactly once per instance. */
function init(): Promise<void> {
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS trips (
      slug     text PRIMARY KEY,
      position int  NOT NULL,
      data     jsonb NOT NULL
    )`;
    await sql`CREATE TABLE IF NOT EXISTS locations (
      trip_slug text NOT NULL REFERENCES trips(slug) ON DELETE CASCADE,
      slug      text NOT NULL,
      position  int  NOT NULL,
      data      jsonb NOT NULL,
      PRIMARY KEY (trip_slug, slug)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS holidays (
      trip_slug     text NOT NULL,
      location_slug text NOT NULL,
      slug          text NOT NULL,
      position      int  NOT NULL,
      data          jsonb NOT NULL,
      PRIMARY KEY (trip_slug, location_slug, slug),
      FOREIGN KEY (trip_slug, location_slug)
        REFERENCES locations(trip_slug, slug) ON DELETE CASCADE
    )`;

    const [{ count }] = await sql`SELECT count(*)::int AS count FROM trips`;
    if (count === 0) {
      const seed = await readBundledTrips();
      for (let ti = 0; ti < seed.length; ti++) {
        const { locations, slug: tripSlug, ...tripData } = seed[ti];
        await sql`INSERT INTO trips (slug, position, data)
                  VALUES (${tripSlug}, ${ti + 1}, ${JSON.stringify(tripData)}::jsonb)
                  ON CONFLICT (slug) DO NOTHING`;
        for (let li = 0; li < locations.length; li++) {
          const { holidays, slug: locSlug, ...locData } = locations[li];
          await sql`INSERT INTO locations (trip_slug, slug, position, data)
                    VALUES (${tripSlug}, ${locSlug}, ${li + 1}, ${JSON.stringify(locData)}::jsonb)
                    ON CONFLICT (trip_slug, slug) DO NOTHING`;
          for (let hi = 0; hi < holidays.length; hi++) {
            const { slug: holSlug, ...holData } = holidays[hi];
            await sql`INSERT INTO holidays (trip_slug, location_slug, slug, position, data)
                      VALUES (${tripSlug}, ${locSlug}, ${holSlug}, ${hi + 1}, ${JSON.stringify(holData)}::jsonb)
                      ON CONFLICT (trip_slug, location_slug, slug) DO NOTHING`;
          }
        }
      }
    }
  })().catch((err) => {
    ready = null; // let the next request retry instead of caching the failure
    throw err;
  });
  return ready;
}

// ---- reads -------------------------------------------------------------------

export async function readTrips(): Promise<Trip[]> {
  await init();
  const [tripRows, locRows, holRows] = await Promise.all([
    sql`SELECT slug, data FROM trips ORDER BY position`,
    sql`SELECT trip_slug, slug, data FROM locations ORDER BY position`,
    sql`SELECT trip_slug, location_slug, slug, data FROM holidays ORDER BY position`,
  ]);

  const trips: Trip[] = tripRows.map((r) => ({ ...r.data, slug: r.slug, locations: [] }));
  const tripBySlug = new Map(trips.map((t) => [t.slug, t]));

  const locByKey = new Map<string, Location>();
  for (const r of locRows) {
    const loc: Location = { ...r.data, slug: r.slug, holidays: [] };
    tripBySlug.get(r.trip_slug)?.locations.push(loc);
    locByKey.set(`${r.trip_slug}/${r.slug}`, loc);
  }
  for (const r of holRows) {
    const hol: Holiday = { ...r.data, slug: r.slug };
    locByKey.get(`${r.trip_slug}/${r.location_slug}`)?.holidays.push(hol);
  }
  return trips;
}

// ---- mutations ---------------------------------------------------------------

export async function addTrip(trip: Omit<Trip, "slug" | "locations">): Promise<Trip> {
  await init();
  const taken = (await sql`SELECT slug FROM trips`).map((r) => r.slug as string);
  const slug = uniqueSlug(trip.name, taken);
  await sql`INSERT INTO trips (slug, position, data)
            VALUES (${slug},
                    (SELECT COALESCE(MAX(position), 0) + 1 FROM trips),
                    ${JSON.stringify(trip)}::jsonb)`;
  return { ...trip, slug, locations: [] };
}

export async function updateTrip(
  tripSlug: string,
  patch: Partial<Omit<Trip, "slug" | "locations">>,
): Promise<void> {
  await init();
  // Read-modify-write keeps Object.assign semantics: keys patched to
  // undefined drop out on serialisation, exactly like the file backend.
  const rows = await sql`SELECT data FROM trips WHERE slug = ${tripSlug}`;
  if (!rows.length) throw new Error(`Trip not found: ${tripSlug}`);
  const data = Object.assign(rows[0].data, patch);
  await sql`UPDATE trips SET data = ${JSON.stringify(data)}::jsonb WHERE slug = ${tripSlug}`;
}

export async function deleteTrip(tripSlug: string): Promise<void> {
  await init();
  await sql`DELETE FROM trips WHERE slug = ${tripSlug}`; // cascades
}

export async function addLocation(
  tripSlug: string,
  location: Omit<Location, "slug" | "holidays">,
): Promise<Location> {
  await init();
  const trip = await sql`SELECT slug FROM trips WHERE slug = ${tripSlug}`;
  if (!trip.length) throw new Error(`Trip not found: ${tripSlug}`);
  const taken = (await sql`SELECT slug FROM locations WHERE trip_slug = ${tripSlug}`).map(
    (r) => r.slug as string,
  );
  const slug = uniqueSlug(location.name, taken);
  await sql`INSERT INTO locations (trip_slug, slug, position, data)
            VALUES (${tripSlug}, ${slug},
                    (SELECT COALESCE(MAX(position), 0) + 1 FROM locations WHERE trip_slug = ${tripSlug}),
                    ${JSON.stringify(location)}::jsonb)`;
  return { ...location, slug, holidays: [] };
}

export async function updateLocation(
  tripSlug: string,
  locationSlug: string,
  patch: Partial<Omit<Location, "slug" | "holidays">>,
): Promise<void> {
  await init();
  const rows = await sql`SELECT data FROM locations
                         WHERE trip_slug = ${tripSlug} AND slug = ${locationSlug}`;
  if (!rows.length) throw new Error(`Location not found: ${tripSlug}/${locationSlug}`);
  const data = Object.assign(rows[0].data, patch);
  await sql`UPDATE locations SET data = ${JSON.stringify(data)}::jsonb
            WHERE trip_slug = ${tripSlug} AND slug = ${locationSlug}`;
}

export async function deleteLocation(tripSlug: string, locationSlug: string): Promise<void> {
  await init();
  await sql`DELETE FROM locations WHERE trip_slug = ${tripSlug} AND slug = ${locationSlug}`;
}

export async function addHoliday(
  tripSlug: string,
  locationSlug: string,
  holiday: Omit<Holiday, "slug">,
): Promise<Holiday> {
  await init();
  const loc = await sql`SELECT slug FROM locations
                        WHERE trip_slug = ${tripSlug} AND slug = ${locationSlug}`;
  if (!loc.length) throw new Error(`Location not found: ${tripSlug}/${locationSlug}`);
  const taken = (
    await sql`SELECT slug FROM holidays WHERE trip_slug = ${tripSlug} AND location_slug = ${locationSlug}`
  ).map((r) => r.slug as string);
  const slug = uniqueSlug(holiday.name, taken);
  await sql`INSERT INTO holidays (trip_slug, location_slug, slug, position, data)
            VALUES (${tripSlug}, ${locationSlug}, ${slug},
                    (SELECT COALESCE(MAX(position), 0) + 1 FROM holidays
                     WHERE trip_slug = ${tripSlug} AND location_slug = ${locationSlug}),
                    ${JSON.stringify(holiday)}::jsonb)`;
  return { ...holiday, slug };
}

export async function updateHoliday(
  tripSlug: string,
  locationSlug: string,
  holidaySlug: string,
  patch: Partial<Omit<Holiday, "slug">>,
): Promise<void> {
  await init();
  const rows = await sql`SELECT data FROM holidays
                         WHERE trip_slug = ${tripSlug} AND location_slug = ${locationSlug} AND slug = ${holidaySlug}`;
  if (!rows.length)
    throw new Error(`Stay not found: ${tripSlug}/${locationSlug}/${holidaySlug}`);
  const data = Object.assign(rows[0].data, patch);
  await sql`UPDATE holidays SET data = ${JSON.stringify(data)}::jsonb
            WHERE trip_slug = ${tripSlug} AND location_slug = ${locationSlug} AND slug = ${holidaySlug}`;
}

export async function deleteHoliday(
  tripSlug: string,
  locationSlug: string,
  holidaySlug: string,
): Promise<void> {
  await init();
  await sql`DELETE FROM holidays
            WHERE trip_slug = ${tripSlug} AND location_slug = ${locationSlug} AND slug = ${holidaySlug}`;
}
