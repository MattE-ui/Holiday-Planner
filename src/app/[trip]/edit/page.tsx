import { notFound } from "next/navigation";
import { getTrip } from "@/lib/store";
import { deleteTrip, updateTrip } from "@/lib/actions";
import { Field, FormPage, Input } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { DeleteButton } from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function EditTripPage({ params }: { params: { trip: string } }) {
  const trip = await getTrip(params.trip);
  if (!trip) notFound();

  return (
    <FormPage backHref={`/${trip.slug}`} backLabel={trip.name} title="Edit trip">
      <form action={updateTrip.bind(null, trip.slug)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Trip name" className="sm:col-span-2">
            <Input name="name" required defaultValue={trip.name} />
          </Field>
          <Field label="When (roughly)">
            <Input name="window" defaultValue={trip.window} />
          </Field>
          <Field label="Travellers">
            <Input name="travellers" type="number" min={1} defaultValue={trip.travellers} />
          </Field>
          <Field label="Subtitle" className="sm:col-span-2">
            <Input name="subtitle" defaultValue={trip.subtitle} />
          </Field>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
          <SubmitButton>Save changes</SubmitButton>
        </div>
      </form>
      <div className="mt-10 rounded-[14px] border border-danger/25 bg-danger/[0.03] p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Delete this trip</h2>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Removes {trip.name} with its {trip.locations.length} location
          {trip.locations.length === 1 ? "" : "s"} and every stay inside. There&rsquo;s no undo.
        </p>
        <DeleteButton
          action={deleteTrip.bind(null, trip.slug)}
          confirmText={`Delete "${trip.name}" and everything in it?`}
          className="mt-4"
        >
          Delete trip
        </DeleteButton>
      </div>
    </FormPage>
  );
}
