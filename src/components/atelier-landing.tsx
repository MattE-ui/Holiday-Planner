"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CalendarDays, Coins, MapPin, Plane, Plus } from "lucide-react";
import { Cover } from "@/components/cover";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn, formatGBP } from "@/lib/utils";

// One serialisable card per candidate location, derived server-side in page.tsx
// from the Trip/Location content model (no schema changes).
export interface DeckLocation {
  slug: string;
  name: string;
  country: string;
  image?: string;
  imageAlt?: string;
  blurb: string;
  /** Min accommodation total across this location's holidays; null = researching. */
  from: number | null;
}

interface AtelierLandingProps {
  tripSlug: string;
  tripName: string;
  tripWindow?: string;
  /** Data-driven chip label, e.g. "Deciding together". */
  status: string;
  locations: DeckLocation[];
  fromPrice: number | null;
  perPerson: number | null;
  /** Count of other trips being planned (drives the mobile pill). */
  upcomingCount: number;
}

const EASE = "cubic-bezier(0.22,1,0.36,1)";

/**
 * "Atelier" landing — a cinematic, image-led hero that re-skins to whichever
 * candidate location is brought forward from a tactile deck of postcards.
 * `active` is the single source of truth: it drives the hero cross-fade, the
 * "Now showing" line, the deck transforms and the counter. Hover only previews;
 * click / arrows / dots select; the active card links into the location.
 */
