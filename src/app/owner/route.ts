import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_MAX_AGE, OWNER_COOKIE } from "@/lib/member";

// Visiting /owner?key=<OWNER_KEY> unlocks editing on this device; /owner with
// no key (or a wrong one) locks it again. Always lands back on the homepage —
// the edit chrome appearing/disappearing is the feedback.
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key");
  if (key && process.env.OWNER_KEY && key === process.env.OWNER_KEY) {
    cookies().set(OWNER_COOKIE, key, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  } else {
    cookies().delete(OWNER_COOKIE);
  }
  redirect("/");
}
