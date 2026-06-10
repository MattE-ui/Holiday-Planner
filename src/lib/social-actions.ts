"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  COOKIE_MAX_AGE,
  MEMBER_COOKIE,
  cleanMemberName,
  getMember,
  isOwner,
} from "@/lib/member";
import * as social from "@/lib/social";

// ---------------------------------------------------------------------------
// Server actions for the family layer: who's looking, votes, and notes.
// These are open to every visitor (unlike the owner-gated plan mutations) —
// the only requirement is having introduced yourself, since a vote or note
// without a name means nothing in a family decision.
// ---------------------------------------------------------------------------

function refresh() {
  revalidatePath("/", "layout");
}

/** Back to wherever the form lived; guards against off-site values. */
function backTo(path: string | undefined): never {
  redirect(path && path.startsWith("/") ? path : "/");
}

/** The member banner: introduce yourself (or hand the device to someone else). */
export async function setMemberAction(formData: FormData) {
  const name = cleanMemberName(formData.get("name") as string | null);
  if (name) {
    cookies().set(MEMBER_COOKIE, name, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  } else {
    cookies().delete(MEMBER_COOKIE);
  }
  refresh();
  backTo(formData.get("path") as string | undefined);
}

/** Mark (or unmark) a stay as my favourite within its location. */
export async function voteStayAction(
  tripSlug: string,
  locationSlug: string,
  holidaySlug: string | null,
  path: string,
) {
  const member = getMember();
  if (!member) return;
  await social.setStayVote(tripSlug, locationSlug, member, holidaySlug);
  refresh();
  backTo(path);
}

/** Mark (or unmark) a location as my overall pick for the trip. */
export async function voteLocationAction(
  tripSlug: string,
  locationSlug: string | null,
  path: string,
) {
  const member = getMember();
  if (!member) return;
  await social.setLocationVote(tripSlug, member, locationSlug);
  refresh();
  backTo(path);
}

/** Leave a note on the trip, a location, or a stay (scope via hidden fields). */
export async function addNoteAction(formData: FormData) {
  const member = getMember();
  const body = (formData.get("body") as string | null)?.trim().slice(0, 2000);
  const tripSlug = formData.get("tripSlug") as string | null;
  if (!member || !body || !tripSlug) return;
  await social.addNote({
    tripSlug,
    locationSlug: (formData.get("locationSlug") as string | null) || undefined,
    holidaySlug: (formData.get("holidaySlug") as string | null) || undefined,
    author: member,
    body,
  });
  refresh();
  backTo(formData.get("path") as string | undefined);
}

/** Remove a note — your own, or any note if you're the owner. */
export async function deleteNoteAction(id: string, path: string) {
  const member = getMember();
  const note = await social.getNote(id);
  if (!note) return;
  if (note.author !== member && !isOwner()) return;
  await social.deleteNote(id);
  refresh();
  backTo(path);
}
