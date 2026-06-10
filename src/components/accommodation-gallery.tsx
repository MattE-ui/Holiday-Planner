"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Camera, ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { Cover } from "@/components/cover";
import { cn } from "@/lib/utils";

/**
 * Full-bleed accommodation gallery: a large lead image with a 2×2 grid of
 * thumbnails. Clicking a thumbnail swaps it into the lead slot; clicking the
 * lead (or the "All n photos" tile) opens a fullscreen lightbox over the
 * complete photo set, with arrow/keyboard navigation.
 *
 * Booking photos are stored as bstatic URLs whose size is a path token — each
 * context re-derives the right size (thumbs small, lead big, lightbox max),
 * which also upgrades stays saved before the high-res change.
 */
export function AccommodationGallery({
  images,
  alt,
  name,
  slug,
  photoCount,
  statusLabel,
}: {
  /** Cover image first, then any extra photos. May be empty. */
  images: string[];
  alt: string;
  name: string;
  slug: string;
  /** Honest count of images we actually hold (cover + photos). */
  photoCount: number;
  statusLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  // No photos: show the deterministic brand gradient instead of a broken image.
  if (images.length === 0) {
    return (
      <div className="px-2">
        <Cover seed={slug} className="h-[300px] rounded-[18px] md:h-[472px]">
          {statusLabel && (
            <div className="absolute left-4 top-4">
              <StatusChip label={statusLabel} />
            </div>
          )}
        </Cover>
      </div>
    );
  }

  const thumbs = images.slice(1, 5);

  return (
    <>
      <div className="flex flex-col gap-2 px-2 md:h-[472px] md:flex-row">
        {/* Lead image — click to open the lightbox at this photo. */}
        <button
          type="button"
          onClick={() => setLightbox(active)}
          aria-label={`View photo fullscreen — ${name}`}
          className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-[18px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:aspect-auto md:flex-[1.6_1_0%]"
        >
          <Image
            src={bstaticSize(images[active], "max1920x1080")}
            alt={alt}
            fill
            priority
            quality={85}
            sizes="(min-width: 768px) 60vw, 100vw"
            className="object-cover"
          />
          {statusLabel && (
            <span className="absolute left-4 top-4">
              <StatusChip label={statusLabel} />
            </span>
          )}
          <span className="absolute bottom-4 right-4 inline-flex h-9 items-center gap-2 rounded-full bg-[rgba(8,28,34,0.56)] px-3.5 text-[12.5px] font-semibold text-white backdrop-blur-sm transition-colors group-hover:bg-[rgba(8,28,34,0.75)]">
            <Expand className="h-3.5 w-3.5" aria-hidden /> Fullscreen
          </span>
        </button>

        {/* Thumbnails — a row on mobile, a 2×2 grid on desktop */}
        {thumbs.length > 0 && (
          <div className="grid grid-cols-4 gap-2 md:flex-1 md:grid-cols-2 md:grid-rows-2">
            {thumbs.map((src, k) => {
              const idx = k + 1;
              const isActive = active === idx;
              const last = k === thumbs.length - 1;
              const showAllOverlay = last && photoCount > thumbs.length + 1;
              return (
                <button
                  key={src}
                  type="button"
                  onClick={() => (showAllOverlay ? setLightbox(idx) : setActive(idx))}
                  aria-label={
                    showAllOverlay
                      ? `View all ${photoCount} photos of ${name}`
                      : `Show photo ${idx + 1} of ${name}`
                  }
                  aria-pressed={isActive}
                  className={cn(
                    "group relative aspect-square overflow-hidden rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:aspect-auto",
                    isActive && !showAllOverlay && "outline outline-[3px] -outline-offset-[3px] outline-primary",
                  )}
                >
                  <Image
                    src={bstaticSize(src, "max500")}
                    alt={`${name} photo ${idx + 1}`}
                    fill
                    sizes="(min-width: 768px) 20vw, 25vw"
                    className={cn(
                      "object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                      isActive ? "scale-[1.04]" : "group-hover:scale-[1.03]",
                    )}
                  />
                  {showAllOverlay && (
                    <span className="absolute inset-0 flex items-center justify-center gap-1.5 bg-[rgba(8,28,34,0.5)] text-sm font-bold text-white">
                      <Camera className="h-[17px] w-[17px]" aria-hidden /> All {photoCount} photos
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {lightbox != null && (
        <Lightbox
          images={images}
          name={name}
          start={lightbox}
          onClose={(finalIndex) => {
            setLightbox(null);
            setActive(finalIndex); // keep the lead in sync with where browsing ended
          }}
        />
      )}
    </>
  );
}

/** Fullscreen photo viewer over the complete set: arrows, keyboard (←/→/Esc),
 *  counter, click-outside to close. Plain <img> at the CDN's max size so the
 *  optimizer never re-compresses the big view. */
function Lightbox({
  images,
  name,
  start,
  onClose,
}: {
  images: string[];
  name: string;
  start: number;
  onClose: (finalIndex: number) => void;
}) {
  const [index, setIndex] = useState(start);
  const count = images.length;

  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count),
    [count],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose(index);
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    // Lock page scroll while the lightbox is open.
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [step, onClose, index]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photos of ${name}`}
      className="fixed inset-0 z-[100] flex flex-col bg-[rgba(5,16,20,0.96)]"
      onClick={() => onClose(index)}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 text-white">
        <span className="text-[13.5px] font-semibold tabular-nums text-white/80">
          {index + 1} / {count}
          <span className="ml-3 hidden font-normal text-white/50 sm:inline">{name}</span>
        </span>
        <button
          type="button"
          onClick={() => onClose(index)}
          aria-label="Close photo viewer"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Image */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-16">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={bstaticSize(images[index], "max3000")}
          alt={`${name} — photo ${index + 1} of ${count}`}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full select-none rounded-[10px] object-contain shadow-[0_20px_80px_rgba(0,0,0,0.5)]"
        />
        {/* Preload neighbours so arrowing feels instant. */}
        <link rel="preload" as="image" href={bstaticSize(images[(index + 1) % count], "max3000")} />
        <link rel="preload" as="image" href={bstaticSize(images[(index - 1 + count) % count], "max3000")} />

        {count > 1 && (
          <>
            <NavButton side="left" onClick={(e) => { e.stopPropagation(); step(-1); }}>
              <ChevronLeft className="h-6 w-6" />
            </NavButton>
            <NavButton side="right" onClick={(e) => { e.stopPropagation(); step(1); }}>
              <ChevronRight className="h-6 w-6" />
            </NavButton>
          </>
        )}
      </div>
    </div>
  );
}

function NavButton({
  side,
  onClick,
  children,
}: {
  side: "left" | "right";
  onClick: (e: React.MouseEvent) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous photo" : "Next photo"}
      className={cn(
        "absolute top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25",
        side === "left" ? "left-3 sm:left-5" : "right-3 sm:right-5",
      )}
    >
      {children}
    </button>
  );
}

/** Swap the size token in a bstatic photo URL; non-Booking URLs pass through.
 *  Also upgrades stays saved while the parser normalised to 1024px. */
function bstaticSize(url: string, size: string): string {
  if (!/\/\/cf\.bstatic\.com\/xdata\/images\/hotel\//.test(url)) return url;
  return url.replace(/\/xdata\/images\/hotel\/[^/]+\//, `/xdata/images/hotel/${size}/`);
}

/** Glass status chip over a photo — a dot + label, never colour alone. */
function StatusChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.34] bg-white/[0.18] py-1 pl-2 pr-2.5 text-[12px] font-semibold text-white backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-white" />
      {label}
    </span>
  );
}
