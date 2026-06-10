import type { CostLine, Holiday, Trip } from "@/content/types";

export interface PriceBreakdown {
  lines: CostLine[];
  /** Sum of all confirmed (non-null) amounts. */
  knownTotal: number;
  /** Labels of lines still awaiting a figure. */
  pending: string[];
  /** True when every line has a confirmed amount. */
  complete: boolean;
  perPerson: number | null;
}

/**
 * Builds a unified price breakdown for a holiday: accommodation + flights +
 * car hire + transfers + any extra costs. Lines without a figure are tracked
 * as "pending" so the UI can show what's still to confirm.
 */
export function buildBreakdown(holiday: Holiday, travellers = 4): PriceBreakdown {
  const lines: CostLine[] = [];

  lines.push({
    label: "Accommodation",
    detail: holiday.dates
      ? `${holiday.nights ?? ""} nights · ${holiday.dates}`.trim()
      : holiday.nights
        ? `${holiday.nights} nights`
        : undefined,
    amount: holiday.accommodationTotal ?? null,
  });

  if (holiday.flights && holiday.flights.length > 0) {
    holiday.flights.forEach((f) => {
      lines.push({
        label: "Flights",
        detail: [f.airport, f.airline, f.outDate && f.backDate ? `${f.outDate}–${f.backDate}` : undefined]
          .filter(Boolean)
          .join(" · "),
        amount: f.price ?? null,
      });
    });
  } else {
    lines.push({ label: "Flights", detail: "Not added yet", amount: null });
  }

  if (holiday.carHire) {
    lines.push({
      label: "Car hire",
      detail: [holiday.carHire.provider, holiday.carHire.vehicle, holiday.carHire.days ? `${holiday.carHire.days} days` : undefined]
        .filter(Boolean)
        .join(" · ") || undefined,
      amount: holiday.carHire.price ?? null,
    });
  } else {
    lines.push({ label: "Car hire", detail: "Optional / not added yet", amount: null });
  }

  if (holiday.transfers) {
    lines.push({
      label: "Airport transfers",
      detail: holiday.transfers.detail,
      amount: holiday.transfers.amount ?? null,
    });
  }

  if (holiday.extraCosts) {
    holiday.extraCosts.forEach((c) => lines.push(c));
  }

  const knownTotal = lines.reduce((sum, l) => sum + (l.amount ?? 0), 0);
  const pending = lines.filter((l) => l.amount == null).map((l) => l.label);
  const complete = pending.length === 0;
  const perPerson = travellers > 0 ? knownTotal / travellers : null;

  return { lines, knownTotal, pending, complete, perPerson };
}

export function tripTravellers(trip: Trip): number {
  return trip.travellers ?? 4;
}
