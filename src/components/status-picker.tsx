"use client";

import { useTransition } from "react";
import { cn } from "@/lib/utils";
import type { HolidayStatus } from "@/content/types";

const OPTIONS: { value: HolidayStatus; label: string }[] = [
  { value: "idea", label: "Researching" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "favourite", label: "Favourite" },
  { value: "booked", label: "Booked" },
];

/**
 * The stay's status as a row of pills — tap to move it between Researching,
 * Shortlisted, Favourite and Booked. `action` is the bound setStayStatus
 * server action.
 */
export function StatusPicker({
  status,
  action,
}: {
  status: HolidayStatus;
  action: (status: HolidayStatus) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <div role="radiogroup" aria-label="Stay status" className="flex flex-wrap gap-1.5">
      {OPTIONS.map((o) => {
        const active = o.value === status;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={pending}
            onClick={() => !active && startTransition(() => action(o.value))}
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-semibold transition-colors disabled:opacity-60",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-input bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground",
            )}
          >
            <span
              className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-white" : "bg-muted-foreground/60")}
              aria-hidden
            />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
