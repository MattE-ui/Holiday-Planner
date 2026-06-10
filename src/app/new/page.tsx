import { createTrip } from "@/lib/actions";
import { Field, FormPage, Input } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";

export const dynamic = "force-dynamic";

export const metadata = { title: "New trip · Holiday Planner" };

export default function NewTripPage() {
  return (
    <FormPage
      backHref="/"
      backLabel="Home"
      title="Start a new trip"
      lede="A trip is the umbrella you compare under — “Autumn Holiday 2026”, say. You'll add candidate locations next, then stays within each."
    >
      <form action={createTrip}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Trip name" className="sm:col-span-2">
            <Input name="name" required autoFocus placeholder="e.g. Autumn Holiday 2026" />
          </Field>
          <Field label="When (roughly)" hint="Free text — narrow it down later.">
            <Input name="window" placeholder="e.g. Late September – October 2026" />
          </Field>
          <Field label="Travellers" hint="Used for the per-person figures.">
            <Input name="travellers" type="number" min={1} placeholder="4" />
          </Field>
          <Field label="Subtitle" className="sm:col-span-2" hint="Shown under the trip name — optional.">
            <Input name="subtitle" placeholder="e.g. Family trip · 4 adults" />
          </Field>
        </div>
        <div className="mt-8 border-t pt-6">
          <SubmitButton>Create trip</SubmitButton>
        </div>
      </form>
    </FormPage>
  );
}
