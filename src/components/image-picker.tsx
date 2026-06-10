"use client";

import { useState, useTransition } from "react";
import { Check, ImageIcon, Loader2, Search } from "lucide-react";
import type { LocationImage } from "@/lib/images";
import { searchImages } from "@/lib/actions";
import { Field, Input } from "@/components/form";
import { cn } from "@/lib/utils";

/**
 * Cover-photo picker for the full-bleed heroes. Owns the form's `image` and
 * `imageAlt` fields: search high-res photos of the place (Wikimedia keyless;
 * Unsplash when a key is configured), click one to select it, or paste any
 * URL by hand. Selecting fills the alt text from the photo when it's blank.
 */
export function ImagePicker({
  initialQuery,
  defaultImage,
  defaultAlt,
}: {
  /** e.g. "Kalkan Turkey" — pre-fills the search box. */
  initialQuery?: string;
  defaultImage?: string;
  defaultAlt?: string;
}) {
  const [image, setImage] = useState(defaultImage ?? "");
  const [alt, setAlt] = useState(defaultAlt ?? "");
  const [query, setQuery] = useState(initialQuery ?? "");
  const [results, setResults] = useState<LocationImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const search = () => {
    if (!query.trim()) return;
    setError(null);
    startTransition(async () => {
      const r = await searchImages(query);
      if (!r.ok) {
        setError(r.error ?? "Image search failed.");
        return;
      }
      setResults(r.images);
      if (r.images.length === 0) setError("No photos found — try different words, e.g. add the region or “harbour”.");
    });
  };

  const pick = (img: LocationImage) => {
    setImage(img.url);
    if (!alt.trim()) setAlt(img.credit ? `${img.alt} (${img.credit})` : img.alt);
  };

  return (
    <div className="grid gap-4">
      {/* Selection preview + the actual form fields */}
      <div className="flex gap-4">
        <div className="relative h-[92px] w-[150px] shrink-0 overflow-hidden rounded-[12px] border bg-muted">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground">
              <ImageIcon className="h-6 w-6" aria-hidden />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <Field label="Cover photo URL" hint="Pick from the search below, or paste any image URL.">
            <Input
              name="image"
              type="url"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>
      </div>
      <Field label="Photo alt text" hint="Describe the scene — it's part of the voice.">
        <Input name="imageAlt" value={alt} onChange={(e) => setAlt(e.target.value)} />
      </Field>

      {/* Search */}
      <div>
        <span className="mb-1.5 block text-[13.5px] font-semibold text-foreground">
          Find a photo
        </span>
        <div className="flex gap-2.5">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            placeholder="e.g. Kalkan Turkey harbour"
            aria-label="Photo search"
          />
          <button
            type="button"
            onClick={search}
            disabled={pending || !query.trim()}
            className="inline-flex h-[46px] shrink-0 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-bold text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {pending ? "Searching…" : "Find photos"}
          </button>
        </div>
        {error && <p className="mt-2 text-[13px] font-semibold text-warning">{error}</p>}

        {results && results.length > 0 && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {results.map((img) => {
                const selected = image === img.url;
                return (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => pick(img)}
                    aria-label={`Use photo: ${img.alt}`}
                    aria-pressed={selected}
                    className={cn(
                      "group relative aspect-[3/2] overflow-hidden rounded-[10px] border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      selected && "outline outline-[3px] -outline-offset-[3px] outline-primary",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.thumb}
                      alt={img.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-[rgba(8,28,34,0.62)] px-2 py-1 text-left text-[10.5px] text-white">
                      {img.width}×{img.height} · {img.credit ?? img.source}
                    </span>
                    {selected && (
                      <span className="absolute right-1.5 top-1.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3.5 w-3.5" aria-hidden />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-[12px] text-muted-foreground">
              {results[0].source === "wikimedia"
                ? "Photos from Wikimedia Commons. For editorial-quality results, add a free UNSPLASH_ACCESS_KEY to .env.local."
                : "Photos from Unsplash."}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
