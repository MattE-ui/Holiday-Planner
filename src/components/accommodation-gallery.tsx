"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { Cover } from "@/components/cover";
import { cn } from "@/lib/utils";

/**
 * Full-bleed accommodation gallery: a large lead image with a 2×2 grid of
 * thumbnails. Clicking a thumbnail swaps it into the lead slot (active thumb
 * gets a teal outline). The final thumbnail carries an "All {photoCount} photos"
 * overlay. Falls back to the gradient `Cover` when a stay has no photos yet.
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
    <div className="flex flex-col gap-2 px-2 md:h-[472px] md:flex-row">
      {/* Lead image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-[18px] md:aspect-auto md:flex-[1.6_1_0%]">
        <Image
          src={images[active]}
          alt={alt}
          fill
          priority
          sizes="(min-width: 768px) 60vw, 100vw"
          className="object-cover"
        />
        {statusLabel && (
          <div className="absolute left-4 top-4">
            <StatusChip label={statusLabel} />
          </div>
        )}
      </div>

      {/* Thumbnails — a row on mobile, a 2×2 grid on desktop */}
      {thumbs.length > 0 && (
        <div className="grid grid-cols-4 gap-2 md:flex-1 md:grid-cols-2 md:grid-rows-2">
          {thumbs.map((src, k) => {
            const idx = k + 1;
            const isActive = active === idx;
            const last = k === thumbs.length - 1;
            return (
              <button
                key={src}
                type="button"
                onClick={() => setActive(idx)}
                aria-label={`Show photo ${idx + 1} of ${name}`}
                aria-pressed={isActive}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:aspect-auto",
                  isActive && "outline outline-[3px] -outline-offset-[3px] outline-primary",
                )}
              >
                <Image
                  src={src}
                  alt={`${name} photo ${idx + 1}`}
                  fill
                  sizes="(min-width: 768px) 20vw, 25vw"
                  className={cn(
                    "object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    isActive ? "scale-[1.04]" : "group-hover:scale-[1.03]",
                  )}
                />
                {last && photoCount > thumbs.length + 1 && (
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
  );
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
