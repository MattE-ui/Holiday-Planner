import { notFound } from "next/navigation";
import { getTrip } from "@/lib/store";
import { createLocation } from "@/lib/actions";
import { FormPage } from "@/components/form";
import { LocationFields } from "@/components/location-fields";
import { SubmitButton } from "@/components/submit-button";

export const dynamic = "force-dynamic";

export default async function AddLocationPage({ params }: { params: { trip: string } }) {
  const trip = await getTrip(params.trip);
  if (!trip) notFound();

  return (
    <FormPage
      backHref={`/${trip.slug}`}
      backLabel={trip.name}
      title="Add a location"
      lede={`A place in the running for ${trip.name} — only the name and country are needed; the photo, season and flight details enrich the comparison when you have them.`}
    >
      <form action={createLocation.bind(null, trip.slug)}>
        <LocationFields />
        <div className="mt-8 border-t pt-6">
          <SubmitButton>Add location</SubmitButton>
        </div>
      </form>
    </FormPage>
  );
}
