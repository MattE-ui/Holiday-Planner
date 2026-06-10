"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, X } from "lucide-react";
import type { CostLine, Flight, Holiday } from "@/content/types";
import { CheckboxField, Field, FormSection, Input, Select, TextArea } from "@/components/form";
import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";

/**
 * The full create/edit form for a stay. Scalar fields are plain inputs read
 * from FormData server-side; flights and extra costs are dynamic rows managed
 * here and serialised into hidden JSON fields. Leave any cost blank and it
 * shows honestly as "to confirm" — nothing is required except a name.
 */
export function StayForm({
  action,
  initial,
  cancelHref,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  initial?: Holiday;
  cancelHref: string;
  submitLabel: string;
}) {
  const [flights, setFlights] = useState<Flight[]>(initial?.flights ?? []);
  const [extraCosts, setExtraCosts] = useState<CostLine[]>(initial?.extraCosts ?? []);

  const a = initial?.accommodation;
  const photoLines = [initial?.image, ...(initial?.photos ?? [])].filter(Boolean).join("\n");

  return (
    <form action={action}>
      <input type="hidden" name="flightsJson" value={JSON.stringify(flights)} />
      <input type="hidden" name="extraCostsJson" value={JSON.stringify(extraCosts)} />

      <FormSection title="The basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" className="sm:col-span-2">
            <Input name="name" required defaultValue={initial?.name} placeholder="e.g. Villa Mavi" />
          </Field>
          <Field label="Summary" className="sm:col-span-2" hint="One or two sentences on why it's in the running.">
            <TextArea name="summary" defaultValue={initial?.summary} />
          </Field>
          <Field label="Status">
            <Select name="status" defaultValue={initial?.status ?? "idea"}>
              <option value="idea">Researching</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="favourite">Favourite</option>
              <option value="booked">Booked</option>
            </Select>
          </Field>
          <Field label="Guest rating" hint='As shown on the listing, e.g. "9.3 / 10".'>
            <Input name="rating" defaultValue={initial?.rating} placeholder="9.3 / 10" />
          </Field>
          <Field label="Listing link" className="sm:col-span-2">
            <Input name="listingUrl" type="url" defaultValue={initial?.listingUrl} placeholder="https://www.booking.com/…" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Photos" hint="Paste image URLs, one per line — the first becomes the cover.">
        <div className="grid gap-4">
          <Field label="Photo URLs">
            <TextArea name="photos" rows={4} defaultValue={photoLines} placeholder={"https://…/photo-1.jpg\nhttps://…/photo-2.jpg"} />
          </Field>
          <Field label="Cover alt text" hint="Describe the scene — it's part of the voice.">
            <Input name="imageAlt" defaultValue={initial?.imageAlt} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="The accommodation">
        <div className="grid gap-4 sm:grid-cols-4">
          <Field label="Bedrooms">
            <Input name="bedrooms" type="number" min={0} defaultValue={a?.bedrooms} />
          </Field>
          <Field label="Sleeps">
            <Input name="sleeps" type="number" min={0} defaultValue={a?.sleeps} />
          </Field>
          <Field label="Bathrooms">
            <Input name="bathrooms" type="number" min={0} step="0.5" defaultValue={a?.bathrooms} />
          </Field>
          <Field label="Size (sq ft)">
            <Input name="sizeSqft" type="number" min={0} defaultValue={a?.sizeSqft} />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2.5">
          <CheckboxField name="privatePool" label="Private pool" defaultChecked={a?.privatePool} />
          <CheckboxField name="airCon" label="Air conditioning" defaultChecked={a?.airCon} />
          <CheckboxField name="modern" label="Modern / recently renovated" defaultChecked={a?.modern} />
        </div>
        <div className="mt-4 grid gap-4">
          <Field label="Walk to amenities" hint="Free text — e.g. “~10 min to town; 14 min to the beach”.">
            <Input name="walkToAmenities" defaultValue={a?.walkToAmenities} />
          </Field>
          <Field label="What's included" hint="One per line — pool, parking, WiFi, BBQ…">
            <TextArea name="extras" rows={4} defaultValue={a?.extras?.join("\n")} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Stay & price" hint="Leave any figure blank and it shows honestly as “to confirm”.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Nights">
            <Input name="nights" type="number" min={1} defaultValue={initial?.nights} />
          </Field>
          <Field label="Dates" hint="e.g. 4–9 Oct 2026">
            <Input name="dates" defaultValue={initial?.dates} />
          </Field>
          <Field label="Accommodation total (£)">
            <Input
              name="accommodationTotal"
              inputMode="decimal"
              defaultValue={initial?.accommodationTotal ?? ""}
              placeholder="party total"
            />
          </Field>
          <Field label="Rate note" className="sm:col-span-3" hint="Cancellation terms, cheaper non-refundable rate, etc.">
            <Input name="rateNote" defaultValue={initial?.rateNote} />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Where it is"
        hint="Coordinates pin the map to the exact villa — an import fills these automatically."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Address" className="sm:col-span-2">
            <Input name="address" defaultValue={initial?.address} />
          </Field>
          <Field label="Latitude">
            <Input name="lat" inputMode="decimal" defaultValue={initial?.coords?.lat} placeholder="36.2603" />
          </Field>
          <Field label="Longitude">
            <Input name="lng" inputMode="decimal" defaultValue={initial?.coords?.lng} placeholder="29.4188" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Flights">
        <div className="flex flex-col gap-3">
          {flights.map((f, i) => (
            <RowCard key={i} onRemove={() => setFlights(flights.filter((_, k) => k !== i))}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  aria-label="Departure airport"
                  placeholder="Airport — e.g. Manchester (MAN)"
                  value={f.airport}
                  onChange={(e) => setFlights(patch(flights, i, { airport: e.target.value }))}
                />
                <Input
                  aria-label="Airline"
                  placeholder="Airline"
                  value={f.airline ?? ""}
                  onChange={(e) => setFlights(patch(flights, i, { airline: e.target.value }))}
                />
                <Input
                  aria-label="Outbound date"
                  placeholder="Out — e.g. 4 Oct"
                  value={f.outDate ?? ""}
                  onChange={(e) => setFlights(patch(flights, i, { outDate: e.target.value }))}
                />
                <Input
                  aria-label="Return date"
                  placeholder="Back — e.g. 9 Oct"
                  value={f.backDate ?? ""}
                  onChange={(e) => setFlights(patch(flights, i, { backDate: e.target.value }))}
                />
                <Input
                  aria-label="Flight price for the party"
                  placeholder="Price £ (party total)"
                  inputMode="decimal"
                  value={f.price ?? ""}
                  onChange={(e) =>
                    setFlights(patch(flights, i, { price: e.target.value === "" ? null : Number(e.target.value) }))
                  }
                />
                <label className="inline-flex items-center gap-2.5 px-1 text-[14px] font-medium text-foreground">
                  <input
                    type="checkbox"
                    checked={f.bagsIncluded ?? false}
                    onChange={(e) => setFlights(patch(flights, i, { bagsIncluded: e.target.checked }))}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  Bags included
                </label>
              </div>
            </RowCard>
          ))}
          <AddRowButton onClick={() => setFlights([...flights, { airport: "" }])}>Add a flight</AddRowButton>
        </div>
      </FormSection>

      <FormSection title="Car hire & transfers">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Car hire provider">
            <Input name="carProvider" defaultValue={initial?.carHire?.provider} />
          </Field>
          <Field label="Vehicle">
            <Input name="carVehicle" defaultValue={initial?.carHire?.vehicle} />
          </Field>
          <Field label="Days">
            <Input name="carDays" type="number" min={0} defaultValue={initial?.carHire?.days} />
          </Field>
          <Field label="Car hire price (£)">
            <Input name="carPrice" inputMode="decimal" defaultValue={initial?.carHire?.price ?? ""} />
          </Field>
          <Field label="Car hire notes" className="sm:col-span-2">
            <Input name="carNotes" defaultValue={initial?.carHire?.notes} />
          </Field>
          <Field label="Airport transfers" hint="e.g. private transfer, 2 cars">
            <Input name="transferDetail" defaultValue={initial?.transfers?.detail} />
          </Field>
          <Field label="Transfers price (£)">
            <Input name="transferAmount" inputMode="decimal" defaultValue={initial?.transfers?.amount ?? ""} />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Other costs" hint="Insurance, resort fees, anything else to fold into the total.">
        <div className="flex flex-col gap-3">
          {extraCosts.map((c, i) => (
            <RowCard key={i} onRemove={() => setExtraCosts(extraCosts.filter((_, k) => k !== i))}>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input
                  aria-label="Cost label"
                  placeholder="Label — e.g. Travel insurance"
                  value={c.label}
                  onChange={(e) => setExtraCosts(patch(extraCosts, i, { label: e.target.value }))}
                />
                <Input
                  aria-label="Cost detail"
                  placeholder="Detail (optional)"
                  value={c.detail ?? ""}
                  onChange={(e) => setExtraCosts(patch(extraCosts, i, { detail: e.target.value }))}
                />
                <Input
                  aria-label="Cost amount"
                  placeholder="£ (blank = to confirm)"
                  inputMode="decimal"
                  value={c.amount ?? ""}
                  onChange={(e) =>
                    setExtraCosts(patch(extraCosts, i, { amount: e.target.value === "" ? null : Number(e.target.value) }))
                  }
                />
              </div>
            </RowCard>
          ))}
          <AddRowButton onClick={() => setExtraCosts([...extraCosts, { label: "", amount: null }])}>
            Add a cost
          </AddRowButton>
        </div>
      </FormSection>

      <FormSection title="Pros, cons & notes">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Why we're keen" hint="One per line.">
            <TextArea name="pros" rows={4} defaultValue={initial?.pros?.join("\n")} />
          </Field>
          <Field label="Worth noting" hint="One per line.">
            <TextArea name="cons" rows={4} defaultValue={initial?.cons?.join("\n")} />
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <TextArea name="notes" defaultValue={initial?.notes} />
          </Field>
        </div>
      </FormSection>

      <div className="mt-10 flex flex-wrap items-center gap-4 border-t pt-6">
        <SubmitButton>{submitLabel}</SubmitButton>
        <Link
          href={cancelHref}
          className="inline-flex h-[50px] items-center rounded-full border border-input px-6 text-[15px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

function patch<T>(list: T[], i: number, p: Partial<T>): T[] {
  return list.map((item, k) => (k === i ? { ...item, ...p } : item));
}

function RowCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative rounded-[14px] border bg-muted/30 p-4 pr-12">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove row"
        className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddRowButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-1.5 self-start rounded-full border border-dashed border-input px-5 text-[13.5px] font-semibold text-primary transition-colors hover:border-primary/60 hover:bg-muted/50",
      )}
    >
      <Plus className="h-[15px] w-[15px]" /> {children}
    </button>
  );
}
