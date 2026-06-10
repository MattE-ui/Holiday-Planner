import Link from "next/link";
import { notFound } from "next/navigation";
import { Link2 } from "lucide-react";
import { getLocation } from "@/lib/store";
import { createStay } from "@/lib/actions";
import { FormPage } from "@/components/form";
import { StayForm } from "@/components/stay-form";
import { ownerGuard } from "@/lib/member";

export const dynamic = "force-dynamic";

export default async function AddStayPage({
  params,
}: {
  params: { trip: string; location: string };
}) {
  ownerGuard(`/${params.trip}/${params.location}`);
  const { trip, location } = await getLocation(params.trip, params.location);
  if (!trip || !location) notFound();

  return (
    <FormPage
      backHref={`/${trip.slug}/${location.slug}`}
      backLabel={`Staying in ${location.name}`}
      title={`Add a stay in ${location.name}`}
      lede="Fill in what you know — only the name is required, and any cost left blank shows honestly as “to confirm”."
    >
      <Link
        href={`/import?trip=${trip.slug}&location=${location.slug}`}
        className="mb-2 inline-flex h-11 items-center gap-2 rounded-full border border-input bg-card px-5 text-[14px] font-semibold text-primary shadow-soft transition-colors hover:bg-muted"
      >
        <Link2 className="h-4 w-4" /> Got a Booking.com link? Import it instead
      </Link>
      <StayForm
        action={createStay.bind(null, trip.slug, location.slug)}
        cancelHref={`/${trip.slug}/${location.slug}`}
        submitLabel="Add stay"
      />
    </FormPage>
  );
}
