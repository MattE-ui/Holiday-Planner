# Holiday Planner

A small Next.js site for comparing holidays before booking. Browse **Trips → Locations → Holidays**; each holiday page shows the accommodation, flights, car hire and a combined **price breakdown** (total + per person).

Built with **Next.js (App Router) + TypeScript + Tailwind CSS** and shadcn-style UI components. All pages are statically generated.

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

Build a production bundle:

```bash
npm run build
npm start
```

## Add or edit content

All content lives in **`src/content/trips.ts`** — no component changes needed.

- **New holiday:** add an object to a location's `holidays` array.
- **New location:** add an object to a trip's `locations` array.
- **New trip** (e.g. "Summer 2027"): add an object to the top-level `trips` array.

The shape of each object is defined in `src/content/types.ts`. Any cost left as
`null` (or omitted) shows as **"to confirm"** and the totals flag what's still
pending, so partly-researched holidays display cleanly.

## Deploy to Vercel

This is a standard Next.js app — Vercel auto-detects everything.

**Option A — Vercel CLI (fastest):**

```bash
npm i -g vercel
vercel            # first run links/creates the project
vercel --prod     # deploy to a public URL
```

**Option B — Git + Vercel dashboard:**

1. Push this folder to a GitHub/GitLab repo.
2. In the Vercel dashboard: **New Project → Import** the repo.
3. Framework preset **Next.js** (auto). Click **Deploy**.

Every later `git push` (or `vercel --prod`) redeploys.

## Project structure

```
src/
  app/                         # routes (App Router)
    page.tsx                   # / — list of trips
    [trip]/page.tsx            # a trip — its locations
    [trip]/[location]/page.tsx # a location — its holidays
    [trip]/[location]/[holiday]/page.tsx  # full holiday detail
  components/                  # UI (cards, badges, breadcrumbs, price breakdown)
  content/                     # types.ts + trips.ts (the data)
  lib/                         # pricing + helpers
```
