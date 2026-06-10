# Handoff: Landing Page — "Atelier" (Direction C)

## Overview
A new landing page (`/`, `src/app/page.tsx`) for **Holiday Planner**. It replaces the current
centered-header + card-grid home with a **cinematic, image-led** layout: one full-bleed featured
trip fills the screen, and a tactile **deck of candidate-location postcards** sits at the bottom.
Picking a postcard re-skins the whole hero to that location. Beyond ~4 locations the deck becomes
a centered, overlapping carousel; on mobile it becomes a swipeable rail.

This is the **"Atelier"** direction the client chose from a 3-way exploration.

## About the Design Files
The files in this bundle are **design references built in HTML/React + inline styles** — prototypes
that show the intended look and behaviour. They are **not production code to copy verbatim**. The job
is to **recreate these designs inside the existing Next.js app** using its established patterns:
the `next/font` Spectral setup, the CSS-variable design tokens in `src/app/globals.css`, Tailwind,
the existing `Hero` / `Cover` / `Card` components, `next/image`, and `lucide-react` icons. Inline
styles in the prototype should become Tailwind classes / token references in the real implementation.

The content model already exists and needs **no schema changes** — everything renders from
`src/content/trips.ts` (`Trip → Location → Holiday`). See "Data" below.

## Fidelity
**High-fidelity.** Colours, typography, spacing, transitions and interactions are final. Recreate the
UI faithfully, but source every colour/radius/shadow from the existing tokens rather than the raw hex
in the prototype (they were derived from your tokens — see mapping below).

---

## Screens / Views

### 1. Landing — desktop (featured trip + location deck)
**Purpose:** Land on the in-progress trip, feel the place, and pick a candidate location to compare.

**Layout** (design canvas 1440×900, but the real page is full-viewport / responsive):
- Root: full-viewport (`100vw × 100vh`, min-height `100svh`) relative container, dark fallback bg
  `hsl(198 36% 9%)`, white text.
- **Hero background**: full-bleed `next/image` (`fill`, `object-cover`, `priority`) of the *active*
  location's photo. All candidate images are stacked and cross-faded by opacity (see Interactions).
- **Scrims** (over image, under content):
  - Diagonal: `linear-gradient(105deg, rgba(8,28,34,.82) 0%, rgba(8,28,34,.5) 34%, rgba(8,28,34,.12) 60%, rgba(8,28,34,.34) 100%)`
  - Top band: `height:120px; linear-gradient(to bottom, rgba(8,28,34,.5), transparent)`
- **Top bar** (`position:absolute; top:0; inset-x:0; padding:22px 40px; flex; justify-between`):
  - Left: **wordmark** — 30px teal-on-glass circle with `lucide-react` `Plane` (15px) + "Holiday
    Planner" in Spectral 600 / 18px. (Reuse `SiteHeader`'s mark, light variant.)
  - Right: ghost **"+ Add a trip"** pill — `height:38; padding:0 16px; radius:999; border:1px solid rgba(255,255,255,.45); background:rgba(255,255,255,.10); backdrop-blur(6px); 13.5px/600`.
- **Title block** (`position:absolute; left:40; bottom:48; max-width:560`):
  - Status chip "Deciding together" (see Components → StatusChip), `margin-bottom:16`.
  - `<h1>` trip name — Spectral 600, **72px**, line-height .98, letter-spacing -.025em,
    `text-shadow:0 2px 30px rgba(0,0,0,.34)`. Wraps to 2 lines naturally.
  - Meta row (`margin-top:18; flex; gap:18; 15px; rgba(255,255,255,.9)`): `CalendarDays` + window;
    a 4px dot divider; `MapPin` + "{N} locations".
  - **"Now showing"** line (`margin-top:20; 13.5px; max-width:440`): an uppercase 11.5px label
    "Now showing", then the active location name+country in **Spectral italic 17px**, then
    " — {location blurb}" in `rgba(255,255,255,.62)`. Updates live with the active card.
  - Primary **"Open this trip"** button (`margin-top:24; height:52; padding:0 26px; radius:999;
    background:#fff; color:hsl(193 52% 22%); 16px/700; box-shadow:0 12px 30px rgba(0,0,0,.3)`) with a
    trailing `ArrowRight`. Hover: translateY(-2px) + deepen shadow. **Links to** `/{trip.slug}`.
