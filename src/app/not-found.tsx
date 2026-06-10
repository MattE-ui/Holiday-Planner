import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="font-display text-5xl font-semibold">404</p>
      <p className="mt-2 text-muted-foreground">That page doesn&apos;t exist.</p>
      <Link href="/" className="mt-6 inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
        Back to holidays
      </Link>
    </div>
  );
}
