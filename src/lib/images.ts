// ---------------------------------------------------------------------------
// Location imagery search for the full-bleed heroes. Two providers:
//  - Unsplash (editorial quality) when UNSPLASH_ACCESS_KEY is set in
//    .env.local — a free key from unsplash.com/developers
//  - Wikimedia Commons as the keyless fallback — real photos of real places,
//    quality varies more
// Server-only; results feed the ImagePicker grid.
// ---------------------------------------------------------------------------

export interface LocationImage {
  /** High-res URL for the hero (~2200px wide). */
  url: string;
  /** Smaller URL for the picker grid. */
  thumb: string;
  alt: string;
  credit?: string;
  source: "unsplash" | "wikimedia";
  width: number;
  height: number;
}

export async function searchLocationImages(query: string): Promise<LocationImage[]> {
  const q = query.trim();
  if (!q) return [];
  const key = process.env.UNSPLASH_ACCESS_KEY;
  // Ignore the .env.local placeholder so search falls straight to Wikimedia.
  if (key && !/^paste-/.test(key)) {
    try {
      const results = await searchUnsplash(q, key);
      if (results.length) return results;
    } catch {
      /* fall through to Wikimedia */
    }
  }
  return searchWikimedia(q);
}

async function searchUnsplash(query: string, key: string): Promise<LocationImage[]> {
  const url =
    "https://api.unsplash.com/search/photos?per_page=12&orientation=landscape&query=" +
    encodeURIComponent(query);
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${key}`, "Accept-Version": "v1" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Unsplash ${res.status}`);
  const data = (await res.json()) as {
    results: {
      urls: { raw: string; small: string };
      alt_description?: string | null;
      description?: string | null;
      width: number;
      height: number;
      user?: { name?: string };
    }[];
  };
  return (data.results ?? []).map((r) => ({
    url: `${r.urls.raw}&auto=format&fit=crop&w=2400&q=80`,
    thumb: r.urls.small,
    alt: r.alt_description ?? r.description ?? query,
    credit: r.user?.name ? `Photo by ${r.user.name} on Unsplash` : "Unsplash",
    source: "unsplash" as const,
    width: r.width,
    height: r.height,
  }));
}

async function searchWikimedia(query: string): Promise<LocationImage[]> {
  const url =
    "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6" +
    "&gsrlimit=24&prop=imageinfo&iiprop=url|size|mime|extmetadata&iiurlwidth=2200&format=json&origin=*" +
    "&gsrsearch=" +
    encodeURIComponent(query);
  const res = await fetch(url, {
    headers: { "User-Agent": "HolidayPlanner/0.1 (personal trip planner)" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Wikimedia ${res.status}`);
  const data = (await res.json()) as {
    query?: {
      pages?: Record<
        string,
        {
          title: string;
          imageinfo?: {
            url: string;
            thumburl?: string;
            mime?: string;
            width: number;
            height: number;
            extmetadata?: { Artist?: { value?: string } };
          }[];
        }
      >;
    };
  };

  const pages = Object.values(data.query?.pages ?? {});
  const images: LocationImage[] = [];
  for (const page of pages) {
    const ii = page.imageinfo?.[0];
    if (!ii) continue;
    // Photographs only — skip maps, flags, crests and small images.
    if (!/jpe?g/i.test(ii.mime ?? ii.url)) continue;
    if (ii.width < 1200) continue;
    if (/coat|crest|flag|locator|logo|escudo|wappen|karte\b|\bmap\b/i.test(page.title)) continue;

    const title = page.title.replace(/^File:/, "").replace(/\.[a-z]+$/i, "").replace(/_/g, " ");
    const display = ii.thumburl ?? ii.url;
    const artist = ii.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "").trim();
    images.push({
      url: display,
      thumb: thumbVariant(display, 480),
      alt: title,
      credit: artist ? `${artist} · Wikimedia Commons` : "Wikimedia Commons",
      source: "wikimedia",
      width: ii.width,
      height: ii.height,
    });
  }
  // Landscape first (these are full-bleed heroes), then sharpest.
  return images
    .sort((a, b) => {
      const landA = a.width > a.height ? 1 : 0;
      const landB = b.width > b.height ? 1 : 0;
      if (landA !== landB) return landB - landA;
      return b.width * b.height - a.width * a.height;
    })
    .slice(0, 12);
}

/** Derive a smaller wikimedia thumb from a sized thumburl; falls back to the
 *  original when the URL isn't the /thumb/ form. */
function thumbVariant(url: string, width: number): string {
  return url.replace(/\/(\d+)px-([^/]+)$/, `/${width}px-$2`);
}

/** Best automatic hero for a new location: top landscape result. Never
 *  throws — locations save fine without a photo (gradient stands in). */
export async function autoLocationImage(
  query: string,
): Promise<{ url: string; alt: string } | undefined> {
  try {
    const results = await searchLocationImages(query);
    const best = results.find((r) => r.width > r.height) ?? results[0];
    if (!best) return undefined;
    return { url: best.url, alt: best.credit ? `${best.alt} (${best.credit})` : best.alt };
  } catch {
    return undefined;
  }
}
