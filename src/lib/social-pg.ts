import { neon } from "@neondatabase/serverless";
import { randomUUID } from "crypto";
import type { LocationVote, Note, StayVote, TripSocial } from "@/lib/social";

// ---------------------------------------------------------------------------
// Postgres (Neon) backend for votes and notes. Used whenever DATABASE_URL /
// POSTGRES_URL is set. Votes are natural-key upserts (one favourite stay per
// member per location; one favourite location per member per trip); notes are
// append-only rows with explicit deletes. No FKs to the trips tables — slugs
// are stable, and stale rows for deleted entities are simply never rendered.
// ---------------------------------------------------------------------------

type Row = Record<string, any>;

let cached: ReturnType<typeof neon> | null = null;
function getSql() {
  if (!cached) {
    const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
    if (!url) throw new Error("social-pg used without DATABASE_URL / POSTGRES_URL");
    cached = neon(url);
  }
  return cached;
}

// Lazy wrapper — statically imported even when the file backend is active.
function sql(strings: TemplateStringsArray, ...values: unknown[]): Promise<Row[]> {
  return getSql()(strings, ...values) as Promise<Row[]>;
}

let ready: Promise<void> | null = null;
function init(): Promise<void> {
  ready ??= (async () => {
    await sql`CREATE TABLE IF NOT EXISTS stay_votes (
      trip_slug     text NOT NULL,
      location_slug text NOT NULL,
      voter         text NOT NULL,
      holiday_slug  text NOT NULL,
      PRIMARY KEY (trip_slug, location_slug, voter)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS location_votes (
      trip_slug     text NOT NULL,
      voter         text NOT NULL,
      location_slug text NOT NULL,
      PRIMARY KEY (trip_slug, voter)
    )`;
    await sql`CREATE TABLE IF NOT EXISTS notes (
      id            text PRIMARY KEY,
      trip_slug     text NOT NULL,
      location_slug text,
      holiday_slug  text,
      author        text NOT NULL,
      body          text NOT NULL,
      created_at    timestamptz NOT NULL DEFAULT now()
    )`;
  })().catch((err) => {
    ready = null; // retry on the next request rather than caching the failure
    throw err;
  });
  return ready;
}

export async function getTripSocial(tripSlug: string): Promise<TripSocial> {
  await init();
  const [stayRows, locRows, noteRows] = await Promise.all([
    sql`SELECT location_slug, voter, holiday_slug FROM stay_votes WHERE trip_slug = ${tripSlug}`,
    sql`SELECT voter, location_slug FROM location_votes WHERE trip_slug = ${tripSlug}`,
    sql`SELECT id, location_slug, holiday_slug, author, body, created_at
        FROM notes WHERE trip_slug = ${tripSlug} ORDER BY created_at`,
  ]);
  const stayVotes: StayVote[] = stayRows.map((r) => ({
    tripSlug,
    locationSlug: r.location_slug,
    voter: r.voter,
    holidaySlug: r.holiday_slug,
  }));
  const locationVotes: LocationVote[] = locRows.map((r) => ({
    tripSlug,
    voter: r.voter,
    locationSlug: r.location_slug,
  }));
  const notes: Note[] = noteRows.map((r) => ({
    id: r.id,
    tripSlug,
    locationSlug: r.location_slug ?? undefined,
    holidaySlug: r.holiday_slug ?? undefined,
    author: r.author,
    body: r.body,
    createdAt: new Date(r.created_at).toISOString(),
  }));
  return { stayVotes, locationVotes, notes };
}

export async function setStayVote(
  tripSlug: string,
  locationSlug: string,
  voter: string,
  holidaySlug: string | null,
): Promise<void> {
  await init();
  if (holidaySlug) {
    await sql`INSERT INTO stay_votes (trip_slug, location_slug, voter, holiday_slug)
              VALUES (${tripSlug}, ${locationSlug}, ${voter}, ${holidaySlug})
              ON CONFLICT (trip_slug, location_slug, voter)
              DO UPDATE SET holiday_slug = EXCLUDED.holiday_slug`;
  } else {
    await sql`DELETE FROM stay_votes
              WHERE trip_slug = ${tripSlug} AND location_slug = ${locationSlug} AND voter = ${voter}`;
  }
}

export async function setLocationVote(
  tripSlug: string,
  voter: string,
  locationSlug: string | null,
): Promise<void> {
  await init();
  if (locationSlug) {
    await sql`INSERT INTO location_votes (trip_slug, voter, location_slug)
              VALUES (${tripSlug}, ${voter}, ${locationSlug})
              ON CONFLICT (trip_slug, voter)
              DO UPDATE SET location_slug = EXCLUDED.location_slug`;
  } else {
    await sql`DELETE FROM location_votes WHERE trip_slug = ${tripSlug} AND voter = ${voter}`;
  }
}

export async function addNote(note: Omit<Note, "id" | "createdAt">): Promise<Note> {
  await init();
  const id = randomUUID();
  const rows = await sql`INSERT INTO notes (id, trip_slug, location_slug, holiday_slug, author, body)
            VALUES (${id}, ${note.tripSlug}, ${note.locationSlug ?? null},
                    ${note.holidaySlug ?? null}, ${note.author}, ${note.body})
            RETURNING created_at`;
  return { ...note, id, createdAt: new Date(rows[0].created_at).toISOString() };
}

export async function getNote(id: string): Promise<Note | undefined> {
  await init();
  const rows = await sql`SELECT id, trip_slug, location_slug, holiday_slug, author, body, created_at
                         FROM notes WHERE id = ${id}`;
  if (!rows.length) return undefined;
  const r = rows[0];
  return {
    id: r.id,
    tripSlug: r.trip_slug,
    locationSlug: r.location_slug ?? undefined,
    holidaySlug: r.holiday_slug ?? undefined,
    author: r.author,
    body: r.body,
    createdAt: new Date(r.created_at).toISOString(),
  };
}

export async function deleteNote(id: string): Promise<void> {
  await init();
  await sql`DELETE FROM notes WHERE id = ${id}`;
}
