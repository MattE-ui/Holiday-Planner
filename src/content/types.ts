// ---------------------------------------------------------------------------
// Content model for the Holiday Planner.
// Everything the site renders comes from these typed structures. Data lives in
// data/trips.json, managed through src/lib/store.ts and the server actions in
// src/lib/actions.ts — trips, locations and stays are created in the app.
// ---------------------------------------------------------------------------

export type HolidayStatus = "idea" | "shortlisted" | "favourite" | "booked";

/** A single cost line in a holiday's price breakdown. */
export interface CostLine {
  label: string;
  detail?: string;
  /** GBP total for this line. Use null when the figure is still to be confirmed. */
  amount: number | null;
}

export interface Flight {
  airport: string; // departure airport, e.g. "Manchester (MAN)"
  airline?: string;
  outDate?: string;
  backDate?: string;
  price?: number | null; // total for the party unless noted
  bagsIncluded?: boolean;
  notes?: string;
}

export interface CarHire {
  provider?: string;
  vehicle?: string;
  days?: number;
  price?: number | null;
  notes?: string;
}

export interface Accommodation {
  bedrooms?: number;
  sleeps?: number;
  bathrooms?: number;
  privatePool?: boolean;
  airCon?: boolean;
  /** Free-text walking distance to shops/food. */
  walkToAmenities?: string;
  modern?: boolean;
  sizeSqft?: number;
  extras?: string[];
}

/** A single accommodation option — treated as a complete "holiday in theory". */
export interface Holiday {
  slug: string;
  name: string;
  status?: HolidayStatus;
  summary?: string;
  listingUrl?: string;
  /** Path under /public or an absolute URL. Optional — a gradient is shown if absent. */
  image?: string;
  /** Alt text for `image`. Describe the scene; it's part of the voice. */
  imageAlt?: string;
  /** Extra listing photos beyond the cover. Length (+ the cover) drives the
   *  "{n} photos" badge — only stored images are counted, never an invented total. */
  photos?: string[];
  /** Guest/host rating shown as a badge, e.g. "9.3 / 10". */
  rating?: string;

  /** Street address as shown on the listing (used under the map). */
  address?: string;
  /** Exact position of the accommodation, e.g. parsed from a Booking.com page. */
  coords?: { lat: number; lng: number };

  accommodation: Accommodation;

  nights?: number;
  dates?: string;
  /** Headline accommodation cost for the stay (party total). null = to confirm. */
  accommodationTotal?: number | null;
  /** Optional alternative rate note, e.g. a cheaper non-refundable price. */
  rateNote?: string;

  flights?: Flight[];
  carHire?: CarHire;
  transfers?: CostLine;
  /** Any other costs to fold into the total (insurance, resort fees, etc.). */
  extraCosts?: CostLine[];

  pros?: string[];
  cons?: string[];
  notes?: string;
}

export interface Location {
  slug: string;
  name: string; // e.g. "Kalkan"
  country: string; // e.g. "Turkey"
  blurb?: string;
  airport?: string;
  flightSummary?: string;
  /** Approx door-to-door flight time, e.g. "~4h15". Shown on the locations page. */
  flightTime?: string;
  /** Illustrative climate figures for the trip's time of year (currently October). */
  season?: { high: number; sea: number; sun: number };
  /** One honest line on the season — warmth, sea, how late flights run. */
  seasonNote?: string;
  image?: string;
  imageAlt?: string;
  holidays: Holiday[];
}

export interface Trip {
  slug: string;
  name: string; // e.g. "Autumn Holiday 2026"
  subtitle?: string;
  window?: string; // e.g. "Late September – October 2026"
  travellers?: number;
  image?: string;
  imageAlt?: string;
  locations: Location[];
}
