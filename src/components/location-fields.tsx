import type { Location } from "@/content/types";
import { Field, Input, TextArea } from "@/components/form";
import { ImagePicker } from "@/components/image-picker";

/**
 * The location form's fields, shared by the add and edit pages. Server-safe;
 * the ImagePicker inside is the only client island.
 */
export function LocationFields({ location }: { location?: Location }) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <Input name="name" required autoFocus={!location} defaultValue={location?.name} placeholder="e.g. Kalkan" />
        </Field>
        <Field label="Country">
          <Input name="country" required defaultValue={location?.country} placeholder="e.g. Turkey" />
        </Field>
        <Field label="Blurb" className="sm:col-span-2" hint="A line or two on why it's a contender.">
          <TextArea name="blurb" defaultValue={location?.blurb} />
        </Field>
        <Field label="Airport & transfer" hint="e.g. Dalaman (DLM) · ~1½–2 hr transfer">
          <Input name="airport" defaultValue={location?.airport} />
        </Field>
        <Field label="Flight time" hint="e.g. ~4h15">
          <Input name="flightTime" defaultValue={location?.flightTime} />
        </Field>
        <Field label="Flight summary" className="sm:col-span-2" hint="Which airlines fly from where.">
          <TextArea name="flightSummary" rows={2} defaultValue={location?.flightSummary} />
        </Field>
      </div>

      <h2 className="mt-9 font-display text-[22px] font-semibold tracking-[-0.01em] text-foreground">
        Cover photo
      </h2>
      <p className="mt-1 text-[13.5px] text-muted-foreground">
        The full-bleed hero on the trip page and landing deck — let the place sell itself.
      </p>
      <div className="mt-4">
        <ImagePicker
          initialQuery={
            location ? [location.name, location.country].filter(Boolean).join(" ") : undefined
          }
          defaultImage={location?.image}
          defaultAlt={location?.imageAlt}
        />
      </div>

      <h2 className="mt-9 font-display text-[22px] font-semibold tracking-[-0.01em] text-foreground">
        Season at trip time
      </h2>
      <p className="mt-1 text-[13.5px] text-muted-foreground">
        Typical figures for when you&rsquo;d travel — all three needed for the season row to show.
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Field label="Day high (°C)">
          <Input name="seasonHigh" type="number" defaultValue={location?.season?.high} />
        </Field>
        <Field label="Sea temp (°C)">
          <Input name="seasonSea" type="number" defaultValue={location?.season?.sea} />
        </Field>
        <Field label="Sun hours / day">
          <Input name="seasonSun" type="number" defaultValue={location?.season?.sun} />
        </Field>
        <Field label="Season note" className="sm:col-span-3" hint="One honest line — warmth, sea, how late flights run.">
          <Input name="seasonNote" defaultValue={location?.seasonNote} />
        </Field>
      </div>
    </>
  );
}
