// ---------------------------------------------------------------------------
// Slug helpers shared by every store backend.
// ---------------------------------------------------------------------------

/** Route segments that must never be shadowed by a generated slug. */
const RESERVED = new Set(["new", "import", "trips", "add", "edit", "api"]);

export function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip combining accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "untitled";
}

export function uniqueSlug(name: string, taken: Iterable<string>): string {
  const existing = new Set(taken);
  let slug = slugify(name);
  if (RESERVED.has(slug)) slug = `${slug}-1`;
  let candidate = slug;
  for (let n = 2; existing.has(candidate); n++) candidate = `${slug}-${n}`;
  return candidate;
}
