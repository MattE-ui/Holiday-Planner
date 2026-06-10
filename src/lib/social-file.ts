import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { LocationVote, Note, StayVote, TripSocial } from "@/lib/social";

// ---------------------------------------------------------------------------
// JSON file backend for votes and notes (data/social.json). Local development
// only — production uses the Postgres backend (social-pg.ts).
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "social.json");

interface SocialFile {
  stayVotes: StayVote[];
  locationVotes: LocationVote[];
  notes: Note[];
}

async function read(): Promise<SocialFile> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw) as SocialFile;
  } catch {
    return { stayVotes: [], locationVotes: [], notes: [] };
  }
}

async function write(data: SocialFile): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
}

export async function getTripSocial(tripSlug: string): Promise<TripSocial> {
  const data = await read();
  return {
    stayVotes: data.stayVotes.filter((v) => v.tripSlug === tripSlug),
    locationVotes: data.locationVotes.filter((v) => v.tripSlug === tripSlug),
    notes: data.notes.filter((n) => n.tripSlug === tripSlug),
  };
}

export async function setStayVote(
  tripSlug: string,
  locationSlug: string,
  voter: string,
  holidaySlug: string | null,
): Promise<void> {
  const data = await read();
  data.stayVotes = data.stayVotes.filter(
    (v) => !(v.tripSlug === tripSlug && v.locationSlug === locationSlug && v.voter === voter),
  );
  if (holidaySlug) data.stayVotes.push({ tripSlug, locationSlug, voter, holidaySlug });
  await write(data);
}

export async function setLocationVote(
  tripSlug: string,
  voter: string,
  locationSlug: string | null,
): Promise<void> {
  const data = await read();
  data.locationVotes = data.locationVotes.filter(
    (v) => !(v.tripSlug === tripSlug && v.voter === voter),
  );
  if (locationSlug) data.locationVotes.push({ tripSlug, voter, locationSlug });
  await write(data);
}

export async function addNote(note: Omit<Note, "id" | "createdAt">): Promise<Note> {
  const data = await read();
  const created: Note = { ...note, id: randomUUID(), createdAt: new Date().toISOString() };
  data.notes.push(created);
  await write(data);
  return created;
}

export async function getNote(id: string): Promise<Note | undefined> {
  return (await read()).notes.find((n) => n.id === id);
}

export async function deleteNote(id: string): Promise<void> {
  const data = await read();
  data.notes = data.notes.filter((n) => n.id !== id);
  await write(data);
}
