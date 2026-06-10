"use client";

import { usePathname } from "next/navigation";
import { UserRound } from "lucide-react";
import { setMemberAction } from "@/lib/social-actions";

/**
 * "Who's looking?" — the whole identity system. Until a name is given, a slim
 * banner under the header invites it; votes and notes need a name to mean
 * anything. Once set it lives in a cookie for a year and the header shows a
 * quiet chip with a switch control (family devices get shared).
 */
export function MemberBanner({ member }: { member?: string }) {
  const path = usePathname() || "/";
  if (member) return null;
  return (
    <div className="border-b bg-muted/50">
      <form
        action={setMemberAction}
        className="container flex flex-wrap items-center gap-x-4 gap-y-2 py-2.5"
      >
        <input type="hidden" name="path" value={path} />
        <span className="inline-flex items-center gap-2 text-[13.5px] font-medium text-foreground">
          <UserRound className="h-4 w-4 text-accent" aria-hidden />
          Who&rsquo;s looking?
        </span>
        <span className="hidden text-[13px] text-muted-foreground sm:inline">
          Add your first name so your picks and notes carry it.
        </span>
        <div className="flex items-center gap-2">
          <label htmlFor="member-name" className="sr-only">
            Your first name
          </label>
          <input
            id="member-name"
            name="name"
            required
            maxLength={24}
            autoComplete="given-name"
            placeholder="First name"
            className="h-8 w-36 rounded-full border border-input bg-card px-3.5 text-[13px] text-foreground placeholder:text-[hsl(199_14%_38%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="h-8 rounded-full bg-primary px-3.5 text-[12.5px] font-bold text-primary-foreground"
          >
            That&rsquo;s me
          </button>
        </div>
      </form>
    </div>
  );
}

/** The header chip once a name is set: "Sarah is looking" + a switch form. */
export function MemberChip({ member }: { member: string }) {
  const path = usePathname() || "/";
  return (
    <details className="group relative">
      <summary className="flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-full border border-input px-3 text-[13px] font-semibold text-foreground transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
          {member[0]?.toUpperCase()}
        </span>
        {member}
      </summary>
      <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 rounded-2xl border bg-card p-4 shadow-lift">
        <p className="text-[13px] text-muted-foreground">
          Votes and notes are saved as <span className="font-semibold text-foreground">{member}</span>.
          Handing the device to someone else?
        </p>
        <form action={setMemberAction} className="mt-3 flex items-center gap-2">
          <input type="hidden" name="path" value={path} />
          <label htmlFor="member-switch" className="sr-only">
            New name
          </label>
          <input
            id="member-switch"
            name="name"
            required
            maxLength={24}
            placeholder="New name"
            className="h-8 min-w-0 flex-1 rounded-full border border-input bg-card px-3 text-[13px] text-foreground placeholder:text-[hsl(199_14%_38%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="h-8 shrink-0 rounded-full bg-primary px-3 text-[12px] font-bold text-primary-foreground"
          >
            Switch
          </button>
        </form>
      </div>
    </details>
  );
}
