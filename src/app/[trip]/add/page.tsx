import { notFound } from "next/navigation";
import { getTrip } from "@/lib/store";
import { createLocation } from "@/lib/actions";
import { Field, FormPage, Input, TextArea } from "@/components/form";
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
      lede={`A place in the running for ${trip.name} — only the name and country are needed; the season and flight details enrich the comparison when you have them.`}
    >
      <form action={createLocation.bind(null, trip.slug)}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name">
            <Input name="name" required autoFocus placeholder="e.g. Kalkan" />
          </Field>
          <Field label="Country">
            <Input name="country" required placeholder="e.g. Turkey" />
          </Field>
          <Field label="Blurb" className="sm:col-span-2" hint="A line or two on why it's a contender.">
            <TextArea name="blurb" />
          </Field>
          <Field label="Airport & transfer" hint="e.g. Dalaman (DLM) · ~1½–2 hr transfer">
            <Input name="airport" />
          </Field>
          <Field label="Flight time" hint="e.g. ~4h15">
            <Input name="flightTime" />
          </Field>
          <Field label="Flight summary" className="sm:col-span-2" hint="Which airlines fly from where.">
            <TextArea name="flightSummary" rows={2} />
          </Field>
          <Field label="Cover photo URL" className="sm:col-span-2" hint="Optional — a gradient stands in until you add one.">
            <Input name="image" type="url" />
          </Field>
          <Field label="Photo alt text" className="sm:col-span-2">
            <Input name="imageAlt" />
          </Field>
        </div>

        <h2 className="mt-9 font-display text-[22px] font-semibold tracking-[-0.01em] text-foreground">
          Season at trip time
        </h2>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Typical figures for when you&rsquo;d travel — all three needed for the season row to show.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Day high (°C)">
            <Input name="seasonHigh" type="number" />
          </Field>
          <Field label="Sea temp (°C)">
            <Input name="seasonSea" type="number" />
          </Field>
          <Field label="Sun hours / day">
            <Input name="seasonSun" type="number" />
          </Field>
          <Field label="Season note" className="sm:col-span-3" hint="One honest line — warmth, sea, how late flights run.">
            <Input name="seasonNote" />
          </Field>
        </div>

        <div className="mt-8 border-t pt-6">
          <SubmitButton>Add location</SubmitButton>
        </div>
      </form>
    </FormPage>
  );
}