- **Location deck** (bottom-right) — see "2. Location deck" component below.

### 2. Landing — mobile
Same hero + title, restructured for a 402-wide screen (iOS safe areas: ~58px top, ~34px bottom):
- Top bar at `top:58`, wordmark + a glass "2 more trips" pill.
- Title block at `top:188`: status chip; `<h1>` **33px** / line-height 1.06 (wraps to 2 lines);
  then two stacked meta lines (window; "From £X · ~£Ypp"), 13px.
- **Deck = horizontal swipe rail** pinned near the bottom (`bottom:52`):
  - Header row: "Choosing between · {N}" (11px/700 uppercase) on the left, active
    "{name}, {country}" in Spectral italic 15px on the right.
  - Rail: `display:flex; gap:12; overflow-x:auto; scroll-snap-type:x mandatory; padding:10px 18px 6px`,
    scrollbars hidden. Each card `150×178`, `scroll-snap-align:center`.
  - Active card: lifts `translateY(-10)`, full opacity, white 2.5px border, `ArrowRight` shown.
    Inactive: opacity .82, border `rgba(255,255,255,.34)`.
  - **Page dots** under the rail (active dot widens to 18px). Tapping a card or dot selects it AND
    smooth-scrolls it to centre.

### 3. Landing — many locations (≥4)
Identical chrome; the desktop deck switches from a small fan to a **centered carousel** (see deck spec).
Mobile is unchanged (the rail just has more cards + dots). Demonstrated with 6 locations.

### 4. Locations (trip page) — `src/app/[trip]/page.tsx`
**Route:** opens from "Open this trip" / a trip on the landing. **Purpose:** compare the candidate
locations for a trip, with the seasonal detail for the trip's time of year, then dive into a
location's accommodations.

**Layout** — a light editorial header, then one **cinematic full-bleed band per location**, then a footer.
- **Sticky nav** (seafoam `hsla(190,30%,98%,.86)` + blur, `border-bottom hsl(196 24% 90%)`, height 66):
  wordmark left, outline "+ Add a trip" right.
- **Intro header** (`padding:30px 48px 36px`): a muted "‹ All trips" back link; then a row with, on the
  left, a "Deciding together" status chip, the trip `<h1>` (Spectral 600 / 56px, `hsl(198 32% 14%)`),
  and a meta line (`CalendarDays` + window · dot · `trip.subtitle`); on the right, a one-sentence intro
  (`max-width:430; hsl(199 14% 38%)`) framing the decision.
- **Location bands** — for each `location`, a `position:relative; height:482px; overflow:hidden` section:
  - Full-bleed `next/image` of the location photo; image slow-zooms to `scale(1.05)` on band hover.
  - Two scrims: foot `linear-gradient(to top, rgba(8,28,34,.88), rgba(8,28,34,.34) 46%, rgba(8,28,34,.06) 72%)`
    and a left wash `linear-gradient(105deg, rgba(8,28,34,.55), rgba(8,28,34,.12) 42%, transparent 64%)`.
  - **Top-left:** big serif index ("01") + a `StatusChip` (light) — "1 option costed" (success tone) or
    "Researching" (neutral).
  - **Bottom-left block** (`left:48; bottom:38; right:400`): `<h2>` name (Spectral 600 / 54px) with
    `, {country}` in italic 30px; a 16.5px blurb (`max-width:580`); then an **October seasonal row** —
    an uppercase "October" label followed by glass stat pills (`height:38; radius:999;
    bg rgba(255,255,255,.13); border rgba(255,255,255,.28); blur`): day-high °, sea °, sun h, and
    flight time + airport (icons: thermometer, waves, sun, plane). Below it a 13.5px season note.
  - **Bottom-right panel** (`right:48; bottom:38; width:300; radius:18; bg rgba(12,30,36,.5); border
    rgba(255,255,255,.18); blur`): a "{n} stays being compared" / "No stays added yet" line (bed icon);
    then either **"from £X · ~£Ypp"** (Spectral 34px figure) or "Still researching villas — price to
    confirm"; then a full-width white **"View accommodations" / "Add accommodations"** button → links to
    `/{trip}/{location}`.
- **Footer** (`padding:26px 48px`, seafoam): "Comparing N locations…" + an "+ Add another location" link.

