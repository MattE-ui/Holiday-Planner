import { readTrips } from "@/lib/store";
import { isOwner } from "@/lib/member";
import { AtelierLanding, type DeckLocation } from "@/components/atelier-landing";
import { Welcome } from "@/components/welcome";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const trips = await readTrips();
  const owner = isOwner();

  // Fresh canvas — no trips yet.
  if (trips.length === 0) return <Welcome owner={owner} />;

  // The home page lands on the in-progress (featured) trip; the rest are "also
  // planning". Everything is derived from the content model and handed to the
  // client deck as plain serialisable props.
  const featured = trips[0];
  const travellers = featured.travellers ?? 1;

  const locations: DeckLocation[] = featured.locations.map((loc) => {
    const prices = loc.holidays
      .map((h) => h.accommodationTotal)
      .filter((n): n is number => typeof n === "number");
    return {
      slug: loc.slug,
      name: loc.name,
      country: loc.country,
      image: loc.image ?? loc.holidays.find((h) => h.image)?.image,
      imageAlt: loc.imageAlt,
      blurb: loc.blurb ?? "",
      // "From" price = cheapest costed holiday here; null stays honest as "Researching".
      from: prices.length ? Math.min(...prices) : null,
    };
  });

  const fromPrices = locations.map((l) => l.from).filter((n): n is number => n != null);
  const fromPrice = fromPrices.length ? Math.min(...fromPrices) : null;
  const perPerson = fromPrice != null ? Math.round(fromPrice / travellers) : null;

  // A data-driven status label, rather than a schema field.
  const statuses = featured.locations.flatMap((loc) => loc.holidays.map((h) => h.status));
  const status = statuses.includes("booked")
    ? "Booked"
    : statuses.some((s) => s === "shortlisted" || s === "favourite")
      ? "Deciding together"
      : "Just an idea";

  return (
    <AtelierLanding
      tripSlug={featured.slug}
      tripName={featured.name}
      tripWindow={featured.window}
      status={status}
      locations={locations}
      fromPrice={fromPrice}
      perPerson={perPerson}
      upcomingCount={trips.length - 1}
      owner={owner}
    />
  );
}
