import { ImportWizard } from "@/components/import-wizard";
import { FormPage } from "@/components/form";
import { ownerGuard } from "@/lib/member";

export const dynamic = "force-dynamic";

export const metadata = { title: "Import a stay · Holiday Planner" };

export default function ImportPage({
  searchParams,
}: {
  searchParams: { trip?: string; location?: string };
}) {
  ownerGuard();
  return (
    <FormPage
      backHref="/"
      backLabel="Home"
      title="Import from Booking.com"
      lede="Paste a listing link and it becomes a full stay — photos, specs, the exact spot on the map. You add what only you know: dates and the price you were quoted."
    >
      <ImportWizard preselectTrip={searchParams.trip} preselectLocation={searchParams.location} />
    </FormPage>
  );
}