**Seasonal data:** the prototype carries illustrative October figures per location
(`season:{high,sea,sun,rain}`, `airport`, `flightTime`, `seasonNote`). These are **not in the current
content model** — add them to the `Location` type (or fetch from a climate source) and keep the
"honest about cost / time of year" tone. `accomm` (count) and `from` (min costed price, or null) derive
from the location's `holidays`.

---

## Component: Location deck (the signature interaction)

### Desktop carousel (`DirectionCMany` in `directionC-many.jsx`)
A bottom-anchored, centered fan. Container: `position:absolute; right:40; bottom:10; width:720; height:300`.
Cards are absolutely positioned, `left:50%; bottom:0; width:190; height:250; margin-left:-95;
transform-origin:bottom center; border:3px solid #fff; border-radius:16`.

For each card, let `d = index - activeIndex`, `ad = |d|`. Compute style from `d`:
- `translateX = d * 146` (px)  ← controls overlap/compactness (146 with 190-wide cards ≈ slight overlap)
- `translateY = (ad===0 ? -26 : ad===1 ? 2 : 16)` minus `12` extra **only while hovered & not active**
- `rotate = (hovered && !active) ? 0 : d * 3.5deg`
- `scale = ad===0 ? 1.06 : ad===1 ? .98 : ad===2 ? .9 : .85`
- `opacity = ad===0 ?1 : ad===1 ?1 : ad===2 ?.5 : ad===3 ?.16 : 0` (bump to ≥.95 while hovered)
- `zIndex = active ?100 : hovered ?95 : 90 - ad*10`
- `box-shadow = (active||hover) ? "0 16px 34px rgba(0,0,0,.40)" : "0 10px 24px rgba(0,0,0,.30)"`
- `pointer-events:none` when base opacity < .2
- `transition: transform .55s cubic-bezier(.22,1,.36,1), opacity .55s, box-shadow .35s`

The opacity ramp is what dissolves the outer "peek" cards toward the edges — **do not** add an
overflow/clip or a CSS mask on the container (an earlier mask clipped the card shadows into a hard
line). Soft shadows + opacity only.

**Controls** (top-right of the deck container): a Prev circle button, a `"0X / 0N"` counter
(`String(i+1).padStart(2,'0')`), a Next circle button. Buttons are 34px glass circles; disabled-look
(opacity .4) at the ends.

**Card face:** `CoverFill` (photo via `next/image`, or a brand gradient cover if no photo yet — see
Data), a bottom scrim `linear-gradient(to top, rgba(0,0,0,.66), transparent 56%)`, then
name (Spectral 600 / 18px), country (11px / .82 white), and either "From £X" (700) or "Researching".

### Mobile rail (`DirectionCMobile`)
Same card face at `150×178` in a horizontal scroll-snap rail (see Screen 2). Selecting a card sets
active, re-skins the hero, and programmatically scrolls the card to centre via
`rail.scrollTo({ left: card.offsetLeft - (rail.clientWidth - card.clientWidth)/2, behavior:'smooth' })`.
**Never use `scrollIntoView`.**

### The original small fan (3–4 locations) — optional
`directionC.jsx` shows the simpler fixed fan (cards at `translateX((i-center)*150)`, `rotate
(i-center)*9deg`, the hovered/active one lifting). For ≤4 locations you may keep this; for the general
case the centered carousel above handles any count, so it's fine to ship only the carousel.

---

## Component: StatusChip
A pill that never relies on colour alone (WCAG): a 6px dot + text label.
- On photos (`light`): `background:rgba(255,255,255,.18); border:1px solid rgba(255,255,255,.34);
  backdrop-blur; color:#fff; 12px/600; padding:4px 10px 4px 8px; radius:999`.
- On surfaces: tones — shortlisted/booked use success green
  (`bg rgba(20,83,55,.14)`, `fg hsl(142 58% 26%)`, dot `hsl(142 58% 34%)`); idea/researching uses a
  neutral grey (`fg hsl(199 14% 38%)`).

---

## Interactions & Behavior
- **Active location** is the single source of truth (`useState` index). It drives: the hero
  cross-fade, the "Now showing" line, the deck card transforms, and the counter.
- **Hero cross-fade**: render every candidate's fill stacked; the active one `opacity:1`, others `0`,
  `transition: opacity .8s cubic-bezier(.22,1,.36,1)`; active fill also slow-zooms
  `scale(1.06)` from `scale(1.14)` over 1.6s.
