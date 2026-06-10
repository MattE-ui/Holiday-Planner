import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Form primitives shared by every create/edit screen. Calm, editorial inputs:
// generous padding, soft borders, the teal ring on focus. No "use client" —
// these compile into whichever bundle imports them.
// ---------------------------------------------------------------------------

export const inputClass =
  "w-full rounded-[12px] border border-input bg-card px-3.5 py-2.5 text-[15px] text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:opacity-60";

export function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-[13.5px] font-semibold text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12.5px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={3} {...props} className={cn(inputClass, "leading-[1.5]", props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputClass, "appearance-none pr-9", props.className)} />;
}

export function CheckboxField({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-[12px] border border-input bg-card px-3.5 py-2.5 text-[14.5px] font-medium text-foreground has-[:checked]:border-primary has-[:checked]:bg-[hsl(190_40%_96%)]">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 accent-[hsl(var(--primary))]"
      />
      {label}
    </label>
  );
}

/** A titled group of fields — mirrors the detail page's Section headings. */
export function FormSection({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-9 first:mt-0">
      <h2 className="font-display text-[22px] font-semibold tracking-[-0.01em] text-foreground">
        {title}
      </h2>
      {hint && <p className="mt-1 text-[13.5px] text-muted-foreground">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** The standard editorial page shell for form screens. */
export function FormPage({
  backHref,
  backLabel,
  title,
  lede,
  children,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <div className="mx-auto max-w-[760px] px-6 pb-16 pt-8 sm:px-8">
        <a
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          ← {backLabel}
        </a>
        <h1 className="mt-3.5 font-display text-[clamp(2rem,4.5vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-foreground">
          {title}
        </h1>
        {lede && (
          <p className="mt-3 max-w-[560px] text-[16px] leading-[1.55] text-muted-foreground [text-wrap:pretty]">
            {lede}
          </p>
        )}
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
