/* Holiday Planner — landing page data.
   Featured trip + its three candidate locations use the real, validated
   photography already in the codebase. Upcoming trips use the codebase's own
   gradient-cover system (see components/cover.tsx) — honest "photo to come". */
window.HP = (function () {
  const IMG = {
    kalkan:
      "https://images.unsplash.com/photo-1683977817985-8493d2836311?auto=format&fit=crop&w=2200&q=80",
    chania:
      "https://images.unsplash.com/photo-1667307450731-c4e7eeb9e8b3?auto=format&fit=crop&w=2200&q=80",
    rhodes:
      "https://images.unsplash.com/photo-1711201985055-fc38c83030a4?auto=format&fit=crop&w=2200&q=80",
    villa:
      "https://images.unsplash.com/photo-1509600110300-21b9d5fedeb7?auto=format&fit=crop&w=1600&q=80",
  };

  const featured = {
    slug: "autumn-2026",
    name: "Autumn Holiday 2026",
    subtitle: "Family trip · 4 adults",
    window: "Late September – October 2026",
    status: "Deciding together",
    travellers: 4,
    locationCount: 3,
    optionCount: 1, // priced/shortlisted options so far
    fromPrice: 2304,
    perPerson: 576,
    hero: IMG.kalkan,
    heroAlt:
      "Evening light over a harbour of traditional wooden gulets on Turkey's Turquoise Coast, the hillside town rising behind",
    note: "Three coastlines on the shortlist · one villa costed so far",
    locations: [
      {
        slug: "kalkan",
        name: "Kalkan",
        country: "Turkey",
        image: IMG.kalkan,
        imageAlt:
          "Harbour of wooden gulets at dusk on Turkey's Turquoise Coast below a hillside town",
        blurb: "Villa-dense slopes above a pretty harbour and a rooftop-restaurant old town.",
        meta: "From £2,304 · 1 villa shortlisted",
        from: 2304,
        statusLabel: "1 option costed",
        statusTone: "shortlisted",
        accomm: 1,
        airport: "Dalaman (DLM)",
        flightTime: "~4h15",
        season: { high: 26, sea: 24, sun: 8, rain: 4 },
        seasonNote: "Reliably warm through October — the sea is still comfortably swimmable.",
      },
      {
        slug: "chania",
        name: "Chania",
        country: "Crete · Greece",
        image: IMG.chania,
        imageAlt:
          "Clear turquoise water curving around a headland on the north-west coast of Crete",
        blurb: "Venetian harbour, atmospheric old town and some of the island's best beaches.",
        meta: "Researching villas",
        from: null,
        statusLabel: "Researching",
        statusTone: "idea",
        accomm: 0,
        airport: "Chania (CHQ)",
        flightTime: "~4h",
        season: { high: 24, sea: 24, sun: 7, rain: 5 },
        seasonNote: "Lovely in early October, but direct flights wind down towards month-end.",
      },
      {
        slug: "rhodes",
        name: "Rhodes",
        country: "Greece",
        image: IMG.rhodes,
        imageAlt:
          "A bougainvillea-draped stone archway in the medieval Old Town of Rhodes, opening onto the sea",
        blurb: "UNESCO medieval old town; the season runs latest — direct flights into November.",
        meta: "Researching villas",
        from: null,
        statusLabel: "Researching",
        statusTone: "idea",
        accomm: 0,
        airport: "Rhodes (RHO)",
        flightTime: "~4h10",
        season: { high: 25, sea: 24, sun: 7, rain: 4 },
        seasonNote: "The latest season of the three — reliable late-October sun and quieter resorts.",
      },
    ],
  };

  // Upcoming trips — early ideas, no photography shot yet. Rendered with the
  // codebase's deterministic gradient covers, honestly labelled.
  const upcoming = [
    {
      slug: "summer-2027",
      name: "Summer Holiday 2027",
      window: "July – August 2027",
      status: "Just an idea",
      gradient: "linear-gradient(135deg, #1d6a6a 0%, #2f8f8f 52%, #7cc0b4 100%)",
      hint: "Long, slow summer — Italy or the Greek islands",
    },
    {
      slug: "winter-2026",
      name: "Christmas Escape 2026",
      window: "December 2026",
      status: "Just an idea",
      gradient: "linear-gradient(135deg, #234e6e 0%, #3a7ca5 52%, #79b3c4 100%)",
      hint: "Somewhere warm, or somewhere snowy — undecided",
    },
    {
      slug: "spring-2027",
      name: "Spring City Break 2027",
      window: "April 2027",
      status: "Just an idea",
      gradient: "linear-gradient(135deg, #6d4b66 0%, #9a6a8f 52%, #c9a0c0 100%)",
      hint: "A few days somewhere walkable and warm",
    },
  ];

  function gbp(n) {
    if (n == null) return null;
    return "£" + n.toLocaleString("en-GB");
  }

  // Extra candidates for demonstrating the "many locations" case. No photo shot
  // yet → gradient covers (brand-honest), all still in research.
  const extraLocations = [
    {
      slug: "paphos", name: "Paphos", country: "Cyprus",
      gradient: "linear-gradient(150deg, #1d6a6a 0%, #2f8f8f 60%, #7cc0b4 100%)",
      blurb: "Latest season of all — reliable warmth into late October and quiet resort coves.",
      meta: "Researching villas", from: null, statusLabel: "Researching", statusTone: "idea",
    },
    {
      slug: "algarve", name: "Algarve", country: "Portugal",
      gradient: "linear-gradient(150deg, #9a5b00 0%, #c97f1a 58%, #e6b566 100%)",
      blurb: "Golden cliffs and calm Atlantic beaches; villa-dense around Lagos and Carvoeiro.",
      meta: "Researching villas", from: null, statusLabel: "Researching", statusTone: "idea",
    },
    {
      slug: "tenerife", name: "Tenerife", country: "Canary Islands",
      gradient: "linear-gradient(150deg, #234e6e 0%, #3a7ca5 58%, #79b3c4 100%)",
      blurb: "Year-round sun off the African coast — the safe bet if October turns cool.",
      meta: "Researching villas", from: null, statusLabel: "Researching", statusTone: "idea",
    },
  ];

  // featured.locations carry real photos; extras carry gradients. Both share shape.
  const manyLocations = featured.locations.concat(extraLocations);

  // Accommodations being compared, per location. Kalkan's first stay is the real
  // "Villa Veranda" from the codebase seed data; the other two are plausible
  // comparison candidates (swap for real listings). Honest about cost: a stay
  // with total:null shows "price to confirm".
  const VILLA_IMG = {
    veranda: IMG.villa,
    likya: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
    mavi: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=80",
  };
  const staysByLocation = {
    kalkan: [
      {
        slug: "kalkan-villa-veranda",
        name: "Villa Veranda",
        statusLabel: "Favourite so far", statusTone: "shortlisted", favourite: true,
        rating: "9.3",
        image: VILLA_IMG.veranda,
        imageAlt: "A stone villa beside its private pool on a wooded hillside at dusk",
        photoCount: 24,
        summary: "Recently renovated single-storey villa on a quiet road above the Yalı/Likya beach clubs, with a sea-view pool and a short walk down to the harbour.",
        beds: 2, sleeps: 4, baths: 2, pool: true, airCon: true, sizeSqft: 1076,
        nights: 5, dates: "4–9 Oct 2026",
        total: 2304, perPerson: 576, perNight: 461,
        cancel: "Free cancellation until 29 Sep",
        walk: "~10–15 min to town & harbour",
        pros: ["Sea-view private pool", "Single-storey — no stairs", "Recently renovated"],
        cons: ["2 bedrooms (sleeps 4: 1 double + 3 singles)"],
        listingUrl: "#",
        rateNote: "Free-cancellation rate — cancel free before 29 Sep. Non-refundable rate £1,924. Was £2,589.",
        extras: ["Sea-view private pool", "Free on-site parking", "Free WiFi", "Washing machine", "BBQ", "Covered veranda", "Fully equipped kitchen"],
        gallery: [
          VILLA_IMG.veranda,
          VILLA_IMG.likya,
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
          VILLA_IMG.mavi,
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        ],
        costLines: [
          { label: "Accommodation", detail: "5 nights · Villa Veranda", amount: 2304 },
          { label: "Flights", detail: "Manchester → Dalaman · 4 adults", amount: null },
          { label: "Car hire", detail: "7 days · from the airport", amount: null },
          { label: "Transfers", detail: "Dalaman ↔ Kalkan", amount: null },
        ],
      },
      {
        slug: "kalkan-villa-likya-heights",
        name: "Villa Likya Heights",
        statusLabel: "Shortlisted", statusTone: "shortlisted", favourite: false,
        rating: "9.1",
        image: VILLA_IMG.likya,
        imageAlt: "A villa with an infinity pool overlooking the sea at dusk",
        photoCount: 31,
        summary: "Three-bedroom villa higher up the slope with panoramic harbour views, an infinity pool and a big shaded terrace for evening meals.",
        beds: 3, sleeps: 6, baths: 3, pool: true, airCon: true, sizeSqft: 1500,
        nights: 5, dates: "4–9 Oct 2026",
        total: 2680, perPerson: 670, perNight: 536,
        cancel: "Free cancellation until 27 Sep",
        walk: "~20 min downhill to town",
        pros: ["3 bedrooms — room to spread out", "Infinity pool & sea views", "Large shaded dining terrace"],
        cons: ["Steep walk back up from town", "Pricier per person"],
      },
      {
        slug: "kalkan-villa-mavi",
        name: "Villa Mavi",
        statusLabel: "Researching", statusTone: "idea", favourite: false,
        rating: "8.8",
        image: VILLA_IMG.mavi,
        imageAlt: "A modern whitewashed villa with a compact private pool and roof terrace",
        photoCount: 18,
        summary: "Modern two-bed moments from the old town and harbour — walkable to everything, with a compact private pool and a roof terrace for sundowners.",
        beds: 2, sleeps: 4, baths: 2, pool: true, airCon: true, sizeSqft: 970,
        nights: 5, dates: "4–9 Oct 2026",
        total: null, perPerson: null, perNight: null,
        cancel: "Awaiting quote",
        walk: "~5 min to town & harbour",
        pros: ["Walk to everything", "Newest of the three", "Roof terrace"],
        cons: ["Smallest pool", "Price still to confirm"],
      },
    ],
  };

  return { featured, upcoming, gbp, extraLocations, manyLocations, staysByLocation };
})();