export function AtelierLanding({
  tripSlug,
  tripName,
  tripWindow,
  status,
  locations,
  fromPrice,
  perPerson,
  upcomingCount,
}: AtelierLandingProps) {
  const [active, setActive] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const activeLoc = locations[active];

  // A trip with no locations yet — keep the cinematic register, invite the
  // first location instead of rendering an empty deck.
  if (!activeLoc) {
    return (
      <div className="atelier-root relative flex min-h-[100svh] w-full flex-col overflow-hidden bg-[hsl(198_36%_9%)] text-white">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(120%_90%_at_70%_10%,hsl(190_45%_22%)_0%,hsl(198_38%_12%)_55%,hsl(198_36%_8%)_100%)]"
        />
        <div className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
          <Wordmark />
          <Link
            href="/new"
            className="inline-flex h-[38px] items-center gap-2 rounded-full border border-white/45 bg-white/10 px-4 text-[13.5px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <Plus className="h-[15px] w-[15px]" /> Add a trip
          </Link>
        </div>
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-24 text-center">
          <StatusChip label={status} />
          <h1 className="mt-5 max-w-[640px] font-display text-[clamp(2.25rem,6vw,4rem)] font-semibold leading-[1.02] tracking-[-0.025em]">
            {tripName}
          </h1>
          {tripWindow && (
            <p className="mt-4 inline-flex items-center gap-2 text-[15px] text-white/[0.78]">
              <CalendarDays className="h-[17px] w-[17px]" /> {tripWindow}
            </p>
          )}
          <p className="mt-5 max-w-[440px] text-[15.5px] leading-[1.6] text-white/[0.72]">
            No locations in the running yet — add the first place you&rsquo;re considering and the
            comparison starts here.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${tripSlug}/add`}
              className="inline-flex h-[52px] items-center gap-2.5 rounded-full bg-white px-[26px] text-[16px] font-bold text-primary shadow-[0_12px_30px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <MapPin className="h-[18px] w-[18px]" /> Add a location
            </Link>
            <Link
              href="/import"
              className="inline-flex h-[52px] items-center gap-2.5 rounded-full border border-white/40 bg-white/10 px-[26px] text-[15px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              Import from Booking.com
            </Link>
          </div>
          {upcomingCount > 0 && (
            <Link href="/trips" className="mt-8 text-[13.5px] font-semibold text-white/70 hover:text-white">
              All trips · {upcomingCount + 1}
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Mobile: select AND smooth-scroll the card to centre (never scrollIntoView).
  const pick = (i: number) => {
    setActive(i);
    const rail = railRef.current;
    const card = rail?.children[i] as HTMLElement | undefined;
    if (rail && card) {
      rail.scrollTo({
        left: card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2,
        behavior: reduceMotion ? "auto" : "smooth",
      });
    }
  };

  // Arrow keys drive the deck whenever focus is inside it (cards, controls,
  // dots). Home/End jump to the ends, per the standard carousel pattern.
  const onDeckKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      pick(Math.max(0, active - 1));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      pick(Math.min(locations.length - 1, active + 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      pick(0);
    } else if (e.key === "End") {
      e.preventDefault();
      pick(locations.length - 1);
    }
  };

  return (
    <div className="atelier-root relative min-h-[100svh] w-full overflow-hidden bg-[hsl(198_36%_9%)] text-white">
      {/* Hero background: every candidate stacked, cross-faded by opacity. */}
      {locations.map((loc, i) => (
        <div
          key={loc.slug}
          // Inactive layers are opacity:0 but would still sit in the a11y
          // tree, exposing every location's image at once — hide them.
          aria-hidden={active !== i}
          className="absolute inset-0 transition-opacity duration-[800ms]"
          style={{ opacity: active === i ? 1 : 0, transitionTimingFunction: EASE }}
        >
          <HeroFill loc={loc} active={active === i} priority={i === 0} />
        </div>
      ))}

      {/* Scrims: diagonal for the title side, a top band for the chrome. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(105deg,rgba(8,28,34,0.82)_0%,rgba(8,28,34,0.5)_34%,rgba(8,28,34,0.12)_60%,rgba(8,28,34,0.34)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[120px] bg-[linear-gradient(to_bottom,rgba(8,28,34,0.5),transparent)]"
      />

      {/* ── Desktop top bar ─────────────────────────────────────────────── */}
      <div className="absolute inset-x-0 top-0 z-40 hidden items-center justify-between px-10 py-[22px] lg:flex">
        <Wordmark />
        <div className="flex items-center gap-3">
          {upcomingCount > 0 && (
            <Link
              href="/trips"
              className="inline-flex h-[38px] items-center gap-2 rounded-full px-4 text-[13.5px] font-semibold text-white/85 transition-colors hover:text-white"
            >
              All trips · {upcomingCount + 1}
            </Link>
          )}
          <Link
            href="/new"
            className="inline-flex h-[38px] items-center gap-2 rounded-full border border-white/45 bg-white/10 px-4 text-[13.5px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
          >
            <Plus className="h-[15px] w-[15px]" /> Add a trip
          </Link>
        </div>
      </div>

      {/* ── Desktop title block (lower-left) ────────────────────────────── */}
      <div className="atelier-rise absolute bottom-12 left-10 z-[35] hidden max-w-[min(560px,42vw)] lg:block">
        <div className="mb-4">
          <StatusChip label={status} />
        </div>
        <h1 className="font-display text-[clamp(2.75rem,5.2vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.025em] [text-shadow:0_2px_30px_rgba(0,0,0,0.34)] [text-wrap:balance]">
          {tripName}
        </h1>
        <div className="mt-[18px] flex flex-wrap items-center gap-x-[18px] gap-y-2 text-[15px] text-white/90">
          {tripWindow && (
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="h-[17px] w-[17px]" />
              {tripWindow}
            </span>
          )}
          <span className="h-1 w-1 rounded-full bg-white/50" />
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-[17px] w-[17px]" />
            {locations.length} locations
          </span>
          {fromPrice != null && (
            <>
              <span className="h-1 w-1 rounded-full bg-white/50" />
              <span className="inline-flex items-center gap-2">
                <Coins className="h-[17px] w-[17px]" />
                From {formatGBP(fromPrice)}
                {perPerson != null && <> · ~{formatGBP(perPerson)}pp</>}
              </span>
            </>
          )}
        </div>
        <p aria-live="polite" aria-atomic className="mt-5 max-w-[440px] text-[13.5px] text-white/[0.78]">
          <span className="text-[11.5px] font-semibold uppercase tracking-[0.06em] text-white/[0.62]">
            Now showing{" "}
          </span>
          <span className="font-display text-[17px] italic">
            {activeLoc.name}, {activeLoc.country}
          </span>
          {activeLoc.blurb && <span className="text-white/[0.62]"> — {activeLoc.blurb}</span>}
        </p>
        <Link
          href={`/${tripSlug}`}
          className="mt-6 inline-flex h-[52px] items-center gap-2.5 rounded-full bg-white px-[26px] text-[16px] font-bold text-primary shadow-[0_12px_30px_rgba(0,0,0,0.3)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.4)]"
        >
          Open this trip <ArrowRight className="h-[19px] w-[19px]" />
        </Link>
      </div>

      {/* ── Desktop deck: centered carousel ──────────────────────────────
          Width and card spread are fluid so the deck never reaches the title
          block: at 1024px the container is ~471px wide with a tighter fan;
          the full 146px spread returns by ~1281px and the full 720px width
          by ~1565px. */}
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Locations in the running"
        onKeyDown={onDeckKeyDown}
        className="absolute bottom-[10px] right-10 z-30 hidden h-[300px] w-[min(720px,46vw)] lg:block"
        style={{ "--deck-gap": "clamp(112px,11.4vw,146px)" } as React.CSSProperties}
      >
        <div className="absolute right-3 top-0 z-[110] flex items-center gap-3.5">
          <DeckControl label="Previous" disabled={active === 0} onClick={() => setActive(Math.max(0, active - 1))}>
            <ArrowLeft className="h-4 w-4" />
          </DeckControl>
          <span className="min-w-[56px] text-center text-[12px] font-bold tracking-[0.06em] text-white/90">
            {String(active + 1).padStart(2, "0")} / {String(locations.length).padStart(2, "0")}
          </span>
          <DeckControl
            label="Next"
            disabled={active === locations.length - 1}
            onClick={() => setActive(Math.min(locations.length - 1, active + 1))}
          >
            <ArrowRight className="h-4 w-4" />
          </DeckControl>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[290px]">
          {locations.map((loc, i) => (
            <CarouselCard
              key={loc.slug}
              loc={loc}
              i={i}
              active={active}
              tripSlug={tripSlug}
              onSelect={setActive}
            />
          ))}
        </div>
      </div>

      {/* ── Mobile / tablet top bar ─────────────────────────────────────── */}
      <div className="absolute inset-x-[18px] top-[calc(env(safe-area-inset-top,0px)+16px)] z-10 flex items-center justify-between lg:hidden">
        <Wordmark />
        <Link
          href={upcomingCount > 0 ? "/trips" : "/new"}
          className="inline-flex h-[34px] items-center gap-1.5 rounded-full border border-white/[0.34] bg-white/12 px-3 text-[12px] font-semibold text-white backdrop-blur-sm"
        >
          {upcomingCount > 0 ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
              {upcomingCount} more {upcomingCount === 1 ? "trip" : "trips"}
            </>
          ) : (
            <>
              <Plus className="h-[13px] w-[13px]" /> Add a trip
            </>
          )}
        </Link>
      </div>

      {/* ── Mobile / tablet title block ─────────────────────────────────── */}
      <div className="atelier-rise absolute inset-x-[18px] top-[calc(env(safe-area-inset-top,0px)+88px)] z-[8] max-w-[620px] lg:hidden">
        <div className="mb-3">
          <StatusChip label={status} />
        </div>
        <h1 className="font-display text-[clamp(2.0625rem,4.5vw,3rem)] font-semibold leading-[1.06] tracking-[-0.02em] [text-shadow:0_2px_24px_rgba(0,0,0,0.34)] [text-wrap:balance]">
          {tripName}
        </h1>
        {tripWindow && (
          <div className="mt-4 flex items-center gap-2 text-[13px] text-white/90">
            <CalendarDays className="h-[15px] w-[15px]" />
            {tripWindow}
          </div>
        )}
        {fromPrice != null && (
          <div className="mt-2 flex items-center gap-2 text-[13px] text-white/90">
            <Coins className="h-[15px] w-[15px]" />
            From {formatGBP(fromPrice)}
            {perPerson != null && <> · ~{formatGBP(perPerson)}pp</>}
          </div>
        )}
      </div>

      {/* ── Mobile / tablet deck: swipe rail + dots ─────────────────────── */}
      <div
        role="group"
        aria-roledescription="carousel"
        aria-label="Locations in the running"
        onKeyDown={onDeckKeyDown}
        className="absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom,0px)+24px)] z-[9] lg:hidden"
      >
        <div className="flex items-end justify-between px-[18px] pb-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.09em] text-white/[0.74]">
            Choosing between · {locations.length}
          </span>
          <span aria-live="polite" aria-atomic className="font-display text-[15px] italic text-white">
            {activeLoc.name}, {activeLoc.country}
          </span>
        </div>
        <div
          ref={railRef}
          className="no-scrollbar flex gap-3 overflow-x-auto px-[18px] pb-1.5 pt-2.5 [scroll-snap-type:x_mandatory]"
        >
          {locations.map((loc, i) => (
            <MobileCard key={loc.slug} loc={loc} i={i} active={active} tripSlug={tripSlug} onPick={pick} />
          ))}
        </div>
        {/* Each dot is a 44×44 target; the visible dot stays small inside it. */}
        <div className="flex justify-center">
          {locations.map((loc, i) => (
            <button
              key={loc.slug}
              type="button"
              onClick={() => pick(i)}
              aria-label={`Show ${loc.name}`}
              aria-current={active === i}
              className="flex h-11 w-11 items-center justify-center"
            >
              <span
                aria-hidden
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: active === i ? 18 : 6,
                  background: active === i ? "#fff" : "rgba(255,255,255,0.42)",
                  transition: reduceMotion ? "background 0.3s" : undefined,
                }}
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Photographic fill (next/image) or a brand gradient Cover for "photo to come".
 *  Remote URLs rot (Unsplash/Booking hotlinks), so a load failure also falls
 *  back to the Cover — the hero must never be a black void behind the title. */
function HeroFill({ loc, active, priority }: { loc: DeckLocation; active: boolean; priority: boolean }) {
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  if (loc.image && !failed) {
    return (
      <Image
        src={loc.image}
        alt={loc.imageAlt ?? ""}
        fill
        priority={priority}
        sizes="100vw"
        onError={() => setFailed(true)}
        className={cn(
          "object-cover",
          // Ken Burns settle is motion-gated; the parent opacity crossfade is
          // the reduced-motion alternative.
          !reduceMotion && [
            "transition-transform duration-[1600ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
            active ? "scale-[1.06]" : "scale-[1.14]",
          ],
        )}
      />
    );
  }
  return <Cover seed={loc.slug} className="absolute inset-0 h-full w-full" />;
}

/** The shared postcard face: photo/gradient, scrim, name, country, price. */
function CardFace({
  loc,
  active,
  sizes,
  showArrow,
}: {
  loc: DeckLocation;
  active: boolean;
  sizes: string;
  showArrow: boolean;
}) {
  // A failed remote photo degrades to the Cover gradient, quietly — the
  // "Photo to come" badge is reserved for images that were never added.
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion();
  return (
    <>
      {loc.image && !failed ? (
        <Image
          src={loc.image}
          alt={loc.imageAlt ?? ""}
          fill
          sizes={sizes}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover",
            !reduceMotion && [
              "transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
              active ? "scale-[1.06]" : "scale-100",
            ],
          )}
        />
      ) : (
        <>
          <Cover seed={loc.slug} className="absolute inset-0 h-full w-full" />
          {!loc.image && (
            <span className="absolute right-2 top-2 z-10 text-[8.5px] font-semibold uppercase tracking-[0.05em] text-white/70">
              Photo to come
            </span>
          )}
        </>
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.66),transparent_56%)]"
      />
      <div className="absolute inset-x-3 bottom-3">
        <div className="font-display text-[18px] font-semibold leading-none text-white">{loc.name}</div>
        <div className="mt-0.5 text-[11px] text-white/80">{loc.country}</div>
        <div className="mt-[7px] flex items-center justify-between">
          {loc.from != null ? (
            <span className="text-[11.5px] font-bold text-white">From {formatGBP(loc.from)}</span>
          ) : (
            <span className="text-[10.5px] font-semibold text-white/80">Researching</span>
          )}
          {showArrow && <ArrowRight className="h-[15px] w-[15px] text-white" />}
        </div>
      </div>
    </>
  );
}

/** A card in the desktop carousel. Transforms are computed from distance to active. */
function CarouselCard({
  loc,
  i,
  active,
  tripSlug,
  onSelect,
}: {
  loc: DeckLocation;
  i: number;
  active: number;
  tripSlug: string;
  onSelect: (i: number) => void;
}) {
  const [hover, setHover] = useState(false);
  const reduceMotion = useReducedMotion();
  const d = i - active;
  const ad = Math.abs(d);
  const isActive = ad === 0;

  // The fan's static composition (offsets, rotation, scale) is layout and
  // stays under reduced motion; the hover lift/straighten and the animated
  // transform transition are the motion, and those are gated.
  const baseTy = ad === 0 ? -26 : ad === 1 ? 2 : 16;
  const ty = baseTy - (hover && !isActive && !reduceMotion ? 12 : 0);
  const rot = hover && !isActive && !reduceMotion ? 0 : d * 3.5;
  const scale = ad === 0 ? 1.06 : ad === 1 ? 0.98 : ad === 2 ? 0.9 : 0.85;
  const baseOpacity = ad === 0 ? 1 : ad === 1 ? 1 : ad === 2 ? 0.5 : ad === 3 ? 0.16 : 0;
  const opacity = hover && baseOpacity > 0.1 ? Math.max(baseOpacity, 0.95) : baseOpacity;

  return (
    <div
      data-deck-card
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        "absolute bottom-0 left-1/2 -ml-[95px] h-[250px] w-[190px] overflow-hidden rounded-2xl border-[3px] border-white",
        // Far cards fold away below ~1366px so the fan never reaches the title.
        ad >= 2 && "deck-far",
      )}
      style={{
        transformOrigin: "bottom center",
        // The horizontal spread tracks the fluid deck width via --deck-gap.
        transform: `translateX(calc(${d} * var(--deck-gap, 146px))) translateY(${ty}px) rotate(${rot}deg) scale(${scale})`,
        opacity,
        pointerEvents: baseOpacity < 0.2 ? "none" : "auto",
        zIndex: isActive ? 100 : hover ? 95 : 90 - ad * 10,
        boxShadow: isActive || hover ? "0 16px 34px rgba(0,0,0,0.40)" : "0 10px 24px rgba(0,0,0,0.30)",
        transition: reduceMotion
          ? "opacity 0.55s, box-shadow 0.35s"
          : `transform 0.55s ${EASE}, opacity 0.55s, box-shadow 0.35s`,
      }}
    >
      {isActive ? (
        <Link
          href={`/${tripSlug}/${loc.slug}`}
          className="absolute inset-0 block"
          aria-label={`Open ${loc.name}, ${loc.country}`}
        >
          <CardFace loc={loc} active sizes="190px" showArrow />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onSelect(i)}
          className="absolute inset-0 block text-left"
          aria-label={`Preview ${loc.name}, ${loc.country}`}
        >
          <CardFace loc={loc} active={false} sizes="190px" showArrow={false} />
        </button>
      )}
    </div>
  );
}

/** A card in the mobile swipe rail. */
function MobileCard({
  loc,
  i,
  active,
  tripSlug,
  onPick,
}: {
  loc: DeckLocation;
  i: number;
  active: number;
  tripSlug: string;
  onPick: (i: number) => void;
}) {
  const isActive = active === i;
  const reduceMotion = useReducedMotion();
  return (
    <div
      data-deck-card
      className="relative h-[178px] w-[150px] flex-shrink-0 overflow-hidden rounded-2xl border-[2.5px] [scroll-snap-align:center] md:h-[206px] md:w-[174px]"
      style={{
        borderColor: isActive ? "#fff" : "rgba(255,255,255,0.34)",
        // Selection still reads through border, opacity and shadow when the
        // lift is motion-gated away.
        transform: isActive && !reduceMotion ? "translateY(-10px)" : "none",
        opacity: isActive ? 1 : 0.82,
        boxShadow: isActive ? "0 22px 40px rgba(0,0,0,0.46)" : "0 8px 20px rgba(0,0,0,0.32)",
        transition: reduceMotion
          ? "opacity 0.42s, border-color 0.42s, box-shadow 0.42s"
          : `transform 0.42s ${EASE}, opacity 0.42s, box-shadow 0.42s, border-color 0.42s`,
      }}
    >
      {isActive ? (
        <Link
          href={`/${tripSlug}/${loc.slug}`}
          className="absolute inset-0 block"
          aria-label={`Open ${loc.name}, ${loc.country}`}
        >
          <CardFace loc={loc} active sizes="(min-width: 768px) 174px, 150px" showArrow />
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => onPick(i)}
          className="absolute inset-0 block text-left"
          aria-label={`Show ${loc.name}, ${loc.country}`}
        >
          <CardFace loc={loc} active={false} sizes="(min-width: 768px) 174px, 150px" showArrow={false} />
        </button>
      )}
    </div>
  );
}

/** A 34px glass circle control for the desktop carousel. */
function DeckControl({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-[34px] w-[34px] items-center justify-center rounded-full border border-white/40 bg-white/12 text-white backdrop-blur-sm transition-opacity hover:bg-white/20 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/** Holiday Planner wordmark, light (on-photo) variant — mirrors SiteHeader's mark. */
function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/50 bg-white/[0.16] text-white backdrop-blur-sm">
        <Plane className="h-[15px] w-[15px]" />
      </span>
      <span className="whitespace-nowrap font-display text-[18px] font-semibold tracking-[-0.01em] text-white">
        Holiday Planner
      </span>
    </div>
  );
}

/** Status chip — a dot + label so it never relies on colour alone (light variant). */
function StatusChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.34] bg-white/[0.18] py-1 pl-2 pr-2.5 text-[12px] font-semibold text-white backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
      {label}
    </span>
  );
}
