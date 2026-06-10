import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// ---------------------------------------------------------------------------
// Identity, deliberately account-free. Two cookies:
//
//  hp-member  — the family member's self-chosen first name ("who's looking?").
//               Set once per device via the member banner; every vote and note
//               carries it.
//  hp-owner   — the owner key. Editing (add/edit/delete/import) is allowed
//               only when it matches the OWNER_KEY env var. When OWNER_KEY is
//               unset (local dev, pre-setup deploys) everyone is the owner,
//               which preserves the original open behaviour.
//
// Unlock by visiting /owner?key=<OWNER_KEY> once on your device.
// ---------------------------------------------------------------------------

export const MEMBER_COOKIE = "hp-member";
export const OWNER_COOKIE = "hp-owner";

/** A year — family planning is slow-burn; don't make anyone re-introduce themselves. */
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function cleanMemberName(raw: string | undefined | null): string | undefined {
  const name = raw?.trim().replace(/\s+/g, " ").slice(0, 24);
  return name?.length ? name : undefined;
}

/** The current member's name, or undefined before they've introduced themselves. */
export function getMember(): string | undefined {
  return cleanMemberName(cookies().get(MEMBER_COOKIE)?.value);
}

/** True when this device may edit the plan itself. */
export function isOwner(): boolean {
  const key = process.env.OWNER_KEY;
  if (!key) return true; // no key configured — open editing (local dev)
  return cookies().get(OWNER_COOKIE)?.value === key;
}

/** Page guard for the add/edit/import routes: non-owners land somewhere
 *  sensible instead of a form whose submission would be rejected anyway. */
export function ownerGuard(fallback: string = "/"): void {
  if (!isOwner()) redirect(fallback);
}
