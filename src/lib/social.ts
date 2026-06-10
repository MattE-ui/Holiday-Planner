import * as fileSocial from "@/lib/social-file";
import * as pgSocial from "@/lib/social-pg";

// ---------------------------------------------------------------------------
// Social layer — votes and notes left by family members. Server-only.
//
// Identity is a self-chosen first name (no accounts): the member banner asks
// "who's looking?" once per device and every vote/note carries that name.
// Backend selection mirrors the trip store: Postgres when DATABASE_URL /
// POSTGRES_URL is set, otherwise a JSON file (data/social.json) for local dev.
// ---------------------------------------------------------------------------

/** One member's favourite stay within a location (one per member per location). */
export interface StayVote {
  tripSlug: string;
  locationSlug: string;
  /** The chosen stay. */
  holidaySlug: string;
  voter: string;
}

/** One member's overall favourite location for a trip (one per member per trip). */
export interface LocationVote {
  tripSlug: string;
  locationSlug: string;
  voter: string;
}

/** A note pinned to the trip (general), a location, or a specific stay. */
export interface Note {
  id: string;
  tripSlug: string;
  locationSlug?: string;
  holidaySlug?: string;
  author: string;
  body: string;
  /** ISO timestamp. */
  createdAt: string;
}

/** Everything social for one trip, fetched once per page render. */
export interface TripSocial {
  stayVotes: StayVote[];
  locationVotes: LocationVote[];
  notes: Note[];
}

const usePostgres = Boolean(process.env.DATABASE_URL ?? process.env.POSTGRES_URL);
const backend = usePostgres ? pgSocial : fileSocial;

export const getTripSocial = (tripSlug: string): Promise<TripSocial> =>
  backend.getTripSocial(tripSlug);

/** Upsert: a member's favourite stay within a location. Re-picking the same
 *  stay clears the vote (toggle). */
export const setStayVote = (
  tripSlug: string,
  locationSlug: string,
  voter: string,
  holidaySlug: string | null,
): Promise<void> => backend.setStayVote(tripSlug, locationSlug, voter, holidaySlug);

/** Upsert: a member's favourite location for a trip. null clears it. */
export const setLocationVote = (
  tripSlug: string,
  voter: string,
  locationSlug: string | null,
): Promise<void> => backend.setLocationVote(tripSlug, voter, locationSlug);

export const addNote = (note: Omit<Note, "id" | "createdAt">): Promise<Note> =>
  backend.addNote(note);

export const deleteNote = (id: string): Promise<void> => backend.deleteNote(id);

export const getNote = (id: string): Promise<Note | undefined> => backend.getNote(id);
