import { notFound } from "next/navigation";
import { getLocation } from "@/lib/store";
import { deleteLocation, updateLocation } from "@/lib/actions";
import { FormPage } from "@/components/form";
import { LocationFields } from "@/components/location-fields";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";
import { ownerGuard } from "@/lib/member";

export const dynamic = "force-dynamic";

export default async function EditLocationPage({
  params,
}: {
  params: { trip: string; location: string };
}) {
  ownerGuard(`/${params.trip}/${params.location}`);
  const { trip, location } = await getLocation(params.trip, params.location);
  if (!trip || !location) notFound();

  return (
    <FormPage
      backHref={`/${trip.slug}/${location.slug}`}
      backLabel={`Staying in ${location.name}`}
      title={`Edit ${location.name}`}
      lede="The cover photo is the full-bleed hero on the trip page and the landing deck."
    >
      <form action={updateLocation.bind(null, trip.slug, location.slug)}>
        <LocationFields location={location} />
        <div className="mt-8 border-t pt-6">
          <SubmitButton>Save changes</SubmitButton>
        </div>
      </form>
      <div className="mt-10 rounded-[14px] border border-danger/25 bg-danger/[0.03] p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Remove this location</h2>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Removes {location.name} and its {location.holidays.length} stay
          {location.holidays.length === 1 ? "" : "s"} from {trip.name}. There&rsquo;s no undo.
        </p>
        <DeleteButton
          action={deleteLocation.bind(null, trip.slug, location.slug)}
          confirmText={`Remove ${location.name} and all its stays?`}
          className="mt-4"
        >
          Remove location
        </DeleteButton>
      </div>
    </FormPage>
  );
}
