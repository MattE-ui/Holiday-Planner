import { CircleCheck } from "lucide-react";
import { voteLocationAction, voteStayAction } from "@/lib/social-actions";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Family voting controls — server components; each button is a one-field form
// bound to a server action, so they work before hydration. Tallies always
// pair names with the mark (never colour alone).
// ---------------------------------------------------------------------------

/** Small stacked initial circles for everyone who picked something. */
export function VoterChips({ names, light }: { names: string[]; light?: boolean }) {
  if (names.length === 0) return null;
  const shown = names.slice(0, 4);
  return (
    <span className="inline-flex items-center gap-1.5" title={names.join(", ")}>
      <span className="flex -space-x-1.5">
        {shown.map((n) => (
          <span
            key={n}
            className={cn(
              "flex h-[22px] w-[22px] items-center justify-center rounded-full border text-[11px] font-bold",
              light
                ? "border-white/60 bg-white/25 text-white backdrop-blur-sm"
                : "border-card bg-accent text-accent-foreground",
            )}
          >
            {n[0]?.toUpperCase()}
          </span>
        ))}
      </span>
      <span className={cn("text-[12.5px] font-medium", light ? "text-white/90" : "text-muted-foreground")}>
        {formatNames(names)}
      </span>
    </span>
  );
}

function formatNames(names: string[]): string {
  if (names.length === 1) return `${names[0]}'s pick`;
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names[0]}, ${names[1]} +${names.length - 2}`;
}

/** "My pick" toggle for a stay within its location. `voters` = names who
 *  picked THIS stay; `member` = who's looking on this device. */
export function StayPickControl({
  tripSlug,
  locationSlug,
  holidaySlug,
  path,
  member,
  voters,
  small,
}: {
  tripSlug: string;
  locationSlug: string;
  holidaySlug: string;
  path: string;
  member?: string;
  voters: string[];
  small?: boolean;
}) {
  const mine = member != null && voters.includes(member);
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <VoterChips names={voters} />
      {member && (
        <form action={voteStayAction.bind(null, tripSlug, locationSlug, mine ? null : holidaySlug, path)}>
          <PickButton mine={mine} small={small}>
            {mine ? "Your pick" : "My pick"}
          </PickButton>
        </form>
      )}
    </div>
  );
}

/** "My pick" toggle for a location, shown on the trip page's photo bands. */
export function LocationPickControl({
  tripSlug,
  locationSlug,
  path,
  member,
  voters,
}: {
  tripSlug: string;
  locationSlug: string;
  path: string;
  member?: string;
  voters: string[];
}) {
  const mine = member != null && voters.includes(member);
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <VoterChips names={voters} light />
      {member && (
        <form action={voteLocationAction.bind(null, tripSlug, mine ? null : locationSlug, path)}>
          <button
            type="submit"
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-[12.5px] font-bold transition-colors",
              mine
                ? "border-white bg-white text-primary"
                : "border-white/[0.45] bg-white/[0.12] text-white backdrop-blur-sm hover:bg-white/[0.22]",
            )}
          >
            <CircleCheck className={cn("h-[15px] w-[15px]", mine && "fill-primary text-white")} aria-hidden />
            {mine ? "Your pick" : "My pick for the trip"}
          </button>
        </form>
      )}
    </div>
  );
}

function PickButton({
  mine,
  small,
  children,
}: {
  mine: boolean;
  small?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold transition-colors",
        small ? "h-8 px-3 text-[12px]" : "h-9 px-3.5 text-[12.5px]",
        mine
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-card text-primary hover:bg-muted",
      )}
    >
      <CircleCheck className={cn(small ? "h-3.5 w-3.5" : "h-[15px] w-[15px]")} aria-hidden />
      {children}
    </button>
  );
}
