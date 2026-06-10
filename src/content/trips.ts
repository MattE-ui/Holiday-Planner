import type { Trip } from "./types";

// ---------------------------------------------------------------------------
// SEED DATA
// Add a new holiday: drop another object into a location's `holidays` array.
// Add a new location: drop another object into a trip's `locations` array.
// Add a new trip (e.g. "Summer Holiday 2027"): add to the `trips` array below.
// ---------------------------------------------------------------------------

export const trips: Trip[] = [
  {
    slug: "autumn-2026",
    name: "Autumn Holiday 2026",
    subtitle: "Family trip · 4 adults",
    window: "Late September – October 2026",
    travellers: 4,
    locations: [
      {
        slug: "kalkan",
        name: "Kalkan",
        country: "Turkey",
        blurb:
          "Hillside resort town on the Turquoise Coast — villa-dense slopes above a pretty harbour and an old town full of rooftop restaurants. Strong value for private-pool villas with sea views.",
        airport: "Dalaman (DLM) · ~1½–2 hr transfer",
        flightSummary:
          "Jet2 direct from Manchester, Leeds Bradford, Liverpool & Birmingham (~4 hr 15 min). TUI, SunExpress & easyJet also serve some airports.",
        holidays: [
          {
            slug: "kalkan-villa-veranda",
            name: "Kalkan Villa Veranda",
            status: "shortlisted",
            rating: "9.3 / 10",
            summary:
              "Recently renovated single-storey villa on a quiet road above the Yali/Likya beach clubs, with a sea-view pool and a short walk down to the harbour.",
            listingUrl: "https://www.booking.com/Share-M5KbwSFR",
            accommodation: {
              bedrooms: 2,
              sleeps: 4,
              bathrooms: 2,
              privatePool: true,
              airCon: true,
              walkToAmenities: "~10–15 min to town & harbour; 14 min to Kalkan Public Beach",
              modern: true,
              sizeSqft: 1076,
              extras: [
                "Sea-view private pool",
                "Free on-site parking",
                "Free WiFi",
                "Washing machine",
                "BBQ",
                "Covered veranda",
                "Fully equipped kitchen",
              ],
            },
            nights: 5,
            dates: "4–9 Oct 2026",
            accommodationTotal: 2304,
            rateNote:
              "£2,304 free-cancellation rate (free cancel before 29 Sep). Non-refundable rate £1,924. Was £2,589.",
            flights: [],
            // carHire, transfers to be added as research continues
            pros: [],
            cons: ["2 bedrooms rather than 3 (sleeps 4 across 1 double + 3 singles)"],
            notes: "",
          },
        ],
      },
      {
        slug: "chania",
        name: "Chania",
        country: "Crete, Greece",
        blurb:
          "North-west Crete — Venetian harbour, atmospheric old town and some of the island's best beaches. Plenty of private-pool villas in the villages just outside the city (Almyrida, Kalyves, Apokoronas).",
        airport: "Chania (CHQ) · 20–40 min to most stays",
        flightSummary:
          "Seasonal (Jun–Oct) direct from Manchester, Birmingham & Leeds Bradford with Jet2, Ryanair & TUI. Liverpool limited/none direct. ~4 hr. Routes typically end late October.",
        holidays: [],
      },
      {
        slug: "rhodes",
        name: "Rhodes",
        country: "Greece",
        blurb:
          "Larger Dodecanese island with a UNESCO medieval old town and a good spread of resort villages. Private-pool villas around Lindos, Pefkos and the calmer south-east. Season runs later — direct flights often into November.",
        airport: "Rhodes Diagoras (RHO) · 15 min to town, ~1 hr to Lindos",
        flightSummary:
          "Direct Jet2 from Leeds Bradford & Liverpool; easyJet, Jet2 & Ryanair from Birmingham; Manchester also served. Season ~Apr–Nov. ~4 hr 10–25 min.",
        holidays: [],
      },
    ],
  },
];

// ---- lookup helpers -------------------------------------------------------

export function getTrip(tripSlug: string): Trip | undefined {
  return trips.find((t) => t.slug === tripSlug);
}

export function getLocation(tripSlug: string, locationSlug: string) {
  const trip = getTrip(tripSlug);
  const location = trip?.locations.find((l) => l.slug === locationSlug);
  return { trip, location };
}

export function getHoliday(tripSlug: string, locationSlug: string, holidaySlug: string) {
  const { trip, location } = getLocation(tripSlug, locationSlug);
  const holiday = location?.holidays.find((h) => h.slug === holidaySlug);
  return { trip, location, holiday };
}
