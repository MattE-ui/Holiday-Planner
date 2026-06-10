import { MessageCircle } from "lucide-react";
import { addNoteAction, deleteNoteAction } from "@/lib/social-actions";
import type { Note } from "@/lib/social";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Family notes — a quiet, journal-margin list rather than a comment thread.
// One section per scope: the trip in general, a location, or a single stay.
// Server component; the add/delete forms post straight to server actions.
// ---------------------------------------------------------------------------

const dateFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const dateFmtFull = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function noteDate(iso: string): string {
  const d = new Date(iso);
  return d.getFullYear() === new Date().getFullYear() ? dateFmt.format(d) : dateFmtFull.format(d);
}

export function NotesSection({
  title = "Family notes",
  intro,
  tripSlug,
  locationSlug,
  holidaySlug,
  notes,
  member,
  owner,
  path,
  placeholder = "Leave a note for the others…",
  className,
}: {
  title?: string;
  /** One quiet line under the heading, e.g. "Anything about Crete in general." */
  intro?: string;
  tripSlug: string;
  locationSlug?: string;
  holidaySlug?: string;
  /** Already filtered to this exact scope. */
  notes: Note[];
  member?: string;
  owner: boolean;
  path: string;
  placeholder?: string;
  className?: string;
}) {
  return (
    <section className={cn("max-w-[680px]", className)}>
      <h2 className="inline-flex items-center gap-2.5 font-display text-2xl font-semibold tracking-[-0.01em] text-foreground">
        <MessageCircle className="h-5 w-5 text-accent" aria-hidden />
        {title}
        {notes.length > 0 && (
          <span className="text-[15px] font-normal text-muted-foreground">· {notes.length}</span>
        )}
      </h2>
      {intro && <p className="mt-1.5 text-[14px] text-muted-foreground">{intro}</p>}

      {notes.length > 0 && (
        <ul className="mt-5 flex flex-col">
          {notes.map((n) => (
            <li key={n.id} className="flex gap-3.5 border-t py-4 first:border-t-0 first:pt-1">
              <span
                aria-hidden
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-[12.5px] font-bold text-accent-foreground"
              >
                {n.author[0]?.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span className="text-[13.5px] font-bold text-foreground">{n.author}</span>
                  <time dateTime={n.createdAt} className="text-[12px] text-muted-foreground">
                    {noteDate(n.createdAt)}
                  </time>
                  {(owner || n.author === member) && (
                    <form action={deleteNoteAction.bind(null, n.id, path)} className="ml-auto">
                      <button
                        type="submit"
                        className="text-[12px] font-medium text-muted-foreground underline-offset-2 hover:text-danger hover:underline"
                      >
                        Remove
                      </button>
                    </form>
                  )}
                </div>
                <p className="mt-1 whitespace-pre-line text-[14.5px] leading-[1.55] text-foreground/85 [text-wrap:pretty]">
                  {n.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {member ? (
        <form action={addNoteAction} className={cn(notes.length > 0 ? "mt-2 border-t pt-5" : "mt-5")}>
          <input type="hidden" name="tripSlug" value={tripSlug} />
          {locationSlug && <input type="hidden" name="locationSlug" value={locationSlug} />}
          {holidaySlug && <input type="hidden" name="holidaySlug" value={holidaySlug} />}
          <input type="hidden" name="path" value={path} />
          <label htmlFor={`note-${locationSlug ?? "trip"}-${holidaySlug ?? "all"}`} className="sr-only">
            Add a note
          </label>
          <textarea
            id={`note-${locationSlug ?? "trip"}-${holidaySlug ?? "all"}`}
            name="body"
            required
            rows={2}
            maxLength={2000}
            placeholder={placeholder}
            className="w-full resize-y rounded-2xl border border-input bg-card px-4 py-3 text-[14.5px] leading-[1.5] text-foreground placeholder:text-[hsl(199_14%_38%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-2.5 flex items-center justify-between gap-3">
            <span className="text-[12.5px] text-muted-foreground">Noting as {member}</span>
            <button
              type="submit"
              className="h-9 rounded-full bg-primary px-4 text-[13px] font-bold text-primary-foreground"
            >
              Add note
            </button>
          </div>
        </form>
      ) : (
        <p className={cn("text-[13.5px] text-muted-foreground", notes.length > 0 ? "mt-2 border-t pt-5" : "mt-4")}>
          Say who&rsquo;s looking (top of the page) to leave a note or cast a pick.
        </p>
      )}
    </section>
  );
}