- **Selecting** a location = **click a card** or the **Prev/Next arrows** (desktop) / **tap a card
  or dot** (mobile). **Hover must NOT change the active card** — hover only previews (a small lift).
  (An earlier hover-to-select version caused a feedback loop as cards slid under the cursor.)
- **Entrance**: title block rises in (`opacity 0→1, translateY 16→0, 820ms`), gated behind
  `@media (prefers-reduced-motion: no-preference)` with the **visible state as the base** so reduced
  motion / SSR / print never hide content.
- Buttons/cards: `cursor:pointer`; primary buttons lift 2px on hover.
- **"Open this trip"** and tapping into a location should navigate (`next/link`) to the trip /
  location route — wire to the real routes (`/[trip]`, `/[trip]/[location]`).

## State Management
- One client component for the hero+deck (`'use client'`) holding `const [active, setActive] =
  useState(0)` (the demo opens the many-case at index 2 just to show both-side peeks; default 0 is
  fine in production). Optional `hover` state per card for the preview lift.
- No data fetching — content is imported from `src/content/trips.ts`. The home page reads
  `trips[0]` (or a "current"/featured trip) for the hero and `trip.locations` for the deck;
  "also planning" / upcoming trips are the remaining `trips`.

## Data
Featured trip + its candidate **locations** come straight from the existing `Trip`/`Location` types.
The deck card needs, per location: `name`, `country`, `image`/`imageAlt`, `blurb`, and a derived
"from" price + a status ("Researching" when no holiday is costed yet). Compute "from" as the min
`accommodationTotal` across that location's `holidays` (null → show "Researching"). Per-person =
total / `trip.travellers`.

**Gradient covers:** locations/trips without a photo yet render a deterministic brand **gradient**
instead of a broken image — this already exists as the `Cover` component
(`src/components/cover.tsx`, the `GRADIENTS` array). Reuse it for "photo to come" cards; mark them
"Researching" so it stays honest about cost (a core product principle).

## Design Tokens (already in `src/app/globals.css` — use these, not raw hex)
- `--primary: 193 52% 25%` (deep teal) · `--accent: 190 45% 34%` · `--background: 190 30% 98%`
- `--foreground: 198 32% 14%` · `--muted-foreground: 199 14% 42%` · `--border: 196 24% 88%`
- `--success: 142 58% 30%` (used for "shortlisted/booked" status) · `--radius: 1rem`
- Dark hero fallback / scrim ink: `hsl(198 36% 9%)` and `rgba(8,28,34,*)` scrims over photos.
- Fonts: **Spectral** (display, via `next/font` — already configured as `--font-display`) for all
  headings/serif accents; system sans (`--font-sans`) for UI text.
- Shadows: prototype uses soft photo-card shadows; your `shadow-soft` / `shadow-lift` tokens are the
  on-surface equivalents.
- Easing: `cubic-bezier(.22,1,.36,1)` throughout; durations .35–.8s.

## Assets
- Location photography: real Unsplash URLs already in `src/content/trips.ts` (Kalkan/Kaş, Chania,
  Rhodes). Swap for owned/listing photos later. Always provide `imageAlt`.
- Icons: `lucide-react` — `Plane`, `CalendarDays`, `MapPin`, `ArrowRight` (Coins for the price line,
  or reuse an existing glyph).
- No SVG illustrations; "photo to come" tiles use the gradient `Cover`.

## Files in this bundle (design references)
- `Landing Page.html` — the full exploration (3 directions + the C mobile/scaling section) on a canvas.
- `directionC.jsx` — desktop "Atelier" hero + small fixed fan (3–4 locations).
- `directionC-many.jsx` — desktop hero + **centered carousel** (any count) ← primary deck spec.
- `directionC-mobile.jsx` — mobile hero + **swipe rail** + dots.
- `locations-screen.jsx` — **Locations / trip page**: editorial header + cinematic location bands
  (`LocationsScreen`, `LocationBand`, `SeasonStat`).
- `shared.jsx` — `SmartImage` (photo w/ gradient fallback), `Ico` (icons inc. thermo/sun/wave),
  `Wordmark`, `StatusChip`.
- `data.js` — the demo data shape (mirrors your `trips.ts`; in the app, read from `trips.ts`).

> Implement against your repo's real components and routes — the HTML here is the reference, your
> Next.js app is the target. Ignore Directions A & B unless you want them; the client chose C.
