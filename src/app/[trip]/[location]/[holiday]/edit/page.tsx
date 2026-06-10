import { notFound } from "next/navigation";
import { getHoliday } from "@/lib/store";
import { deleteStay, updateStay } from "@/lib/actions";
import { FormPage } from "@/components/form";
import { StayForm } from "@/components/stay-form";
import { DeleteButton } from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function EditStayPage({
  params,
}: {
  params: { trip: string; location: string; holiday: string };
}) {
  const { trip, location, holiday } = await getHoliday(params.trip, params.location, params.holiday);
  if (!trip || !location || !holiday) notFound();

  const backHref = `/${trip.slug}/${location.slug}/${holiday.slug}`;

  return (
    <FormPage backHref={backHref} backLabel={holiday.name} title={`Edit ${holiday.name}`}>
      <StayForm
        action={updateStay.bind(null, trip.slug, location.slug, holiday.slug)}
        initial={holiday}
        cancelHref={backHref}
        submitLabel="Save changes"
      />
      <div className="mt-10 rounded-[14px] border border-danger/25 bg-danger/[0.03] p-5">
        <h2 className="font-display text-lg font-semibold text-foreground">Delete this stay</h2>
        <p className="mt-1 text-[13.5px] text-muted-foreground">
          Removes {holiday.name} from {location.name}. There&rsquo;s no undo.
        </p>
        <DeleteButton
          action={deleteStay.bind(null, trip.slug, location.slug, holiday.slug)}
          confirmText={`Delete "${holiday.name}"?`}
          className="mt-4"
        >
          Delete stay
        </DeleteButton>
      </div>
    </FormPage>
  );
}
