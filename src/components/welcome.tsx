import Link from "next/link";
import { ArrowRight, Link2, MapPin, Plane, PlusCircle } from "lucide-react";

/**
 * The fresh-canvas welcome screen, shown on / when no trips exist yet. Two
 * ways in: start a trip by hand, or paste a Booking.com link and let the
 * import build the stay, location and details for you. Family members
 * (non-owners) get a calm holding note instead of the create cards.
 */
export function Welcome({ owner }: { owner: boolean }) {
  return (
    <div className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[hsl(198_36%_9%)] text-white">
      {/* Quiet brand gradient backdrop — imagery arrives with the first trip. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_10%,hsl(190_45%_22%)_0%,hsl(198_38%_12%)_55%,hsl(198_36%_8%)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[40vh] bg-[linear-gradient(to_top,rgba(8,28,34,0.85),transparent)]"
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/50 bg-white/[0.16] text-white backdrop-blur-sm">
            <Plane className="h-[15px] w-[15px]" />
          </span>
          <span className="whitespace-nowrap font-display text-[18px] font-semibold tracking-[-0.01em]">
            Holiday Planner
          </span>
        </div>
        <span className="hidden text-sm text-white/70 sm:block">Compare. Decide. Book.</span>
      </div>

      {/* Centre */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <p className="text-[13px] font-bold uppercase tracking-[0.14em] text-white/60">
          A calm place to plan
        </p>
        <h1 className="mt-4 max-w-[640px] font-display text-[clamp(2.5rem,6vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.025em] [text-shadow:0_2px_30px_rgba(0,0,0,0.3)]">
          Where shall we go?
        </h1>
        <p className="mt-5 max-w-[480px] text-[16.5px] leading-[1.6] text-white/[0.78] [text-wrap:pretty]">
          Gather the holidays you&rsquo;re weighing up into one place — locations, villas, flights
          and honest totals — and decide together, without twelve browser tabs.
        </p>

        {!owner && (
          <p className="mt-9 max-w-[420px] text-[15px] leading-[1.6] text-white/[0.66]">
            Nothing has been planned yet — once the first trip is added, the comparison
            starts here.
          </p>
        )}

        {owner && (
        <div className="mt-10 grid w-full max-w-[680px] gap-4 sm:grid-cols-2">
          <Link
            href="/import"
            className="group rounded-[20px] border border-white/[0.22] bg-white/[0.08] p-6 text-left backdrop-blur-md transition-colors hover:bg-white/[0.14]"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-primary">
              <Link2 className="h-5 w-5" />
            </span>
            <div className="mt-4 font-display text-[20px] font-semibold">Paste a Booking.com link</div>
            <p className="mt-1.5 text-[14px] leading-[1.5] text-white/[0.72]">
              The listing becomes a full stay — photos, specs, the exact spot on the map — ready to
              file under a trip.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold text-white">
              Import a stay
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>

          <Link
            href="/new"
            className="group rounded-[20px] border border-white/[0.22] bg-white/[0.08] p-6 text-left backdrop-blur-md transition-colors hover:bg-white/[0.14]"
          >
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-white/10 text-white">
              <PlusCircle className="h-5 w-5" />
            </span>
            <div className="mt-4 font-display text-[20px] font-semibold">Start a trip by hand</div>
            <p className="mt-1.5 text-[14px] leading-[1.5] text-white/[0.72]">
              Name the trip, add the locations you&rsquo;re considering, then build up each stay as
              your research comes together.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold text-white">
              New trip
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
        )}

        <p className="mt-8 inline-flex items-center gap-2 text-[13px] text-white/[0.55]">
          <MapPin className="h-3.5 w-3.5" aria-hidden />
          Trips → locations → stays, each with an honest price breakdown.
        </p>
      </div>
    </div>
  );
}
